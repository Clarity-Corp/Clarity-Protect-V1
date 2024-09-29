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
const Antitoxicity = require('../../Structure/Models/Protect/antitoxicity');
module.exports = {
    name: "antitoxicity",
    description: "Manage antitoxicity module",
    category: "Antiraid",
    start: "run",
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
    let [antitoxicityData, createAntitoxicityData] = await Antitoxicity.findOrCreate({
        where: {guildId : message.guild.id},
        defaults: { status: false}
    });
    if (createAntitoxicityData) console.log(`[DB] AntiToxicity Table init : ${message.guild.name} (${message.guild.id})`);
    let currentPage = 0;
    const generateComponents = (page) => {
        let buttons = [
            new ButtonBuilder()
                .setCustomId("activate_antitoxicity" + message.id)
                .setEmoji(antitoxicityData.status ? "1224360246940663931" : "1224360257422233671")
                .setStyle(antitoxicityData.status ? 3 : 4),
            new ButtonBuilder()
                .setCustomId("logs_status" + message.id)
                .setEmoji(antitoxicityData.logs_status ? "1277989435065237575" : "1277988800076709918")
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId("ignore_perm_status" + message.id)
                .setEmoji(antitoxicityData.permission_allowed ? "1278009272852025395" : "1277988790245523618")
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId("allow_status" + message.id)
                .setEmoji(antitoxicityData.bypass_status ? "1278286880521326593" : "1278286879606968361")
                .setStyle(2)
        ];

        if (antitoxicityData.logs_status) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId("logs_channel" + message.id)
                    .setEmoji("1277988776760705037")
                    .setStyle(2)
            );
        }
        if (antitoxicityData.bypass_status) {
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
    }

    const upEmb = async () => {
        const embed = new EmbedBuilder()
            .setTitle(`${message.guild.name} : AntiToxicity`)
            .setDescription("```" + `État: ${antitoxicityData.status ? "✅" : "❌"}\nLogs: ${antitoxicityData.logs_status ? (antitoxicityData.logs_status && client.channels.cache.get(antitoxicityData.logs) ? `${client.channels.cache.get(antitoxicityData.logs).name} (ID: ${client.channels.cache.get(antitoxicityData.logs).id}` : "✅") : "❌"}\nPermission: ${antitoxicityData.permission_allowed ? "✅" : "❌"}\nPunition: ${antitoxicityData.sanction}\nPunition Admin: ${antitoxicityData.sanction_admin}\nAutorisé: ${antitoxicityData.bypass_status ? (antitoxicityData.bypass > 0 ? `${antitoxicityData.bypass.length}` : "✅") : "❌"}\nSensibilite: ${antitoxicityData.sensibility}` + "```")
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

        await msg.edit({
            content: null,
            embeds: [embed],
            components: components
        });
    }
    await upEmb();

    const collector = await msg.createMessageComponentCollector({
        time: client.ms("5m")
    });
    collector.on('collect', async(i) => {
        if (i.user.id !== message.author.id) {
            return i.reply({
                content: "Vous ne pouvez pas utiliser cette interaction",
                ephemeral: true
            });
        }
        await i.deferUpdate().catch(() => false);
        if (i.customId === "activate_antitoxicity" + message.id) {
            antitoxicityData.status = !antitoxicityData.status;
            await Antitoxicity.update({ status: antitoxicityData.status }, { where: { guildId: message.guild.id } });
            await upEmb();
        }
        else if (i.customId === "logs_status" + message.id) {
            antitoxicityData.logs_status = !antitoxicityData.logs_status;
            await Antitoxicity.update({logs_status: antitoxicityData.logs_status}, {where: {guildId: message.guild.id}});
            await upEmb();
        }
        else if (i.customId === "ignore_perm_status" + message.id) {
            antitoxicityData.permission_allowed = !antitoxicityData.permission_allowed;
            await Antitoxicity.update({permission_allowed: antitoxicityData.permission_allowed}, {where: {guildId: message.guild.id}});
            await upEmb();
        }
        else if (i.customId === "allow_status" + message.id) {
            antitoxicityData.bypass_status = !antitoxicityData.bypass_status;
            await Antitoxicity.update({bypass_status: antitoxicityData.bypass_status}, {where: {guildId: message.guild.id}});
            await upEmb();
        }
        else if (i.customId === "sanction" + message.id) {
            antitoxicityData.sanction = i.values[0];
            await Antitoxicity.update({sanction: antitoxicityData.sanction}, {where: {guildId: message.guild.id}});
            await upEmb();
        }
        else if (i.customId === "admin_sanction" + message.id) {
            antitoxicityData.sanction_admin = i.values[0];
            await Antitoxicity.update({sanction_admin: antitoxicityData.sanction_admin}, {where: {guildId: message.guild.id}});
            await upEmb();
        }
        else if (i.customId.startsWith("logs_channel")) {
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

                await Antitoxicity.update({ logs: channel.id }, { where: { guildId: message.guild.id } });
                antitoxicityData.logs = channel.id;

                console.log(`[DB] AntiToxicity Module : Logs Channel changed : ${antitoxicityData.logs}`);
                await upEmb();
                quest.delete();
                cld.first().delete();
            });
        }
        else if (i.customId === "next_page" + message.id) {
            currentPage++;
            await upEmb();
        }
        else if (i.customId === "previous_page" + message.id) {
            currentPage--;
            await upEmb();
        }
        else if (i.customId === "allow_settings" + message.id) {
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiToxicity`)
                .setDescription("```" + `État: ${antitoxicityData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antitoxicityData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antitoxicityData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antitoxicityData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antitoxicityData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antitoxicityData.wl_channel > 0 ? "✅" : "❌"}` + "```")
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
                                label: antitoxicityData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                emoji: antitoxicityData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            },
                            {
                                label: antitoxicityData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                emoji: antitoxicityData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            },
                            {
                                label: "Utilisateur indépendant",
                                emoji: antitoxicityData.wl_users && antitoxicityData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                value: "wlUser"
                            },
                            {
                                label: "Rôle Autorisé",
                                emoji: antitoxicityData.wl_role && antitoxicityData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                value: "wlRole"
                            },
                            {
                                label: "Channel Autorisé",
                                emoji: antitoxicityData.wl_channel && antitoxicityData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                value: "wlChannel"
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
                        disabled: antitoxicityData.wl_users < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "allowed_roles" + message.id,
                        emoji: "1279002291050905662",
                        disabled: antitoxicityData.wl_role < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "rep_config" + message.id,
                        emoji: "1224360258726527178",
                        disabled: antitoxicityData.wl_channel < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "sensibility_config" + message.id,
                        emoji: "1277984696407560315",
                        style: 2
                    }]
                }]
            })
        }
        else if (i.customId === "status_settings" + message.id) {
            const setembUp = async () => {
                const settingsEmbed = new EmbedBuilder()
                    .setTitle(`${message.guild.name} : AntiToxicity`)
                    .setDescription("```" + `État: ${antitoxicityData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antitoxicityData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antitoxicityData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antitoxicityData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antitoxicityData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antitoxicityData.wl_channel > 0 ? "✅" : "❌"}` + "```")
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
                                    label: antitoxicityData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                    emoji: antitoxicityData.use_botOwner ? "✅" : "❌",
                                    value: "useBotOwner"
                                },
                                {
                                    label: antitoxicityData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                    emoji: antitoxicityData.use_botWl ? "✅" : "❌",
                                    value: "useBotWl"
                                },
                                {
                                    label: "Utilisateur indépendant",
                                    emoji: antitoxicityData.wl_users && antitoxicityData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                    value: "wlUser"
                                },
                                {
                                    label: "Rôle Autorisé",
                                    emoji: antitoxicityData.wl_role && antitoxicityData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                    value: "wlRole"
                                },
                                {
                                    label: "Channel Autorisé",
                                    emoji: antitoxicityData.wl_channel && antitoxicityData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                    value: "wlChannel"
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
                            disabled: antitoxicityData.wl_users < 0,
                            style: 2
                        }, {
                            type: 2,
                            customId: "allowed_roles" + message.id,
                            emoji: "1279002291050905662",
                            disabled: antitoxicityData.wl_role < 0,
                            style: 2
                        }, {
                            type: 2,
                            customId: "rep_config" + message.id,
                            emoji: "1224360258726527178",
                            disabled: antitoxicityData.wl_channel < 0,
                            style: 2
                        }, {
                            type: 2,
                            customId: "sensibility_config" + message.id,
                            emoji: "1277984696407560315",
                            style: 2
                        }]
                    }]
                })
            }
           switch(i.values[0]) {
               case "useBotOwner":
                   antitoxicityData.use_botOwner = !antitoxicityData.use_botOwner;
                   await Antitoxicity.update({use_botOwner: antitoxicityData.use_botOwner}, {where: {guildId: message.guild.id}});
                   await setembUp();
                   break;
               case "useBotWl":
                   antitoxicityData.use_botWl = !antitoxicityData.use_botWl;
                   await Antitoxicity.update({use_botWl: antitoxicityData.use_botWl}, {where: {guildId: message.guild.id}});
                   await setembUp();
                   break;
               case "wlUser":
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
                   break;
               case "wlChannel":
                   let wlComponentss = new ActionRowBuilder().addComponents(
                       new ChannelSelectMenuBuilder()
                           .setCustomId("wlChannel" + message.id)
                           .setMinValues(1)
                           .setMaxValues(5)
                           .setPlaceholder("Selectionne un channel")
                           .addChannelTypes(0)
                   )
                   await msg.edit({
                       embeds: [],
                       components: [wlComponentss,{
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
                   break;
               case "wlRole":
                   let wlComponentsss = new ActionRowBuilder().addComponents(
                       new RoleSelectMenuBuilder()
                           .setCustomId("wlRole" + message.id)
                           .setMinValues(1)
                           .setMaxValues(5)
                           .setPlaceholder("Selectionne un role")
                   )
                   await msg.edit({
                       embeds: [],
                       components: [wlComponentsss, {
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
           }
        }
        else if (i.customId === "backk" + message.id) {
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiToxicity`)
                .setDescription("```" + `État: ${antitoxicityData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antitoxicityData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antitoxicityData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antitoxicityData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antitoxicityData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antitoxicityData.wl_channel > 0 ? "✅" : "❌"}` + "```")
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
                                label: antitoxicityData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                emoji: antitoxicityData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            },
                            {
                                label: antitoxicityData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                emoji: antitoxicityData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            },
                            {
                                label: "Utilisateur indépendant",
                                emoji: antitoxicityData.wl_users && antitoxicityData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                value: "wlUser"
                            },
                            {
                                label: "Rôle Autorisé",
                                emoji: antitoxicityData.wl_role && antitoxicityData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                value: "wlRole"
                            },
                            {
                                label: "Channel Autorisé",
                                emoji: antitoxicityData.wl_channel && antitoxicityData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                value: "wlChannel"
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
                        disabled: antitoxicityData.wl_users < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "allowed_roles" + message.id,
                        emoji: "1279002291050905662",
                        disabled: antitoxicityData.wl_role < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "rep_config" + message.id,
                        emoji: "1224360258726527178",
                        disabled: antitoxicityData.wl_channel < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "sensibility_config" + message.id,
                        emoji: "1277984696407560315",
                        style: 2
                    }]
                }]
            })
        }
        else if (i.customId === "wlRole" + message.id) {
            let wlRole = antitoxicityData.wl_role ? antitoxicityData.wl_role.split(",") : [];
            const roleId = i.values[0];
            if (wlRole.includes(roleId)) {
                wlRole = wlRole.filter(id => id !== roleId)
            } else {
                wlRole.push(roleId)
            }
            antitoxicityData.wl_role = wlRole.join(",");
            Antitoxicity.update({ wl_role: wlRole.join(",")}, {where: {guildId: message.guild.id}});
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiToxicity`)
                .setDescription("```" + `État: ${antitoxicityData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antitoxicityData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antitoxicityData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antitoxicityData.wl_users > 0 ? "✅" : "❌"}\nRole Autorisé: ${antitoxicityData.wl_role > 0 ? "✅" : "❌"}\nChannel Autorisé: ${antitoxicityData.wl_channel > 0 ? "✅" : "❌"}` + "```")
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
                                label: antitoxicityData.use_botOwner ? "Ne pas autoriser les owners du bot à bypass le module" : "Autoriser les owners du bot à bypass le module",
                                emoji: antitoxicityData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            },
                            {
                                label: antitoxicityData.use_botWl ? "Ne pas autoriser les utilisateurs WL à bypass le module" : "Autoriser les utilisateurs WL à bypass le module",
                                emoji: antitoxicityData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            },
                            {
                                label: "Utilisateur indépendant",
                                emoji: antitoxicityData.wl_users && antitoxicityData.wl_users.split(',').length > 0 ? "✅" : "❌",
                                value: "wlUser"
                            },
                            {
                                label: "Rôle Autorisé",
                                emoji: antitoxicityData.wl_role && antitoxicityData.wl_role.split(',').length > 0 ? "✅" : "❌",
                                value: "wlRole"
                            },
                            {
                                label: "Channel Autorisé",
                                emoji: antitoxicityData.wl_channel && antitoxicityData.wl_channel.split(',').length > 0 ? "✅" : "❌",
                                value: "wlChannel"
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
                        disabled: antitoxicityData.wl_users < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "allowed_roles" + message.id,
                        emoji: "1279002291050905662",
                        disabled: antitoxicityData.wl_role < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "rep_config" + message.id,
                        emoji: "1224360258726527178",
                        disabled: antitoxicityData.wl_channel < 0,
                        style: 2
                    }, {
                        type: 2,
                        customId: "sensibility_config" + message.id,
                        emoji: "1277984696407560315",
                        style: 2
                    }]
                }]
            })
        }
        else if (i.customId === "back" + message.id){
            await upEmb()
        }
        else if (i.customId === "allowed_users" + message.id) {
            let wl_users = await antitoxicityData.wl_users ? antitoxicityData.wl_users.split(",") : [];
            let userNames = wl_users.map(userId => {
                let user = client.users.cache.get(userId);
                return user ? user.username : `Utilisateur inconnu (${userId})`;
            });
            let embed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiToxicity`)
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
            let wl_roles = await antitoxicityData.wl_role ? antitoxicityData.wl_role.split(",") : [];
            let roleNames = wl_roles.map(roleId => {
                return roleId ? message.guild.roles.cache.get(roleId).name :  `Rôle inconnu (${roleId})`;
            });
            let embed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiToxicity`)
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
            });
        }
        else if (i.customId === "rep_config" + message.id) {
            let embed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiToxicity`)
                .setDescription("```" + `Etat:\n${antitoxicityData.rep ? "✅": "❌"}\nLimite:\n${antitoxicityData.rep_limit}` + "```")
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
                        emoji: antitoxicityData.rep ? "1278286880521326593" : "1278286879606968361",
                        style: 2
                    }, {
                        type: 2,
                        customId: 'rep_limit' + message.id,
                        emoji: "1224360244201656380",
                        style: 2
                    }]
                }]
            })

        }
        else if (i.customId === "rep_status" + message.id) {
            antitoxicityData.rep = !antitoxicityData.rep;
            await Antitoxicity.update({
                rep: antitoxicityData.rep
            },{
                where: {
                    guildId: message.guild.id
                }
            });
            let embed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiToxicity`)
                .setDescription("```" + `Etat:\n${antitoxicityData.rep ? "✅": "❌"}\nLimite:\n${antitoxicityData.rep_limit}` + "```")
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
                        emoji: antitoxicityData.rep ? "1278286880521326593" : "1278286879606968361",
                        style: 2
                    }, {
                        type: 2,
                        customId: 'rep_limit' + message.id,
                        emoji: "1224360244201656380",
                        style: 2
                    }]
                }]
            })
        }
        else if (i.customId === 'rep_limit' + message.id) {
            let question = await message.channel.send({
                content: "Quel limite souhaitez-vous avec l'antitoxicity ? (Entre 1 et 10)"
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
                        setTimeout((m) => m.delete(), client.ms("5s"))
                    });
                }

                antitoxicityData.rep_limit = limitValue;
                await Antitoxicity.update({rep_limit: antitoxicityData.rep_limit}, {where: {guildId: message.guild.id}});

                await message.reply({
                    content: `\`${limitValue}\` est la nouvelle limite de l'antitoxcity avant la sanction`
                }).then(m => {
                    setTimeout(() => m.delete(), client.ms("5s"));
                });

                await question.delete();
                await cld.first().delete();

                let embed = new EmbedBuilder()
                    .setTitle(`${message.guild.name} : AntiToxicity`)
                    .setDescription("```" + `Etat:\n${antitoxicityData.rep ? "✅" : "❌"}\nLimite:\n${antitoxicityData.rep_limit}` + "```")
                    .setFooter({
                        text: client.footer.text,
                        iconURL: client.footer.iconURL
                    })
                    .setTimestamp()
                    .setColor(client.color);

                await msg.edit({
                    embeds: [embed],
                    flags: 64,
                    allowedMentions: {repliedUser: false},
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
                            emoji: antitoxicityData.rep ? "1278286880521326593" : "1278286879606968361",
                            style: 2
                        }, {
                            type: 2,
                            customId: 'rep_limit' + message.id,
                            emoji: "1224360244201656380",
                            style: 2
                        }]
                    }]
                });
            })
            }
        else if (i.customId === "sensibility_config" + message.id) {
            let embed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiToxicity`)
                .setDescription("```" + `Sensibilite:\n${antitoxicityData.sensibility}` + "```")
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
                        customId: "sensibility" + message.id,
                        emoji: "1224360244201656380",
                        style: 2
                    }]
                }]
            })
        }
        else if (i.customId === "sensibility" + message.id) {
            let question = await message.channel.send({
                content: "Quel sensibilité souhaitez-vous définir pour l'antitoxicity ? (Saisissez un nombre, y compris les décimales)"
            });

            let messCollector = await message.channel.awaitMessages({
                filter: m => m.author.id === message.author.id,
                max: 1,
                time: client.ms('2m'),
                errors: ["time"]
            }).then(async cld => {
                let limitValue = cld.first().content.trim();

                if (!/^(\d+(\.\d+)?|\.\d+)$/.test(limitValue)) {
                    return message.channel.send({
                        content: "Veuillez fournir un nombre valide."
                    }).then(m => {
                        setTimeout(() => m.delete(), client.ms("5s"));
                    });
                }

                antitoxicityData.sensibility = parseFloat(limitValue);
                await Antitoxicity.update({ sensibility: antitoxicityData.sensibility }, { where: { guildId: message.guild.id } });

                await message.reply({
                    content: `\`${limitValue}\` est la nouvelle sensibilité de l'antitoxicity`
                }).then(m => {
                    setTimeout(() => m.delete(), client.ms("5s"));
                });

                await question.delete();
                await cld.first().delete();
                let embed = new EmbedBuilder()
                    .setTitle(`${message.guild.name} : AntiToxicity`)
                    .setDescription("```" + `Sensibilité:\n${antitoxicityData.sensibility}` + "```")
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
                            customId: "sensibility" + message.id,
                            emoji: "1224360244201656380",
                            style: 2
                        }]
                    }]
                })
            });
        }
    })
}
