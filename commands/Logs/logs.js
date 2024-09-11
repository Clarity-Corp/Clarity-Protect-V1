const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ChannelSelectMenuBuilder
} = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const Logs = require("../../Structure/Models/logs/Logs");

module.exports = {
    name: "logs",
    description: "Manage logs module",
    category: "Owner",
    cooldown: 5000,
    userPermissions: [PermissionsBitField.Flags.Administrator],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async (client, message, args) => {
        let msg = await message.channel.send({content: 'Chargement du module en cours . . .'});
        await embed(client, message, msg);
    }
}

async function embed(client, message, msg) {
    // Find or create logs data for the guild
    const [logsData, createLogsData] = await Logs.findOrCreate({
        where: {
            guildId: message.guild.id
        },
        defaults: {
            logs_status: false,
            logs_channel: null
        }
    });

    if (createLogsData) {
        console.log(`[DB] Logs Init : ${message.guild.name}`);
    }

    const upEmb = async () => {
        const embed = new EmbedBuilder()
            .setTitle("Logs")
            .setColor(client.color)
            .setDescription(`\`\`\`Logs: ${
                logsData.logs_status
                    ? (logsData.logs_channel && client.channels.cache.get(logsData.logs_channel)
                        ? `${client.channels.cache.get(logsData.logs_channel).name} (ID: ${client.channels.cache.get(logsData.logs_channel).id})`
                        : "✅")
                    : "❌"
            }\`\`\``)
            .setFooter({
                text: client.footer.text,
                iconURL: client.footer.iconURL
            });


        if (logsData.logs_status === true) {
            await msg.edit({
                content: null,
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        custom_id: "log_status_" + message.id, // Updated to ensure unique custom_id
                        emoji: logsData.logs_status ? "1224360246940663931" : "1224360257422233671",
                        style: logsData.logs_status ? 3 : 4
                    }, {
                        type: 2,
                        custom_id: "log_channel_" + message.id,
                        emoji: "1224360244201656380",
                        style: 2
                    }, {
                        type: 2,
                        custom_id: "logs_channel_reset_" + message.id,
                        emoji: '1224360248668848128',
                        style: 2
                    }]
                }]
            });
        } else {
            await msg.edit({
                content: null,
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        custom_id: "log_status_" + message.id, // Updated to ensure unique custom_id
                        emoji: logsData.logs_status ? "1224360246940663931" : "1224360257422233671",
                        style: logsData.logs_status ? 3 : 4
                    }]
                }]
            });
        }
    };


    await upEmb();

    const collector = await msg.createMessageComponentCollector({
        time: client.ms("5m")
    });

    collector.on('collect', async (i) => {
        if (i.user.id !== message.author.id) {
            return i.reply({
                content: "Vous ne pouvez pas utiliser ce bouton",
                ephemeral: true
            });
        }

        if (i.customId.startsWith("log_status_")) { // Check for correct custom_id
            await i.deferUpdate().catch(() => false);

            const newStatus = !logsData.logs_status;

            // Update the status in the database
            await Logs.update(
                { logs_status: newStatus },
                { where: { guildId: message.guild.id } }
            );

            // Update the local logsData object to reflect the new status
            logsData.logs_status = newStatus;

            console.log(`[DB] Logs Module : Status changed : ${logsData.logs_status}`);

            await upEmb();
        }

        if (i.customId.startsWith("log_channel_")) {
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
                    Logs.update({
                        logs_channel: channel.id
                    }, {
                        where: {
                            guildId: message.guild.id
                        }
                    })
                    // Mettre à jour le logsData object pour le nouveau channel.
                    logsData.logs_channel = channel.id;

                    console.log(`[DB] Logs Module : Channel changed : ${logsData.logs_channel}`);
                    await upEmb();
                    quest.delete();
                    cld.first().delete();
                }
            )
        }
        if (i.customId.startsWith("logs_channel_reset_")) {
            await i.deferUpdate().catch(() => false);
            await Logs.update({
                logs_channel: null
            }, {
                where: {
                    guildId: message.guild.id
                }
            });
            logsData.logs_channel = null;
            console.log(`[DB] Logs Module : Channel reset : ${logsData.logs_channel}`);
            await upEmb();
        }
    });



    collector.on('end', collected => {
        console.log(`Collected ${collected.size} interactions.`);
    });
}
