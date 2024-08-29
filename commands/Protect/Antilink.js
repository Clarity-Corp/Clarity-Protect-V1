const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
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
            const settingsEmbed = new EmbedBuilder()
                .setTitle(`${message.guild.name} : AntiLink`)
                .setDescription(`\`\`\`État: ${antilinkData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antilinkData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antilinkData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antilinkData.wl_users > 0 ? antilinkData.wl_users.size : "❌"}\nRole Autorisé: ${antilinkData.wl_role > 0 ? antilinkData.wl_role.size : "❌"}\nChannel Autorisé: ${antilinkData.wl_channel > 0 ? antilinkData.wl_channel.size : "❌"}\nLien Autorisé: ${antilinkData.wl_link > 0 ? antilinkData.wl_link.size : "❌"}\`\`\``)
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
                        options: [{
                            label: antilinkData.use_botOwner ? "Ne pas autoriser les owners du bot a bypass le module" : "Autoriser les owners du bot a bypass le module ",
                            emoji: antilinkData.use_botOwner ? "✅" : "❌",
                            value: "useBotOwner"
                        }, {
                            label: antilinkData.use_botWl ? "Ne pas autoriser les utilisateurs wl a bypass le module" : "Autoriser les utilisateurs wl a bypass le module ",
                            emoji: antilinkData.use_botWl ? "✅" : "❌",
                            value: "useBotWl"
                        }]
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
                    .setTitle(`${message.guild.name} : AntiLink`)
                    .setDescription(`\`\`\`État: ${antilinkData.bypass_status ? "✅" : "❌"}\nBot_Owner Autorisé: ${antilinkData.use_botOwner ? "✅" : "❌"}\nUtilisateurs Whitelist Autorisé : ${antilinkData.use_botWl ? "✅" : "❌"}\nUtilisateurs Indépendants : ${antilinkData.wl_users > 0 ? antilinkData.wl_users.size : "❌"}\nRole Autorisé: ${antilinkData.wl_role > 0 ? antilinkData.wl_role.size : "❌"}\nChannel Autorisé: ${antilinkData.wl_channel > 0 ? antilinkData.wl_channel.size : "❌"}\nLien Autorisé: ${antilinkData.wl_link > 0 ? antilinkData.wl_link.size : "❌"}\`\`\``)
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
                            options: [{
                                label: antilinkData.use_botOwner ? "Ne pas autoriser les owners du bot a bypass le module" : "Autoriser les owners du bot a bypass le module ",
                                emoji: antilinkData.use_botOwner ? "✅" : "❌",
                                value: "useBotOwner"
                            }, {
                                label: antilinkData.use_botWl ? "Ne pas autoriser les utilisateurs wl a bypass le module" : "Autoriser les utilisateurs wl a bypass le module ",
                                emoji: antilinkData.use_botWl ? "✅" : "❌",
                                value: "useBotWl"
                            }]
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
            if (i.values[0] === "useBotWl") {
                antilinkData.use_botWl = !antilinkData.use_botWl;
                await Antilink.update({
                    use_botWl: antilinkData.use_botWl
                }, {
                    where: {
                        guildId: message.guild.id
                    }
                });
                await setembUp();
            }
        }
    });
}