const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    UserSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder
} = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const Logs = require("../../Structure/Models/logs/Logs");
const Antijoin = require("../../Structure/Models/Protect/antijoin")
module.exports = {
    name: "antijoin",
    description: "Manage antijoin module",
    aliases: ["rm", "raidmode"],
    category: "Antiraid",
    cooldown: 5000,
    userPermissions: [PermissionsBitField.Flags.Administrator],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async (client, message, args) => {
        let msg = await message.channel.send({ content: 'Chargement du module en cours . . .' });
        await embed(client, message, msg);
    }
}

async function embed(client, message, msg) {
    let [antijoinData, antijoinDataCreate] = await Antijoin.findOrCreate({
        where: { guildId: message.guildId },
        defaults: { status: false }
    });
    if (antijoinDataCreate) console.log(`[DB] Antijoin Table Init : ${message.guild.name} (${message.guildId})`);
    let currentPage = 0;

    const generateComponents = (page) => {
        let buttons = [
            new ButtonBuilder()
                .setCustomId("activate_antilink" + message.id)
                .setEmoji(antijoinData.status ? "1224360246940663931" : "1224360257422233671")
                .setStyle(antijoinData.status ? 3 : 4),
            new ButtonBuilder()
                .setCustomId("logs_status" + message.id)
                .setEmoji(antijoinData.logs_status ? "1277989435065237575" : "1277988800076709918")
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId("allow_status" + message.id)
                .setEmoji(antijoinData.bypass_status ? "1278286880521326593" : "1278286879606968361")
                .setStyle(2)
        ];

        if (antijoinData.logs_status) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId("logs_channel" + message.id)
                    .setEmoji("1277988776760705037")
                    .setStyle(2)
            );
        }
        if (antijoinData.bypass_status) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId("allow_settings" + message.id)
                    .setEmoji("1277984696407560315")
                    .setStyle(2)
            );
        }

        const maxPage = Math.ceil(buttons.length / 4) - 1;

        const start = page * 4;
        const currentButtons = buttons.slice(start, start + 4);

        if (page > 0) {
            currentButtons.push(
                new ButtonBuilder()
                    .setCustomId("previous_page" + message.id)
                    .setEmoji("1278356220083834962")
                    .setStyle(2)
            );
        }
        if (page < maxPage) {
            currentButtons.push(
                new ButtonBuilder()
                    .setCustomId("next_page" + message.id)
                    .setEmoji("1278356218842451999")
                    .setStyle(2)
            );
        }

        return new ActionRowBuilder().addComponents(currentButtons);
    };

    const upEmb = async () => {
        const embed = new EmbedBuilder()
            .setTitle(`${message.guild.name} : Antijoin`)
            .setDescription(`\`\`\`État: ${antijoinData.status ? "✅" : "❌"}\nLogs: ${antijoinData.logs_status ? (antijoinData.logs && client.channels.cache.get(antijoinData.logs) ? `${client.channels.cache.get(antijoinData.logs).name} (ID: ${client.channels.cache.get(antijoinData.logs).id})` : "✅") : "❌"}\nAutorisé: ${antijoinData.bypass_status ? (antijoinData.bypass > 0 ? `${antijoinData.bypass.length}` : "✅") : "❌"}\`\`\``)
            .setFooter({
                text: client.footer.text,
                iconURL: client.footer.iconURL
            })
            .setTimestamp()
            .setColor(client.color);

        let components = [];

        components.push(generateComponents(currentPage));
        

        await msg.edit({
            content: null,
            embeds: [embed],
            components: components
        });
    };

    await upEmb();

    const collector = await msg.createMessageComponentCollector({
        time: client.ms("5m")
    });

    collector.on("collect", async(i) => {
        if (i.user.id !== message.author.id) {
            return i.reply({
                content: "Vous ne pouvez pas utiliser cette interaction",
                ephemeral: true
            });
        }
        await i.deferUpdate().catch(() => false);
        if (i.customId === "activate_antilink" + message.id) {
            antijoinData.status = !antijoinData.status;
            await Antijoin.update({status: antijoinData.status}, {where: { guildId: message.guildId}});
            await upEmb();
        } else if (i.customId === "logs_status" + message.id) {
            antijoinData.logs_status = !antijoinData.logs_status;
            await Antijoin.update({logs_status: antijoinData.logs_status}, {where: { guildId: message.guildId}});
            await upEmb();
        } else if (i.customId === "allow_status" + message.id) {
            antijoinData.bypass_status = !antijoinData.bypass_status;
            await Antijoin.update({bypass_status: antijoinData.bypass_status}, {where: { guildId: message.guildId}});
            await upEmb();
        } else if (i.customId.startsWith("logs_channel")) {
            let quest = await message.channel.send({ content: "Quel est le channel ? " });
            let messCollector = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: client.ms('2m'),
                errors: ["time"]
            }).then(async (cld) => {
                const channelIdRegex = /<#(\d+)>/;
                let channelId;

                if (channelIdRegex.test(cld.first().content)) {
                    channelId = cld.first().content.match(channelIdRegex)[1];
                } else {
                    channelId = cld.first().content;
                }

                let channel = await client.channels.fetch(channelId);

                if (!channel) {
                    await message.channel.send({ content: "Je n'ai pas pu trouver le canal. Veuillez réessayer en mentionnant le canal ou en donnant son ID." });
                }

                await Antijoin.update({ logs: channel.id }, { where: { guildId: message.guildId } });
                antijoinData.logs = channel.id;

                console.log(`[DB] Antijoin Module : Logs Channel changed : ${antijoinData.logs}`);
                await upEmb();
                quest.delete();
                cld.first().delete();
            });
        } else if (i.customId === "allow_settings" + message.id) {
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : Antijoin`)
                .setDescription(`\`\`\`État: ${antijoinData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antijoinData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antijoinData.use_botWl ? "✅" : "❌"}\`\`\``)
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
                .setTimestamp()
                .setColor(client.color)
            await msg.edit({
                embeds: [settingsEmbed],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        customId: "status_settings" + message.id,
                        options: [
                            {
                                label: antijoinData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                emoji: antijoinData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            },
                            {
                                label: antijoinData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                emoji: antijoinData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            }
                        ]
                    }]
                }, {
                    type: 1,
                    components: [{
                        type: 2,
                        customId: "back" + message.id,
                        emoji: "1277988783874375751",
                        style: 2
                    }, {
                        type: 2,
                        customId: "configText" + message.id,
                        emoji: "1224360244201656380",
                        style: 2
                    }]
                }]
            });
        } else if (i.customId === "next_page" + message.id) {
            currentPage++;
            await upEmb();
        } else if (i.customId === "previous_page" + message.id) {
            currentPage--;
            await upEmb();
        } else if (i.customId === "status_settings" + message.id) {
            const setembUp = async () => {
                const settingsEmbed = new EmbedBuilder()
                    .setTitle(`${message.guild.name} : Antijoin`)
                    .setDescription(`\`\`\`État: ${antijoinData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antijoinData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antijoinData.use_botWl ? "✅" : "❌"}\`\`\``)
                    .setFooter({
                        text: client.footer.text,
                        iconURL: client.footer.iconURL
                    })
                    .setTimestamp()
                    .setColor(client.color)
                await msg.edit({
                    embeds: [settingsEmbed],
                    components: [{
                        type: 1,
                        components: [{
                            type: 3,
                            customId: "status_settings" + message.id,
                            options: [
                                {
                                    label: antijoinData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                    emoji: antijoinData.use_botOwner ? "✅" : "❌",
                                    value: "useBotOwner"
                                },
                                {
                                    label: antijoinData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                    emoji: antijoinData.use_botWl ? "✅" : "❌",
                                    value: "useBotWl"
                                }
                            ]
                        }]
                    }, {
                        type: 1,
                        components: [{
                            type: 2,
                            customId: "back" + message.id,
                            emoji: "1277988783874375751",
                            style: 2
                        }, {
                            type: 2,
                            customId: "configText" + message.id,
                            emoji: "1224360244201656380",
                            style: 2
                        }]
                    }]
                });
            }
            switch(i.values[0]){
                case "useBotOwner":
                    antijoinData.use_botOwner = !antijoinData.use_botOwner;
                    await Antijoin.update({use_botOwner: antijoinData.use_botOwner}, {where: {guildId: message.guild.id}});
                    await setembUp();
                    break;
                case "useBotWl":
                    antijoinData.use_botWl = !antijoinData.use_botWl;
                    await Antijoin.update({
                        use_botWl: antijoinData.use_botWl
                    }, {
                        where: {
                            guildId: message.guild.id
                        }
                    });
                    await setembUp();
                    break;
            }
        } else if (i.customId === "back" + message.id){
            await upEmb()
        } else if (i.customId === "configText" + message.id) {
            const reply = await message.reply({ content: 'Entrez le message', ephemeral: true });
            const filter = m => m.author.id === message.author.id;
            const collector = reply.channel.createMessageCollector({ filter, max: 1, time: client.ms("2m") });
            collector.on('collect', async(m) => {
                antijoinData.message = m.content;
                await Antijoin.update({message: antijoinData.message}, {where: {guildId: message.guildId}});
                await reply.delete();
                await m.delete();
                collector.stop();
                await upEmb();
            })
        }
    })
}