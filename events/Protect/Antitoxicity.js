const { google } = require('googleapis');
const handleViolation = require("../../Structure/Util/handleViolation");
const Logs = require("../../Structure/Db/Models/logs/Logs");
const WhiteList = require('../../Structure/Db/Models/Whitelist/index');
const Antitoxicity = require('../../Structure/Db/Models/Protect/antitoxicity');
const { PermissionsBitField } = require("discord.js");
const userWarnings = new Map();
const usersWithToxicity = new Set();

// Table de conversion leetspeak basée sur l'image fournie
const leetMap = {
    '4': 'A', '@': 'A', '/-\\': 'A',
    '8': 'B',
    '(': 'C', '<': 'C', '[': 'C', '{': 'C',
    '|)': 'D', 'cl': 'D',
    '3': 'E',
    '|=': 'F', 'ph': 'F',
    '6': 'G', '&': 'G', '9': 'G',
    '#': 'H', '|-|': 'H', '[-]': 'H',
    '1': 'I', '!': 'I', '|': 'I', 'eye': 'I',
    '_|': 'J',
    '|<': 'K', '1<': 'K',
    '|_': 'L',
    '|\\/|': 'M', '|V|': 'M', '/\\/\\': 'M', '^^': 'M', 'em': 'M',
    '|\\|': 'N', '/\\/': 'N',
    '0': 'O', '()': 'O', '[]': 'O',
    '|>': 'P', '|D': 'P',
    '0_': 'Q',
    '|2': 'R',
    '5': 'S', '$': 'S',
    '7': 'T', '+': 'T', '|-': 'T',
    '|_|': 'U', '\\/\\': 'U',
    '\\/': 'V',
    '\\/\\/': 'W', 'VV': 'W', '\\X/': 'W',
    '><': 'X', '}{': 'X',
    '¥': 'Y', '`/': 'Y',
    '2': 'Z'
};

// Fonction pour convertir le leetspeak en texte normal
function convertLeetSpeak(text) {
    const regex = new RegExp(Object.keys(leetMap).map(leet => leet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    return text.replace(regex, match => leetMap[match] || match);
}

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (client, message) => {
        if (!message.guild || message.author.id === client.user.id) return;

        let data = await Antitoxicity.findOne({ where: { guildId: message.guild.id } });
        if (!data || !data.status) return;

        let member = message.guild.members.cache.get(message.author.id) || await message.guild.members.fetch(message.author.id).catch(() => null);
        if (!member) return;

        if (data.bypass_status) {
            if (data.wl_link) {
                let wl_links = data.wl_link.split(",");
                for (const wlLink of wl_links) {
                    if (message.content.includes(wlLink)) return;
                }
            }
            if (data.wl_users && data.wl_users.split(",").includes(message.author.id)) return;
            if (data.wl_role && message.member.roles.cache.some(role => data.wl_role.split(",").includes(role.id))) return;
            if (data.use_botWl) {
                let isWl = await WhiteList.findOne({
                    where: { guildId: message.guild.id, userId: message.author.id }
                });
                if (isWl) return;
            }
            if (data.use_botOwner && client.functions.isOwn(client, message.author.id)) return;
        }

        if (data.permission_allowed) {
            let hasPerm = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
                message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
            if (hasPerm) return;
        }

        // Conversion du leetspeak en texte normal
        const normalizedContent = convertLeetSpeak(message.content);

        const perspectiveClient = await google.discoverAPI(client.config.protect.toxicity_discovery).catch(err => {
            console.error('Erreur lors de la découverte de l\'API :', err);
            throw err;
        });

        const analyzeRequest = {
            comment: { text: normalizedContent }, // Analyse du texte normalisé
            requestedAttributes: { TOXICITY: {} },
            languages: ["en", "es", "fr", "de", "it", "ru", "pt"]
        };

        perspectiveClient.comments.analyze({
            key: client.config.api_key.google_api,
            resource: analyzeRequest
        }).then(
            async response => {
                const toxicityScore = response.data.attributeScores.TOXICITY.summaryScore.value;
                const toxicityThreshold = data.sensibility || 0.1;

                if (toxicityScore >= toxicityThreshold) {
                    await handleViolationAndWarnings(client, message, member, data, userWarnings, usersWithToxicity);
                    if (data.logs_status) {
                        if (data.logs) {
                            let logsc = await client.channels.cache.get(data.logs);
                            if (logsc) {
                                logsc.send({
                                    embeds: [{
                                        color: client.color,
                                        description: `**${message.author}** a envoyé un message non approprié.\n**Toxicité du message** : ${(toxicityScore * 100).toFixed(2)}%`,
                                        timestamp: new Date(),
                                        footer: client.footer,
                                        fields: [{
                                            name: 'Message',
                                            value: normalizedContent
                                        }],
                                        author: {
                                            name: message.author.tag,
                                            icon_url: message.author.displayAvatarURL({ dynamic: true })
                                        }
                                    }]
                                });
                            }
                        } else {
                            let logs = await Logs.findOne({ where: { guildId: message.guild.id } });
                            if (logs.logs_status) {
                                let logsc = client.channels.cache.get(logs.logs_channel);
                                if (logsc) {
                                    logsc.send({
                                        embeds: [{
                                            color: client.color,
                                            description: `**${message.author}** a envoyé un message non approprié.\n**Toxicité du message** : ${(toxicityScore * 100).toFixed(2)}%`,
                                            timestamp: new Date(),
                                            footer: client.footer,
                                            fields: [{
                                                name: 'Message',
                                                value: normalizedContent
                                            }],
                                            author: {
                                                name: message.author.tag,
                                                icon_url: message.author.displayAvatarURL({ dynamic: true })
                                            }
                                        }]
                                    });
                                }
                            }
                        }
                    }
                }
            }
        ).catch(err => {
            console.error('Erreur lors de l\'analyse de toxicité :', err);
        });
    }
};

async function handleViolationAndWarnings(client, message, member, data, userWarnings, usersWithToxicity) {
    usersWithToxicity.add(message.author.id);

    let warnings = userWarnings.get(message.author.id) || 0;
    warnings++;
    userWarnings.set(message.author.id, warnings);

    if (data.rep && warnings >= data.rep_limit) {
        userWarnings.delete(message.author.id);
        await handleViolation(member, data.sanction, data.sanction_admin, "Clarity Anti-toxicity system");
        usersWithToxicity.delete(message.author.id);
        await client.functions.tempMessage(message, `${message.author}, vous avez été sanctionné pour avoir envoyé un message contenant un taux de toxicité élevé. Avertissements : ${warnings}/${data.rep_limit}`, client);
    } else if (data.rep) {
        await client.functions.tempMessage(message, `${message.author}, vous avez reçu un avertissement pour avoir envoyé un message contenant un taux de toxicité élevé. Avertissements : ${warnings}/${data.rep_limit}`, client);
    } else {
        await handleViolation(member, data.sanction, data.sanction_admin, "Clarity Anti-toxicity system");
    }

    message.delete().catch(() => false);
}
