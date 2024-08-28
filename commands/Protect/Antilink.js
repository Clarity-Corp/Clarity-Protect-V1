const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require('discord.js')
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
    run: async(client, message, args) => {
        let msg = await message.channel.send({content: 'Chargement du module en cours . . .'});
        await embed(client, message, msg);
    }
}
async function embed(client, message, msg) {
    let [antilinkData, createAntilinkData] = await Antilink.findOrCreate({
        where: {
            guildId: message.guild.id
        },
        defaults: {
            status: false
        }
    });
    if (createAntilinkData) console.log(`[DB] Antilink Table Init : ${message.guild.name} (${message.guild.id})`)
    const upEmb = async () => {
        const embed = new EmbedBuilder()
        embed.setTitle(`${message.guild.name} : AntiLink`)
        embed.setDescription(`\`\`\`État: ${antilinkData.status ? "✅" : "❌"}\nLogs: ${antilinkData.logs_status ? (antilinkData.logs && client.channels.cache.get(antilinkData.logs) ? `${client.channels.cache.get(antilinkData.logs).name} (ID: ${client.channels.cache.get(antilinkData.logs).id})` : "✅") : "❌"}\nPermission: ${antilinkData.permission_allowed ? "✅" : "❌"}\nPunition: ${antilinkData.sanction}\nPunition Admin: ${antilinkData.sanction_admin}\nAutorisé: ${antilinkData.bypass_status ? (antilinkData.bypass > 0 ? `${antilinkData.bypass.length}` : "✅") : "❌"}\`\`\`
`);
        embed.setFooter({
            text: client.footer.text,
            iconURL: client.footer.iconURL
        })
        embed.setTimestamp()
        embed.setColor(client.color);
        if (antilinkData.logs_status === true ) {
            await msg.edit({
                content: null,
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "sanction" + message.id,
                        placeholder: "Sanction",
                        options: [{
                            label: "mute",
                            value: "mute"
                        }, {
                            label: "kick",
                            value: "kick"
                        }, {
                            label: "ban",
                            value: "ban"
                        }, {
                            label: "derank",
                            value: "derank"
                        }]
                    }]
                }, {
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "admin_sanction" + message.id,
                        placeholder: "Sanction Admin",
                        options: [{
                            label: "kick",
                            value: "kick"
                        }, {
                            label: "ban",
                            value: "ban"
                        }, {
                            label: "derank",
                            value: "derank"
                        }]
                    }]
                }, {
                    type: 1,
                    components: [{
                        type: 2,
                        custom_id: "activate_antilink" + message.id,
                        emoji: antilinkData.status ? "1224360246940663931" : "1224360257422233671",
                        style: antilinkData.status ? 3 : 4
                    }, {
                        type: 2,
                        custom_id: "logs_status" + message.id,
                        emoji: antilinkData.logs_status ? "1277989435065237575" : "1277988800076709918",
                        style: 2
                    }, {
                        type: 2,
                        custom_id: "logs_channel" + message.id,
                        emoji: antilinkData.logs_status ? "1277988776760705037" : "1277988774785192040",
                        style: 2
                    }, {
                        type: 2,
                        custom_id: "ignore_perm_status" + message.id,
                        emoji: antilinkData.permission_allowed ? "1278009272852025395" : "1277988790245523618",
                        style: 2
                    }]
                }]
            })
        } else {
            await msg.edit({
                content: null,
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "sanction" + message.id,
                        placeholder: "Sanction",
                        options: [{
                            label: "mute",
                            value: "mute"
                        }, {
                            label: "kick",
                            value: "kick"
                        }, {
                            label: "ban",
                            value: "ban"
                        }, {
                            label: "derank",
                            value: "derank"
                        }]
                    }]
                }, {
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "admin_sanction" + message.id,
                        placeholder: "Sanction Admin",
                        options: [{
                            label: "kick",
                            value: "kick"
                        }, {
                            label: "ban",
                            value: "ban"
                        }, {
                            label: "derank",
                            value: "derank"
                        }]
                    }]
                }, {
                    type: 1,
                    components: [{
                        type: 2,
                        custom_id: "activate_antilink" + message.id,
                        emoji: antilinkData.status ? "1224360246940663931" : "1224360257422233671",
                        style: antilinkData.status ? 3 : 4
                    }, {
                        type: 2,
                        custom_id: "logs_status" + message.id,
                        emoji: antilinkData.logs_status ? "1277989435065237575" : "1277988800076709918",
                        style: 2
                    }, {
                        type: 2,
                        custom_id: "ignore_perm_status" + message.id,
                        emoji: antilinkData.permission_allowed ? "1278009272852025395" : "1277988790245523618",
                        style: 2
                    }]
                }]
            })
        }
    }
    await upEmb()
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
        if (i.customId.startsWith("activate_antilink")) {
            await i.deferUpdate().catch(() => false);
            const newStatus = !antilinkData.status
            await Antilink.update({
                status: newStatus
            }, {
                where: { guildId: message.guild.id }
            })
            antilinkData.status = newStatus
            await upEmb()
        }
        if (i.customId.startsWith("logs_status")) {
            await i.deferUpdate().catch(() => false);
            const newStatus = !antilinkData.logs_status;
            await Antilink.update({
                logs_status: newStatus
            }, {
                where: { guildId: message.guild.id}
            })
            antilinkData.logs_status = newStatus;
            await upEmb();
        }
        if (i.customId.startsWith("logs_channel")) {
            await i.deferUpdate().catch(() => false);
            let quest = await message.channel.send({
                content: "Quel est le channel ? "
            })
            let messCollector = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: client.ms('2m'), errors: ["time"] }).then(
                async (cld) => {
                    const channelIdRegex = /<#(\d+)>/;
                    let channelId;

                    if (channelIdRegex.test(cld.first().content)) {
                        channelId = cld.first().content.match(channelIdRegex)[1];
                    } else {
                        channelId = cld.first().content;
                    }
                    // Récupérer le canal.
                    let channel = await client.channels.fetch(channelId);

                    // Vérifier si le canal existe.
                    if (!channel) {
                        await message.channel.send({content: "Je n'ai pas pu trouver le canal. Veuillez réessayer en mentionnant le canal ou en donnant son ID."}) ;
                    }

                    // Mettre à jour le channel dans la base de données.
                    Antilink.update({
                        logs: channel.id
                    }, {
                        where: {
                            guildId: message.guild.id
                        }
                    })
                    // Mettre à jour le logsData object pour le nouveau channel.
                    antilinkData.logs = channel.id;

                    console.log(`[DB] Antilink Module : Logs Channel changed : ${antilinkData.logs}`);
                    await upEmb();
                    quest.delete();
                    cld.first().delete();
                }
            )
        }
        if (i.customId.startsWith("ignore_perm_status")) {
            await i.deferUpdate().catch(() => false);
            const newStatus = !antilinkData.permission_allowed;
            await Antilink.update({
                permission_allowed: newStatus
            }, {
                where: {
                    guildId: message.guild.id
                }
            });
            antilinkData.permission_allowed = newStatus;
            await upEmb();
        }
        if (i.customId.startsWith("sanction")) {
            await i.deferUpdate().catch(() => false);
            antilinkData.sanction = i.values[0];
            await Antilink.update({
                sanction: antilinkData.sanction
            }, {
                where: {
                    guildId: message.guild.id
                }
            });
            await upEmb();
        }
        if (i.customId.startsWith("admin_sanction")) {
            await i.deferUpdate().catch(() => false);
            antilinkData.sanction_admin = i.values[0];
            await Antilink.update({
                sanction: antilinkData.sanction_admin
            }, {
                where: {
                    guildId: message.guild.id
                }
            });
            await upEmb();
        }
    })

}

