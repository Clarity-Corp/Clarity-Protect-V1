const Discord = require("discord.js")
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
const Verif = require("../../Structure/Models/Protect/verif")
module.exports = {
    name: "verif",
    description: "Manage verif module",
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
    let [verifData, verifDataCreate] = await Verif.findOrCreate({
        where: { guildId: message.guildId },
        defaults: { status: false }
    });
    if (verifDataCreate) console.log(`[DB] Verif Table Init : ${message.guild.name} (${message.guildId})`);

const upEmb = async () => {
   await msg.edit({
        content: null,
        embeds: [{
            title: 'Configurer la vérification du serveur',
            color: client.color,
            footer: client.footer,
            timestamp: new Date(),
            fields: [
                {
                    name: 'Channel',
                    value: `${client.channels.cache.get(verifData.channelId) ? client.channels.cache.get(verifData.channelId) : 'Aucun'}`,
                    inline: true
                }, {
                    name: 'Role',
                    value: `<@&${verifData.roleId}>` ? `<@&${verifData.roleId}>` : 'Non configurer',
                    inline: true
                }, {
                    name: 'Message',
                    value: `${verifData.message ? verifData.message : 'Message Automatique'}`,
                    inline: true
                }, {
                    name: 'Emoji du bouton',
                    value: `${verifData.emoji ? verifData.emoji : 'Aucun'}`,
                    inline: true
                }, {
                    name: 'Text du bouton',
                    value: `${verifData.text ? verifData.text : 'Aucun'}`,
                    inline: true
                }, {
                    name: 'Statut',
                    value: verifData.status ? '✅ Activer' : '❌ Désactiver',
                    inline: true
                }
            ]
        }], components: [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'verifconfig' + message.id,
                options: [{
                    label: 'Channel',
                    value: 'configchan'
                }, {
                    label: 'Role',
                    value: 'configrole'
                }, {
                    label: 'Bouton',
                    value: 'configbouton'
                }, {
                    label: 'Confirmer',
                    value: 'configsubmit'
                }]
            }]
        }, {
            type: 1,
            components: [{
                type: 2,
                label: "Status",
                style: 2,
                custom_id: 'verifstatus' + message.id
            }]
        }]
    })
}

await upEmb();

    const collector = message.channel.createMessageComponentCollector({ time: client.ms("5m") });
    collector.on("collect", async (i) => {
        if (i.user.id !== message.author.id) {
            return i.reply({
                content: "Vous ne pouvez pas utiliser cette interaction",
                ephemeral: true
            });
        }
        await i.deferUpdate().catch(() => false);

        if (i.customId === 'verifconfig' + message.id) {
            switch(i.values[0]) {
                case 'configchan':
                    const channelrow = new Discord.ActionRowBuilder().addComponents(
                        new Discord.ChannelSelectMenuBuilder()
                            .setCustomId('verif_setup_channel_' + message.id)
                            .setMinValues(1)
                            .setMaxValues(1)
                            .addChannelTypes(0)
                    )
                    msg.edit({
                        embeds: [{
                            title: 'Quel est le channel de la vérification',
                            color: client.color,
                            footer: client.footer,
                            timestamp: new Date(),
                            description: 'Choisissez le channel',
                        }], components: [channelrow]
                    });
                    break;
                case 'configrole':
                    const salonrow = new Discord.ActionRowBuilder().addComponents(
                        new Discord.RoleSelectMenuBuilder()
                            .setCustomId('verif_setup_role_' + message.id)
                            .setMaxValues(25)
                    )
                    msg.edit({
                        embeds: [{
                            title: 'Quels sont les roles a donner apres la verification',
                            color: client.color,
                            footer: client.footer,
                            timestamp: new Date(),
                            description: 'Choisissez les roles',
                            fields: [
                                {
                                    name: 'Role',
                                    value: `<@&${verifData.roleId}>` ? `<@&${verifData.roleId}>` : 'Non configurer',
                                    inline: true
                                }
                            ]
                        }], components: [salonrow]
                    })
                    break;
                case 'configbouton':
                    await msg.edit({
                        content: null,
                        embeds: [{
                            title: 'Configurer la vérification du serveur',
                            color: client.color,
                            footer: client.footer,
                            timestamp: new Date(),
                            fields: [
                                {
                                    name: 'Channel',
                                    value: `${client.channels.cache.get(verifData.channelId) ? client.channels.cache.get(verifData.channelId) : 'Aucun'}`,
                                    inline: true
                                }, {
                                    name: 'Role',
                                    value: `<@&${verifData.roleId}>` ? `<@&${verifData.roleId}>` : 'Non configurer',
                                    inline: true
                                }, {
                                    name: 'Message',
                                    value: `${verifData.message ? verifData.message : 'Message Automatique'}`,
                                    inline: true
                                }, {
                                    name: 'Emoji du bouton',
                                    value: `${verifData.emoji ? verifData.emoji : 'Aucun'}`,
                                    inline: true
                                }, {
                                    name: 'Text du bouton',
                                    value: `${verifData.text ? verifData.text : 'Aucun'}`,
                                    inline: true
                                }, {
                                    name: 'Statut',
                                    value: verifData?.status ? '✅ Activer' : '❌ Désactiver',
                                    inline: true
                                }
                            ]
                        }], components: [{
                            type: 1,
                            components: [{
                                type: 2,
                                style: 1,
                                label: 'Modifier le texte du bouton',
                                customId: 'veriftext' + message.id
                            }, {
                                type: 2,
                                style: 1,
                                label: 'Modifier l\'emoji du bouton',
                                customId: 'verifemoji' + message.id
                            }, {
                                type: 2,
                                style: 1,
                                label: 'Retour',
                                customId: 'back' + message.id
                            }]
                        }]
                    })
                    break;
                case 'configsubmit':
                    if (!verifData.channelId || !verifData.roleId) {
                        return i.reply({
                            content: 'Veuillez configurer le channel et les roles',
                            ephemeral: true
                        })
                    } else {
                        let channel = client.channels.cache.get(verifData.channelId)
                        if (!channel) {
                            return i.reply({
                                content: 'Veuillez configurer le channel',
                                ephemeral: true
                            })
                        }
                        const buttons = [];
                        const button = new Discord.ButtonBuilder()
                            .setStyle(2)
                            .setLabel(verifData.text)
                            .setEmoji(verifData.emoji)
                            .setCustomId(`passverif`);

                        buttons.push(button);
                        const embed = new Discord.EmbedBuilder()
                            .setTitle('Verification')
                            .setDescription(message.guild.name + ' verif anti bot/anti token')
                            .setColor(client.color)
                            .setFooter({
                                text: client.footer.text,
                                iconURL: client.footer.iconURL
                            })
                        const row = new Discord.ActionRowBuilder().addComponents(...buttons);
                        channel.send({ embeds: [embed], components: [row] })
                        msg.edit({ components: [] })
                    }
                    break;
            }


        }
        if (i.customId === 'verifstatus' + message.id) {
            verifData.status = !verifData.status;
            Verif.update({status: verifData.status}, {where: {guildId: message.guildId}});
            await upEmb();
        } else if (i.customId === 'verif_setup_role_' + message.id) {
            verifData.roleId = i.values[0];
            Verif.update({roleId: verifData.roleId}, {where: {guildId: message.guildId}});
            await upEmb();
        } else if (i.customId === 'verif_setup_channel_' + message.id) {
            verifData.channelId = i.values[0];
            Verif.update({channelId: verifData.channelId}, {where: {guildId: message.guildId}});
            await upEmb();
        } else  if (i.customId === 'veriftext' + message.id) {
            const filter = response => response.author.id === message.author.id;
            const sentMessage = await message.channel.send("Quel est le **text **du systeme de verification ?");
            try {
                const collected = await message.channel.awaitMessages({ filter, max: 1, time: client.ms("1m"), errors: ['time'] });
                const msgcollect = collected.first().content.trim();
                verifData.text = msgcollect;
                await Verif.update({text: verifData.text}, {where: { guildId: message.guildId}});
                await sentMessage.delete();
                await collected.first().delete();
                await upEmb();
            } catch (e) {
                console.log(e)
            }
        } else if (i.customId === 'verifemoji' + message.id) {
            const filter = response => response.author.id === message.author.id;
            const sentMessage = await message.channel.send("Quel est l\'**emoji **du systeme de verification ?");
            try {
                const collected = await message.channel.awaitMessages({ filter, max: 1, time: client.ms("1m"), errors: ['time'] });
                const emojiInput = collected.first().content.trim();
                let emojiName;
                if (emojiInput.startsWith('<:') && emojiInput.endsWith('>')) {
                    emojiName = emojiInput.match(/:(.*):/)[1];
                } else {
                    emojiName = emojiInput;
                }
                verifData.emoji = emojiInput;
                Verif.update({emoji: verifData.emoji}, {where: {guildId: message.guildId}});
                await sentMessage.delete();
                await collected.first().delete();
                await upEmb();
            } catch (e) {
                console.log(e)
            }
        } else if (i.customId === 'back' + message.id) {
            await upEmb();
        }
    })


}