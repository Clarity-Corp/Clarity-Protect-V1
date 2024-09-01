const linksall = [
    "discord.gg",
    "dsc.bio",
    "www",
    "https",
    "Https",
    "Http",
    "HT",
    "HTTP",
    "HTTPS",
    "http",
    ".ga",
    ".fr",
    ".com",
    ".tk",
    ".ml",
    "://",
    ".gg",
    "discord.me",
    "discord.io",
    "invite.me",
    "discordapp.com/invite",
    "discord.me",
    "discord.io",
    "invite.me",
    "discordapp.com/invite",
];

const linksdsc = [
    "dsc.bio",
    "discord.gg",
    "discord.me",
    "discord.io",
    "invite.me",
    "discordapp.com/invite",
    ".gg"
];

const linkshttp = [
    "www",
    "https",
    "Https",
    "Http",
    "HT",
    "HTTP",
    "HTTPS",
    "http",
    ".ga",
    ".fr",
    ".com",
    ".tk",
    ".ml",
    "://",
];
const handleViolation = require("../../Structure/Util/handleViolation");
const userWarnings = new Map();
const usersWithLinks = new Set();
const Antilink = require('../../Structure/Db/Models/Protect/antilink');
const Logs = require("../../Structure/Db/Models/logs/Logs");
const Owner = require("../../Structure/Db/Models/Buyer/Owner")
const WhiteList = require('../../Structure/Db/Models/Whitelist/index')
const { PermissionsBitField } = require('discord.js');
module.exports = {
    name: "messageCreate",
    once: false,
    run: async (client, message) => {
        if (!message.guild || message.author.id === client.user.id) return;
        let data = await Antilink.findOne({
            where: { guildId: message.guild.id }
        });

        if (!data || !data.status) return;
        let member = message.guild.members.cache.get(message.author.id) || await message.guild.members.fetch(message.author.id).catch(() => null);
        if (!member) return;
        const regex = new RegExp(linksall.join('|'), 'i');
        const httpRegex = new RegExp(linkshttp.join('|'), 'i');
        const dscRegex = new RegExp(linksdsc.join('|'), 'i');
        const maskedLinkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
        const hiddenLinkRegex = /\|{2}[^|]+\|{2}/g;
        const codeBlockRegex = /```[\s\S]*?```/g;
        let containsLink = regex.test(message.content);
        let containsHttpLink = httpRegex.test(message.content);
        let containsDscLink = dscRegex.test(message.content);
        let containsMaskedLink = maskedLinkRegex.test(message.content);
        let containsHiddenLink = hiddenLinkRegex.test(message.content);

        let containsLinkInCodeBlock = false;
        const codeBlocks = message.content.match(codeBlockRegex);
        if (codeBlocks) {
            for (const block of codeBlocks) {
                if (regex.test(block)) {
                    containsLinkInCodeBlock = true;
                    break;
                }
            }
        }

        if (data.bypass_status) {
            if (data.wl_link) {
                let wl_links = data.wl_link ? data.wl_link.split(",") : [];
                if (wl_links.includes(message.content)) return;
            }
            if (data.wl_users) {
                let wl_users = data.wl_users ? data.wl_users.split(",") : [];
                if (wl_users.includes(message.author.id)) return;
            }
            if (data.wl_role) {
                let wl_roles = data.wl_role ? data.wl_role.split(",") : [];
                let hasRoleInWhitelist = wl_roles.length > 0 && message.member.roles.cache.some(role => wl_roles.includes(role.id));
                if (hasRoleInWhitelist) return;
            }
            if (data.use_botWl) {
                let isWl = await WhiteList.findOne({
                    where: { guildId: message.guild.id, userId: message.author.id }
                });
                if (isWl) return;
            }
            if (data.use_botOwner) {
                let isOwn = await Owner.findOne({
                    where: { botId: client.user.id, userId: message.author.id }
                });
                if (isOwn) return;
            }
        }

        if (data.permission_allowed) {
            let hasPerm = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
                message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
            if (hasPerm) return;
        }
        if ((data.link_type === "all" && (containsLink || containsMaskedLink || containsHiddenLink)) ||
            (data.link_type === "http" && (containsHttpLink || containsMaskedLink || containsHiddenLink)) ||
            (data.link_type === "dsc" && (containsDscLink || containsMaskedLink || containsHiddenLink))) {
            await handleViolationAndWarnings(client, message, member, data, userWarnings, usersWithLinks);
            if (data.logs_status) {
                if (data.logs) {
                    let logsc =  await client.channels.cache.get(data.logs)
                    if (logsc) logsc.send({
                        embeds: [{
                            title: "Lien envoyé",
                            description: `Un lien a été envoyé par ${message.author.tag} dans le salon ${message.channel.name}`,
                            fields: [{
                                name: "Lien",
                                value: message.content
                            }],
                            color: client.color,
                            timestamp: new Date(),
                            footer: client.footer
                        }]
                    })
                } else {
                    let logs = await Logs.findOne({
                        where: {
                            guildId: message.guild.id
                        }
                    });
                    if (logs.logs_status) {
                        let logsc =  client.channels.cache.get(logs.logs_channel)
                        if (logsc) await logs.send({
                            embeds: [{
                                title: "Lien envoyé",
                                description: `Un lien a été envoyé par ${message.author.tag} dans le salon ${message.channel.name}`,
                                fields: [{
                                    name: "Lien",
                                    value: message.content
                                }],
                                color: client.color,
                                timestamp: new Date(),
                                footer: client.footer
                            }]
                        })
                    }
                }
            }
        }



    }
}

async function handleViolationAndWarnings(client, message, member, data, userWarnings, usersWithLinks) {
    message.delete().catch(() => false);
    usersWithLinks.add(message.author.id);

    let warnings = userWarnings.get(message.author.id) || 0;
    warnings++;
    userWarnings.set(message.author.id, warnings);

    if (data.rep && warnings >= data.rep_limit) {
        userWarnings.delete(message.author.id);
        await handleViolation(member, data.sanction, data.sanction_admin, "Clarity Anti-link system");
        usersWithLinks.delete(message.author.id);
        await sendTemporaryMessage(message.channel, `${message.author}, vous avez été sanctionné pour avoir envoyé un lien non autorisé. Avertissements : ${warnings}/${data.rep_limit}`, client);
    } else if (data.rep) {
        await sendTemporaryMessage(message.channel, `${message.author}, vous avez reçu un avertissement pour avoir envoyé un lien non autorisé. Avertissements : ${warnings}/${data.rep_limit}`, client);
    } else {
        await handleViolation(member, data.sanction, data.sanction_admin, "Clarity Anti-link system");
    }
}

async function sendTemporaryMessage(channel, content, client) {
    await channel.send({ content }).then((m) => {
        setTimeout(() => {
            m.delete().catch(() => {});
        }, client.ms("5s"));
    });
}