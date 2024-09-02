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
const Antilink = require('../../Structure/Db/Models/Protect/antilink');
const Logs = require("../../Structure/Db/Models/logs/Logs");
module.exports = {
    name: "antilink",
    description: "Manage antilink module",
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
};

async function embed(client, message, msg) {
    let [antilinkData, createAntilinkData] = await Antilink.findOrCreate({
        where: { guildId: message.guild.id },
        defaults: { status: false }
    });

    if (createAntilinkData) console.log(`[DB] Antilink Table Init : ${message.guild.name} (${message.guild.id})`);

    let currentPage = 0;

    const generateComponents = (page) => {
        let buttons = [
            new ButtonBuilder()
                .setCustomId("activate_antilink" + message.id)
                .setEmoji(antilinkData.status ? "1224360246940663931" : "1224360257422233671")
                .setStyle(antilinkData.status ? 3 : 4),
            new ButtonBuilder()
                .setCustomId("logs_status" + message.id)
                .setEmoji(antilinkData.logs_status ? "1277989435065237575" : "1277988800076709918")
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId("ignore_perm_status" + message.id)
                .setEmoji(antilinkData.permission_allowed ? "1278009272852025395" : "1277988790245523618")
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId("allow_status" + message.id)
                .setEmoji(antilinkData.bypass_status ? "1278286880521326593" : "1278286879606968361")
                .setStyle(2)
        ];

        if (antilinkData.logs_status) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId("logs_channel" + message.id)
                    .setEmoji("1277988776760705037")
                    .setStyle(2)
            );
        }
        if (antilinkData.bypass_status) {
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
            .setTitle(`${message.guild.name} : AntiLink`)
            .setDescription(`\`\`\`État: ${antilinkData.status ? "✅" : "❌"}\nLogs: ${antilinkData.logs_status ? (antilinkData.logs && client.channels.cache.get(antilinkData.logs) ? `${client.channels.cache.get(antilinkData.logs).name} (ID: ${client.channels.cache.get(antilinkData.logs).id})` : "✅") : "❌"}\nPermission: ${antilinkData.permission_allowed ? "✅" : "❌"}\nPunition: ${antilinkData.sanction}\nPunition Admin: ${antilinkData.sanction_admin}\nAutorisé: ${antilinkData.bypass_status ? (antilinkData.bypass > 0 ? `${antilinkData.bypass.length}` : "✅") : "❌"}\nLien sanctionné: ${antilinkData.link_type}\`\`\``)
            .setFooter({
                text: client.footer.text,
                iconURL: client.footer.iconURL
            })
            .setTimestamp()
            .setColor(client.color);

        let components = [];

        components.push(generateComponents(currentPage));

        components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("sanction" + message.id)
                .setPlaceholder("Sanction")
                .addOptions([
                    { label: "mute", value: "mute" },
                    { label: "kick", value: "kick" },
                    { label: "ban", value: "ban" },
                    { label: "derank", value: "derank" }
                ])
        ));

        components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("admin_sanction" + message.id)
                .setPlaceholder("Sanction Admin")
                .addOptions([
                    { label: "kick", value: "kick" },
                    { label: "ban", value: "ban" },
                    { label: "derank", value: "derank" }
                ])
        ));

        components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("link_type" + message.id)
                .setPlaceholder("Type de lien")
                .addOptions([
                    { label: "http", value: "http" },
                    { label: "discord", value: "dsc" },
                    { label: "all", value: "all" }
                ])
        ));

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

    collector.on('collect', async (i) => {
        if (i.user.id !== message.author.id) {
            return i.reply({
                content: "Vous ne pouvez pas utiliser cette interaction",
                ephemeral: true
            });
        }

        await i.deferUpdate().catch(() => false);

        if (i.customId === "activate_antilink" + message.id) {
            const newStatus = !antilinkData.status;
            await Antilink.update({ status: newStatus }, { where: { guildId: message.guild.id } });
            antilinkData.status = newStatus;
            await upEmb();
        } else if (i.customId === "logs_status" + message.id) {
            const newStatus = !antilinkData.logs_status;
            await Antilink.update({ logs_status: newStatus }, { where: { guildId: message.guild.id } });
            antilinkData.logs_status = newStatus;
            await upEmb();
        } else if (i.customId === "ignore_perm_status" + message.id) {
            const newStatus = !antilinkData.permission_allowed;
            await Antilink.update({ permission_allowed: newStatus }, { where: { guildId: message.guild.id } });
            antilinkData.permission_allowed = newStatus;
            await upEmb();
        } else if (i.customId === "allow_status" + message.id) {
            const newStatus = !antilinkData.bypass_status;
            await Antilink.update({ bypass_status: newStatus }, { where: { guildId: message.guild.id } });
            antilinkData.bypass_status = newStatus;
            await upEmb();
        } else if (i.customId === "sanction" + message.id) {
            antilinkData.sanction = i.values[0];
            await Antilink.update({ sanction: antilinkData.sanction }, { where: { guildId: message.guild.id } });
            await upEmb();
        } else if (i.customId === "admin_sanction" + message.id) {
            antilinkData.sanction_admin = i.values[0];
            await Antilink.update({ sanction: antilinkData.sanction_admin }, { where: { guildId: message.guild.id } });
            await upEmb();
        } else if (i.customId === "link_type" + message.id) {
            antilinkData.link_type = i.values[0];
            await Antilink.update({ link_type: antilinkData.link_type }, { where: { guildId: message.guild.id } });
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

                await Antilink.update({ logs: channel.id }, { where: { guildId: message.guild.id } });
                antilinkData.logs = channel.id;

                console.log(`[DB] Antilink Module : Logs Channel changed : ${antilinkData.logs}`);
                await upEmb();
                quest.delete();
                cld.first().delete();
            });
        } else if (i.customId === "allow_settings" + message.id) {
            let wl_links = antilinkData.wl_link ? antilinkData.wl_link.split(',') : [];
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription(`\`\`\`État: ${antilinkData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antilinkData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antilinkData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antilinkData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antilinkData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antilinkData.wl_channel > 0 ? "✅" : "❌"}\nLien Autorisé: ${wl_links > 0 ? "✅" : "❌"}\`\`\``)
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
                                label: antilinkData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                emoji: antilinkData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            },
                            {
                                label: antilinkData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                emoji: antilinkData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            },
                            {
                                label: "Utilisateur indépendant",
                                emoji: antilinkData.wl_users && antilinkData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                value: "wlUser"
                            },
                            {
                                label: "Rôle Autorisé",
                                emoji: antilinkData.wl_role && antilinkData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                value: "wlRole"
                            },
                            {
                                label: "Channel Autorisé",
                                emoji: antilinkData.wl_channel && antilinkData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                value: "wlChannel"
                            },
                            {
                                label: "Lien Autorisé",
                                emoji: antilinkData.wl_link && antilinkData.wl_link.split(',').length > 0 ? "✅" : "❌",
                                value: "wlLink"
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
                    },{
                        type: 2,
                        customId: "allowed_users" + message.id,
                        emoji: "1278983711794397244",
                        disabled: antilinkData.wl_users < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "allowed_roles" + message.id,
                        emoji: "1279002291050905662",
                        disabled: antilinkData.wl_role < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "rep_config" + message.id,
                        emoji: "1224360258726527178",
                        disabled: antilinkData.wl_channel < 0,
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
                let wl_links = antilinkData.wl_link ? antilinkData.wl_link.split(',') : [];
                const settingsEmbed = new EmbedBuilder()
                    .setTitle(`${message.guild.name} : AntiLink`)
                    .setDescription(`\`\`\`État: ${antilinkData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antilinkData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antilinkData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antilinkData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antilinkData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antilinkData.wl_channel > 0 ? "✅" : "❌"}\nLien Autorisé: ${wl_links > 0 ? "✅" : "❌"}\`\`\``)
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
                                    label: antilinkData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                    emoji: antilinkData.use_botOwner ? "✅" : "❌",
                                    value: "useBotOwner"
                                },
                                {
                                    label: antilinkData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                    emoji: antilinkData.use_botWl ? "✅" : "❌",
                                    value: "useBotWl"
                                },
                                {
                                    label: "Utilisateur indépendant",
                                    emoji: antilinkData.wl_users && antilinkData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                    value: "wlUser"
                                },
                                {
                                    label: "Rôle Autorisé",
                                    emoji: antilinkData.wl_role && antilinkData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                    value: "wlRole"
                                },
                                {
                                    label: "Channel Autorisé",
                                    emoji: antilinkData.wl_channel && antilinkData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                    value: "wlChannel"
                                },
                                {
                                    label: "Lien Autorisé",
                                    emoji: antilinkData.wl_link && antilinkData.wl_link.split(',').length > 0 ? "✅" : "❌",
                                    value: "wlLink"
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
                        },{
                            type: 2,
                            customId: "allowed_users" + message.id,
                            emoji: "1278983711794397244",
                            disabled: antilinkData.wl_users < 0,
                            style: 2
                        }, {
                            type: 2,
                            customId: "allowed_roles" + message.id,
                            emoji: "1279002291050905662",
                            disabled: antilinkData.wl_role < 0,
                            style: 2
                        }, {
                            type: 2,
                            customId: "rep_config" + message.id,
                            emoji: "1224360258726527178",
                            disabled: antilinkData.wl_channel < 0,
                            style: 2
                        }]
                    }]
                });
            }
            if (i.values[0] === "useBotOwner") {
                antilinkData.use_botOwner = !antilinkData.use_botOwner;
                await Antilink.update({
                    use_botOwner: antilinkData.use_botOwner
                }, {
                    where: {
                        guildId: message.guild.id
                    }
                });
                await setembUp()
            }
            else if (i.values[0] === "useBotWl") {
                antilinkData.use_botWl = !antilinkData.use_botWl;
                await Antilink.update({
                    use_botWl: antilinkData.use_botWl
                }, {
                    where: {
                        guildId: message.guild.id
                    }
                });
                await setembUp();
            } else if (i.values[0] === "wlUser") {
                let wlComponents = new ActionRowBuilder().addComponents(
                    new UserSelectMenuBuilder()
                        .setCustomId("wlUser" + message.id)
                        .setMinValues(1)
                        .setMaxValues(5)
                        .setPlaceholder("Selectionne un utilisateur")
                )

                await msg.edit({
                    embeds: [],
                    components: [wlComponents, {
                        type: 1,
                        components: [{
                            type: 2,
                            customId: "backk" + message.id,
                            emoji: "1277988783874375751",
                            style: 2
                        }
                        ]
                    }]
                })
            } else if (i.values[0] === "wlChannel") {
                let wlComponents = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("wlChannel" + message.id)
                        .setMinValues(1)
                        .setMaxValues(5)
                        .setPlaceholder("Selectionne un channel")
                        .addChannelTypes(0)
                )
                await msg.edit({
                    embeds: [],
                    components: [wlComponents, {
                        type: 1,
                        components: [{
                            type: 2,
                            customId: "backk" + message.id,
                            emoji: "1277988783874375751",
                            style: 2
                        }
                        ]
                    }]
                })
            } else if (i.values[0] === "wlRole") {
                let wlComponents = new ActionRowBuilder().addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId("wlRole" + message.id)
                        .setMinValues(1)
                        .setMaxValues(5)
                        .setPlaceholder("Selectionne un role")
                )
                await msg.edit({
                    embeds: [],
                    components: [wlComponents, {
                        type: 1,
                        components: [{
                            type: 2,
                            customId: "backk" + message.id,
                            emoji: "1277988783874375751",
                            style: 2
                        }
                        ]
                    }]
                })
            } else if (i.values[0] === "wlLink") {
                let wl_link = await antilinkData.wl_link ? antilinkData.wl_link.split(',') : [];
                let LinkUpEmb = async () => {
                    let embed = new EmbedBuilder()
                        .setTitle(`${message.guild.name} : AntiLink`)
                        .setDescription("```" + `Lien Autorisé:\n${wl_link.length > 0 ? wl_link.join("\n") : "❌"}` + "```")
                        .setFooter({
                            text: client.footer.text,
                            iconURL: client.footer.iconURL
                        })
                        .setTimestamp()
                        .setColor(client.color);
                    await msg.edit({
                        embeds: [embed],
                        components: [{
                            type: 1,
                            components: [{
                                type: 2,
                                customId: "backk" + message.id,
                                emoji: "1277988783874375751",
                                style: 2
                            }, {
                                type: 2,
                                customId: "addLink" + message.id,
                                emoji: "1279064309141602324",
                                style: 2
                            }, {
                                type: 2,
                                customId: "resetLink" + message.id,
                                emoji: "1068874860169793588",
                                style: 2
                            }, {
                                type: 2,
                                customId: "removeLink" + message.id,
                                emoji: "827275974390579250",
                                style: 2
                            }]
                        }]
                    })
                }
                await LinkUpEmb()
            }
        }
        else if (i.customId === "wlUser" + message.id) {
            let wlUsers = antilinkData.wl_users ? antilinkData.wl_users.split(',') : [];
            const userId = i.values[0];
            if (wlUsers.includes(userId)) {
                wlUsers = wlUsers.filter(id => id !== userId);
            } else {
                wlUsers.push(userId);
            }
            await Antilink.update({
                wl_users: wlUsers.join(',')
            }, {
                where: {
                    guildId: message.guild.id
                }
            });
            antilinkData.wl_users = wlUsers.join(',');
            let wl_links = antilinkData.wl_link ? antilinkData.wl_link.split(',') : [];
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription(`\`\`\`État: ${antilinkData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antilinkData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antilinkData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antilinkData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antilinkData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antilinkData.wl_channel > 0 ? "✅" : "❌"}\nLien Autorisé: ${wl_links > 0 ? "✅" : "❌"}\`\`\``)
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
                                label: antilinkData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                emoji: antilinkData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            },
                            {
                                label: antilinkData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                emoji: antilinkData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            },
                            {
                                label: "Utilisateur indépendant",
                                emoji: antilinkData.wl_users && antilinkData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                value: "wlUser"
                            },
                            {
                                label: "Rôle Autorisé",
                                emoji: antilinkData.wl_role && antilinkData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                value: "wlRole"
                            },
                            {
                                label: "Channel Autorisé",
                                emoji: antilinkData.wl_channel && antilinkData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                value: "wlChannel"
                            },
                            {
                                label: "Lien Autorisé",
                                emoji: antilinkData.wl_link && antilinkData.wl_link.split(',').length > 0 ? "✅" : "❌",
                                value: "wlLink"
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
                    },{
                        type: 2,
                        customId: "allowed_users" + message.id,
                        emoji: "1278983711794397244",
                        disabled: antilinkData.wl_users < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "allowed_roles" + message.id,
                        emoji: "1279002291050905662",
                        disabled: antilinkData.wl_role < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "rep_config" + message.id,
                        emoji: "1224360258726527178",
                        disabled: antilinkData.wl_channel < 0,
                        style: 2
                    }]
                }]
            });
        } else
        if (i.customId === "wlChannel" + message.id) {
            let wlChannel = antilinkData.wl_channel ? antilinkData.wl_channel.split(",") : [];
            const channelId = i.values[0];
            if (wlChannel.includes(channelId)) {
                wlChannel = wlChannel.filter(id => id !== channelId)
            } else {
                wlChannel.push(channelId)
            }
            await Antilink.update({
                wl_channel: wlChannel.join(",")
            }, {
                where: {
                    guildId: message.guild.id
                }
            });
            antilinkData.wl_channel = wlChannel.join(",")
            let wl_links = antilinkData.wl_link ? antilinkData.wl_link.split(',') : [];
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription(`\`\`\`État: ${antilinkData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antilinkData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antilinkData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antilinkData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antilinkData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antilinkData.wl_channel > 0 ? "✅" : "❌"}\nLien Autorisé: ${wl_links > 0 ? "✅" : "❌"}\`\`\``)
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
                                label: antilinkData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                emoji: antilinkData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            },
                            {
                                label: antilinkData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                emoji: antilinkData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            },
                            {
                                label: "Utilisateur indépendant",
                                emoji: antilinkData.wl_users && antilinkData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                value: "wlUser"
                            },
                            {
                                label: "Rôle Autorisé",
                                emoji: antilinkData.wl_role && antilinkData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                value: "wlRole"
                            },
                            {
                                label: "Channel Autorisé",
                                emoji: antilinkData.wl_channel && antilinkData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                value: "wlChannel"
                            },
                            {
                                label: "Lien Autorisé",
                                emoji: antilinkData.wl_link && antilinkData.wl_link.split(',').length > 0 ? "✅" : "❌",
                                value: "wlLink"
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
                    },{
                        type: 2,
                        customId: "allowed_users" + message.id,
                        emoji: "1278983711794397244",
                        disabled: antilinkData.wl_users < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "allowed_roles" + message.id,
                        emoji: "1279002291050905662",
                        disabled: antilinkData.wl_role < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "rep_config" + message.id,
                        emoji: "1224360258726527178",
                        disabled: antilinkData.wl_channel < 0,
                        style: 2
                    }]
                }]
            });
        } else if (i.customId === "back" + message.id){
            await upEmb()
        }
        else if (i.customId === "wlRole" + message.id) {
            let wlRole = antilinkData.wl_role ? antilinkData.wl_role.split(",") : [];
            const roleId = i.values[0];
            if (wlRole.includes(roleId)) {
                wlRole = wlRole.filter(id => id !== roleId)
            } else {
                wlRole.push(roleId)
            }
            antilinkData.wl_role = wlRole.join(",")
            Antilink.update({
                wl_role: wlRole.join(",")
            }, {
                where: {
                    guildId: message.guild.id
                }
            });
            let wl_links = antilinkData.wl_link ? antilinkData.wl_link.split(',') : [];
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription(`\`\`\`État: ${antilinkData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antilinkData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antilinkData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antilinkData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antilinkData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antilinkData.wl_channel > 0 ? "✅" : "❌"}\nLien Autorisé: ${wl_links > 0 ? "✅" : "❌"}\`\`\``)
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
                                label: antilinkData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                emoji: antilinkData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            },
                            {
                                label: antilinkData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                emoji: antilinkData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            },
                            {
                                label: "Utilisateur indépendant",
                                emoji: antilinkData.wl_users && antilinkData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                value: "wlUser"
                            },
                            {
                                label: "Rôle Autorisé",
                                emoji: antilinkData.wl_role && antilinkData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                value: "wlRole"
                            },
                            {
                                label: "Channel Autorisé",
                                emoji: antilinkData.wl_channel && antilinkData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                value: "wlChannel"
                            },
                            {
                                label: "Lien Autorisé",
                                emoji: antilinkData.wl_link && antilinkData.wl_link.split(',').length > 0 ? "✅" : "❌",
                                value: "wlLink"
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
                    },{
                        type: 2,
                        customId: "allowed_users" + message.id,
                        emoji: "1278983711794397244",
                        disabled: antilinkData.wl_users < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "allowed_roles" + message.id,
                        emoji: "1279002291050905662",
                        disabled: antilinkData.wl_role < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "rep_config" + message.id,
                        emoji: "1224360258726527178",
                        disabled: antilinkData.wl_channel < 0,
                        style: 2
                    }]
                }]
            });
        }
        else if (i.customId === "backk" + message.id) {
            let wl_links = antilinkData.wl_link ? antilinkData.wl_link.split(',') : [];
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription(`\`\`\`État: ${antilinkData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antilinkData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antilinkData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antilinkData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antilinkData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antilinkData.wl_channel > 0 ? "✅" : "❌"}\nLien Autorisé: ${wl_links.length > 0 ? "✅" : "❌"}\`\`\``)
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
                .setTimestamp()
                .setColor(client.color);
            await msg.edit({
                embeds: [settingsEmbed],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        customId: "status_settings" + message.id,
                        options: [
                            {
                                label: antilinkData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                emoji: antilinkData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            },
                            {
                                label: antilinkData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                emoji: antilinkData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            },
                            {
                                label: "Utilisateur indépendant",
                                emoji: antilinkData.wl_users && antilinkData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                value: "wlUser"
                            },
                            {
                                label: "Rôle Autorisé",
                                emoji: antilinkData.wl_role && antilinkData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                value: "wlRole"
                            },
                            {
                                label: "Channel Autorisé",
                                emoji: antilinkData.wl_channel && antilinkData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                value: "wlChannel"
                            },
                            {
                                label: "Lien Autorisé",
                                emoji: antilinkData.wl_link && antilinkData.wl_link.split(',').length > 0 ? "✅" : "❌",
                                value: "wlLink"
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
                    },{
                        type: 2,
                        customId: "allowed_users" + message.id,
                        emoji: "1278983711794397244",
                        disabled: antilinkData.wl_users < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "allowed_roles" + message.id,
                        emoji: "1279002291050905662",
                        disabled: antilinkData.wl_role < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "allowed_channels" + message.id,
                        emoji: "1224360258726527178",
                        disabled: antilinkData.wl_channel < 0,
                        style: 2
                    }]
                }]
            });
        }
        else if (i.customId === "addLink" + message.id) {
            let question = await message.channel.send({
                content: "Quel lien souhaitez vous ignorer avec l'antilink ?"
            });
            let messCollector = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: client.ms('2m'),
                errors: ["time"]
            }).then(async cld => {
                if (!cld.first().content.trim()) return message.channel.send({content:"Aucun lien n'a été fourni."}).then(m => {
                    setTimeout(m.delete(), client.ms("5s"))
                });
                let wl_links = antilinkData.wl_link ? antilinkData.wl_link.split(',') : [];
                if (wl_links.includes(cld.first().content.trim())) {
                    return message.reply({content:"Ce lien est déjà ignoré par l'antilink."}).then(m => {
                        setTimeout(m.delete(), client.ms("5s"))
                    });
                } else {
                    wl_links.push(cld.first().content.trim())
                }
                antilinkData.wl_link = wl_links.join(',')
                await Antilink.update({wl_link: wl_links.join(",")}, {where: {guildId: message.guild.id}})
                await message.reply({
                    content: `\`${cld.first().content.trim()}\` ajouté à la liste des liens ignorés`
                }).then(m => {
                    setTimeout(m.delete(), client.ms("5s"))
                })
                await question.delete();
                await cld.first().delete()
                let embed = new EmbedBuilder()
                    .setTitle(`${message.guild.name} : AntiLink`)
                    .setDescription("```" + `Lien Autorisé:\n${wl_links.length > 0 ? wl_links.join("\n") : "❌"}` + "```")
                    .setFooter({
                        text: client.footer.text,
                        iconURL: client.footer.iconURL
                    })
                    .setTimestamp()
                    .setColor(client.color);
                await msg.edit({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            customId: "backk" + message.id,
                            emoji: "1277988783874375751",
                            style: 2
                        }, {
                            type: 2,
                            customId: "addLink" + message.id,
                            emoji: "1279064309141602324",
                            style: 2
                        }, {
                            type: 2,
                            customId: "resetLink" + message.id,
                            emoji: "1068874860169793588",
                            style: 2
                        }, {
                            type: 2,
                            customId: "removeLink" + message.id,
                            emoji: "827275974390579250",
                            style: 2
                        }]
                    }]
                })
            }).catch(async err => {
                console.log(err)
                await message.reply({
                    content: "Temps écoulé."
                })
            })
        }
        else if (i.customId === "removeLink" + message.id) {
            let question = await message.channel.send({
                content: "Quel lien souhaitez vous ne plus ignorer avec l'antilink ?"
            });
            let messCollector = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: client.ms('2m'),
                errors: ["time"]
            }).then(async cld => {
                if (!cld.first().content.trim()) return message.channel.send({content:"Aucun lien n'a été fourni."}).then(m => {
                    setTimeout(m.delete(), client.ms("5s"))
                });
                let wl_links = await antilinkData.wl_link ? antilinkData.wl_link.split(',') : [];
                if (!wl_links.includes(cld.first().content.trim())) {
                    return message.reply({
                        content: "Ce lien n'est pas ignore par l'antilink"
                    });
                } else {
                    wl_links = wl_links.filter(link => link !== cld.first().content.trim())
                }
                antilinkData.wl_link = wl_links.join(',')
                await Antilink.update({wl_link: wl_links.join(",")}, {where: {guildId: message.guild.id}})
                await message.reply({
                    content: `\`${cld.first().content.trim()}\` retiré de la liste des liens ignorés`
                }).then(m => {
                    setTimeout(m.delete(), client.ms("5s"))
                })
                await question.delete();
                await cld.first().delete()
                let embed = new EmbedBuilder()
                    .setTitle(`${message.guild.name} : AntiLink`)
                    .setDescription("```" + `Lien Autorisé:\n${wl_links.length > 0 ? wl_links.join("\n") : "❌"}` + "```")
                    .setFooter({
                        text: client.footer.text,
                        iconURL: client.footer.iconURL
                    })
                    .setTimestamp()
                    .setColor(client.color);
                await msg.edit({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            customId: "backk" + message.id,
                            emoji: "1277988783874375751",
                            style: 2
                        }, {
                            type: 2,
                            customId: "addLink" + message.id,
                            emoji: "1279064309141602324",
                            style: 2
                        }, {
                            type: 2,
                            customId: "resetLink" + message.id,
                            emoji: "1068874860169793588",
                            style: 2
                        }, {
                            type: 2,
                            customId: "removeLink" + message.id,
                            emoji: "827275974390579250",
                            style: 2
                        }]
                    }]
                })
            }).catch(async err => {
                console.log(err)
                await message.reply({
                    content: "Temps écoulé."
                })
            })
        }
        else if (i.customId === "resetLink" + message.id) {
            let confirmation = await message.channel.send({
                content: "Êtes-vous sûr de vouloir réinitialiser tous les liens ignorés à leur valeur initiale ? Répondez avec 'oui' pour confirmer."
            });

            let confirmCollector = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: client.ms('1m'),
                errors: ["time"]
            }).then(async cld => {
                if (cld.first().content.toLowerCase() !== "oui") {
                    return message.channel.send({
                        content: "Réinitialisation annulée."
                    }).then(m => {
                        setTimeout(m.delete(), client.ms("5s"))
                    });
                }
                let initialLinks = "giphy.com/gifs";
                antilinkData.wl_link = initialLinks;
                await Antilink.update({ wl_link: initialLinks }, { where: { guildId: message.guild.id } });

                await message.reply({
                    content: "Tous les liens ignorés ont été réinitialisés."
                }).then(m => {
                    setTimeout(m.delete(), client.ms("5s"))
                });

                await confirmation.delete();
                await cld.first().delete();

                let embed = new EmbedBuilder()
                    .setTitle(`${message.guild.name} : AntiLink`)
                    .setDescription("```" + `Lien Autorisé:\n${initialLinks.length > 0 ? initialLinks.split(',').join("\n") : "❌"}` + "```")
                    .setFooter({
                        text: client.footer.text,
                        iconURL: client.footer.iconURL
                    })
                    .setTimestamp()
                    .setColor(client.color);

                await msg.edit({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            customId: "backk" + message.id,
                            emoji: "1277988783874375751",
                            style: 2
                        }, {
                            type: 2,
                            customId: "addLink" + message.id,
                            emoji: "1279064309141602324",
                            style: 2
                        }, {
                            type: 2,
                            customId: "resetLink" + message.id,
                            emoji: "1068874860169793588",
                            style: 2
                        }, {
                            type: 2,
                            customId: "removeLink" + message.id,
                            emoji: "827275974390579250",
                            style: 2
                        }]
                    }]
                });
            }).catch(async err => {
                await message.reply({ content: "Temps écoulé. Réinitialisation annulée." });
                await confirmation.delete();
            });
        }
        else if (i.customId === "allowed_users" + message.id) {
            let wl_users = await antilinkData.wl_users ? antilinkData.wl_users.split(",") : [];
            let userNames = wl_users.map(userId => {
                let user = client.users.cache.get(userId);
                return user ? user.username : `Utilisateur inconnu (${userId})`;
            });
            let embed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription("```" + `Utilisateur Autorisé:\n${userNames.length > 0 ? userNames.join("\n") : "❌"}` + "```")
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
                .setTimestamp()
                .setColor(client.color);
            await msg.edit({
                embeds: [embed],
                flags: 64,
                allowedMentions: { repliedUser: false },
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        customId: "backk" + message.id,
                        emoji: "1277988783874375751",
                        style: 2
                    }]
                }]
            })
        }
        else if (i.customId === "allowed_roles" + message.id) {
            let wl_roles = await antilinkData.wl_role ? antilinkData.wl_role.split(",") : [];
            let roleNames = wl_roles.map(roleId => {
                return roleId ? message.guild.roles.cache.get(roleId).name :  `Rôle inconnu (${roleId})`;
            });
            let embed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription("```" + `Rôles Autorisés:\n${roleNames.length > 0 ? roleNames.join("\n") : "❌"}` + "```")
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
                .setTimestamp()
                .setColor(client.color);
            await msg.edit({
                embeds: [embed],
                flags: 64,
                allowedMentions: { repliedUser: false },
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        customId: "backk" + message.id,
                        emoji: "1277988783874375751",
                        style: 2
                    }]
                }]
            })
        }
        else if (i.customId === "rep_config" + message.id) {
            let embed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription("```" + `Etat:\n${antilinkData.rep ? "✅": "❌"}\nLimite:\n${antilinkData.rep_limit}` + "```")
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
                .setTimestamp()
                .setColor(client.color);
            await msg.edit({
                embeds: [embed],
                flags: 64,
                allowedMentions: { repliedUser: false },
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        customId: "backk" + message.id,
                        emoji: "1277988783874375751",
                        style: 2
                    }, {
                        type: 2,
                        customId: "rep_status" + message.id,
                        emoji: antilinkData.rep ? "1278286880521326593" : "1278286879606968361",
                        style: 2
                    }, {
                        type: 2,
                        customId: 'rep_limit' + message.id,
                        emoji: "1224360244201656380",
                        style: 2
                    }]
                }]
            })
        } else if (i.customId === "rep_status" + message.id) {
            antilinkData.rep = !antilinkData.rep;
            await Antilink.update({
                rep: antilinkData.rep
            },{
                where: {
                    guildId: message.guild.id
                }
            });
            let embed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription("```" + `Etat:\n${antilinkData.rep ? "✅": "❌"}\nLimite:\n${antilinkData.rep_limit}` + "```")
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
                .setTimestamp()
                .setColor(client.color);
            await msg.edit({
                embeds: [embed],
                flags: 64,
                allowedMentions: { repliedUser: false },
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        customId: "backk" + message.id,
                        emoji: "1277988783874375751",
                        style: 2
                    }, {
                        type: 2,
                        customId: "rep_status" + message.id,
                        emoji: antilinkData.rep ? "1278286880521326593" : "1278286879606968361",
                        style: 2
                    }, {
                        type: 2,
                        customId: 'rep_limit' + message.id,
                        emoji: "1224360244201656380",
                        style: 2
                    }]
                }]
            })
        } else if (i.customId === 'rep_limit' + message.id) {
            let question = await message.channel.send({
                content: "Quel limite souhaitez-vous avec l'antilink ? (Entre 1 et 10)"
            });

            let messCollector = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: client.ms('2m'),
                errors: ["time"]
            }).then(async cld => {
                let limitValue = cld.first().content.trim();

                if (!/^\d+$/.test(limitValue) || parseInt(limitValue) < 1 || parseInt(limitValue) > 10) {
                    return message.channel.send({
                        content: "Veuillez fournir un nombre valide entre 1 et 10."
                    }).then(m => {
                        setTimeout(m.delete(), client.ms("5s"))
                    });
                }

                antilinkData.rep_limit = limitValue;
                await Antilink.update({ rep_limit: antilinkData.rep_limit }, { where: { guildId: message.guild.id } });

                await message.reply({
                    content: `\`${limitValue}\` est la nouvelle limite de l'antilink avant la sanction`
                }).then(m => {
                    setTimeout(() => m.delete(), client.ms("5s"));
                });

                await question.delete();
                await cld.first().delete();

                let embed = new EmbedBuilder()
                    .setTitle(`${message.guild.name} : AntiLink`)
                    .setDescription("```" + `Etat:\n${antilinkData.rep ? "✅" : "❌"}\nLimite:\n${antilinkData.rep_limit}` + "```")
                    .setFooter({
                        text: client.footer.text,
                        iconURL: client.footer.iconURL
                    })
                    .setTimestamp()
                    .setColor(client.color);

                await msg.edit({
                    embeds: [embed],
                    flags: 64,
                    allowedMentions: { repliedUser: false },
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            customId: "backk" + message.id,
                            emoji: "1277988783874375751",
                            style: 2
                        }, {
                            type: 2,
                            customId: "rep_status" + message.id,
                            emoji: antilinkData.rep ? "1278286880521326593" : "1278286879606968361",
                            style: 2
                        }, {
                            type: 2,
                            customId: 'rep_limit' + message.id,
                            emoji: "1224360244201656380",
                            style: 2
                        }]
                    }]
                });
            }).catch(async err => {
                console.log(err);
                await message.reply({
                    content: "Temps écoulé."
                });
            });
        }
    });
}