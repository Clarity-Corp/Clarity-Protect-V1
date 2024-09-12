const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    UserSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelType
} = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const Logs = require("../../Structure/Models/logs/Logs");
const Maintenance = require("../../Structure/Models/Protect/Maintenance")
module.exports = {
    name: "maintenance",
    description: "Manage maintenance module",
    aliases: [],
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
    let [maintenanceData, maintenanceDataCreate] = await Maintenance.findOrCreate({
        where: { guildId: message.guildId },
        defaults: { status: false }
    });
    if (maintenanceDataCreate) console.log(`[DB] Maintenance Table Init : ${message.guild.name} (${message.guildId})`);
    let currentPage = 0;

    const generateComponents = (page) => {
        let buttons = [
            new ButtonBuilder()
                .setCustomId("activate_antilink" + message.id)
                .setEmoji(maintenanceData.status ? "1224360246940663931" : "1224360257422233671")
                .setStyle(maintenanceData.status ? 3 : 4),
                new ButtonBuilder()
                .setCustomId("logs_status" + message.id)
                .setEmoji(maintenanceData.logs_status ? "1277989435065237575" : "1277988800076709918")
                .setStyle(2),
                new ButtonBuilder()
                .setCustomId("maintenance_role" + message.id)
                .setEmoji(maintenanceData.roles ? "1278009272852025395" : "1277988790245523618")
                .setStyle(2),
        ];
        
        if (maintenanceData.logs_status) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId("logs_channel" + message.id)
                    .setEmoji("1277988776760705037")
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
            .setTitle(`${message.guild.name} : Maintenance`)
            .setDescription(`\`\`\`État: ${maintenanceData.status ? "✅" : "❌"}\nRole: ${maintenanceData.roles ? message.guild.roles.cache.get(maintenanceData.roles).name : "Aucun"}\`\`\``)
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
            maintenanceData.status = !maintenanceData.status;
            if (maintenanceData.status) {
                maintenanceData.savedPermissions = {};
              message.guild.channels.cache.forEach(channel => {
                
                maintenanceData.savedPermissions[channel.id] = channel.permissionOverwrites.cache.map(permission => ({
                    id: permission.id,
                    type: permission.type,
                    allow: permission.allow.toArray(),
                    deny: permission.deny.toArray()
                }));

                channel.permissionOverwrites.set([
                    {
                        id: message.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    }
                ]);
              })
                const maintenanceCategory = await message.guild.channels.create({
                    name: 'maintenance',
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });
    
                const maintenanceText = await message.guild.channels.create({
                    name: 'maintenance-text',
                    type: ChannelType.GuildText,
                    parent: maintenanceCategory.id,
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: maintenanceData.roles,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });
    
                const maintenanceVoice = await message.guild.channels.create({
                    name: 'maintenance-voice',
                    type: ChannelType.GuildVoice,
                    parent: maintenanceCategory.id,
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: maintenanceData.roles,
                            allow: [PermissionsBitField.Flags.ViewChannel]
                        }
                    ]
                });
    
                maintenanceData.maintenanceCategory = maintenanceCategory.id;
                maintenanceData.maintenanceText = maintenanceText.id;
                maintenanceData.maintenanceVoice = maintenanceVoice.id;
            } else {
                if (maintenanceData.savedPermissions) {
                    for (const [channelId, permissions] of Object.entries(maintenanceData.savedPermissions)) {
                        const channel = message.guild.channels.cache.get(channelId);
                        if (channel) {
                            await channel.permissionOverwrites.set(permissions);
                        }
                    }
                }
                if (maintenanceData.maintenanceCategory) {
                    const category = message.guild.channels.cache.get(maintenanceData.maintenanceCategory);
                    if (category) await category.delete();
                }
                if (maintenanceData.maintenanceText) {
                    const textChannel = message.guild.channels.cache.get(maintenanceData.maintenanceText);
                    if (textChannel) await textChannel.delete();
                }
                if (maintenanceData.maintenanceVoice) {
                    const voiceChannel = message.guild.channels.cache.get(maintenanceData.maintenanceVoice);
                    if (voiceChannel) await voiceChannel.delete();
                }
                maintenanceData.maintenanceCategory = null;
                maintenanceData.maintenanceText = null;
                maintenanceData.maintenanceVoice = null;
                maintenanceData.savedPermissions = {};
            }
            await Maintenance.update({
                status: maintenanceData.status,
                roles: maintenanceData.roles,
                savedPermissions: maintenanceData.savedPermissions,
                maintenanceCategory: maintenanceData.maintenanceCategory,
                maintenanceText: maintenanceData.maintenanceText,
                maintenanceVoice: maintenanceData.maintenanceVoice,
                logs_status: maintenanceData.logs_status
            }, { where: { guildId: message.guild.id } });
            
            await upEmb();
        } else if (i.customId === "logs_status" + message.id) {
            maintenanceData.logs_status = !maintenanceData.logs_status;
            await Maintenance.update({logs_status: maintenanceData.logs_status}, {where: {guildId: message.guildId}});
            await upEmb();
        } else if (i.customId === "maintenance_role" + message.id) {
            let quest = await message.channel.send({content: "Quel rôle sera utilisé pour la maintenance ? (donnez son ID)"});
            
            const filter = m => m.author.id === message.author.id;
            const collected = await message.channel.awaitMessages({
                filter,
                max: 1,
                time: 10000,
                errors: ['time']
            });
        
            if (collected.size > 0) {
                const input = collected.first().content;
                let roleId = input
                let role = message.guild.roles.cache.get(roleId);
                console.log(`Rôle récupéré: ${role.name}`);

                if (!role) {
                    return message.reply({ content: "Veuillez préciser un rôle valide." }).then(m => 
                        setTimeout(() => {
                            m.delete()
                        }, client.ms("5s"))
                    );
                }
        
                maintenanceData.roles = role.id;
                await Maintenance.update({roles: maintenanceData.roles}, {where: {guildId: message.guild.id}});
                    
                await quest.delete();
                collected.first().delete(); 
                await upEmb(); 
                
                message.channel.send({content:`Le rôle de maintenance a été mis à jour avec succès : ${role.name}` }).then(m => 
                    setTimeout(() => {
                        m.delete()
                    }, client.ms("5s"))
                );
            }
        }
        
    })
}
