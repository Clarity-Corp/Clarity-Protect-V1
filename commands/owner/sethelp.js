const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require('discord.js')
const { PermissionsBitField } = require('discord.js');
const Help = require('../../Structure/Db/Models/Client/help');
const Owner = require("../../Structure/Db/Models/Buyer/Owner");
module.exports = {
    name: "sethelp",
    category: "Owner",
    cooldown: 5000,
    userPermissions: [],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async (client, message, args) => {
        let isOwner = await Owner.findOne({
            where: {
                botId: client.user.id,
                userId: message.author.id
            }
        });
        if (!isOwner) return message.reply({
            content: "Vous n'avez pas la permission requise pour utiliser cette commande"
        })
        let msg = await message.channel.send({content: 'Chargement du module en cours . . .'});
        await embed(client, message, msg);
    }
}
async function embed(client, message, msg)  {
    const [helpData, createHelpData] = await Help.findOrCreate({
        where: {
            botId: client.user.id
        },
        defaults: {
            style: "menu",
            image: client.user.displayAvatarURL({dynamic: true})
        }
    });
    if (createHelpData) console.log(`[DB] HELP TABLE INIT : ${client.user.username} (${client.user.id})`);

    const upEmb = async () => {
        await msg.edit({
            content: null,
            embeds: [{
                title: client.user.username + " " + "Help Configuration Panel",
                color: client.color,
                description: `Style Actuel : ${helpData.style}`,
                footer: {
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                },
                timestamp: new Date(),
                fields: [
                    {
                        name: "OnePage",
                        value: "onepage",
                        inline: true
                    },
                    {
                        name: "Bouttons",
                        value: "buttons",
                        inline: true
                    }, {
                        name: "Menu",
                        value: "menu",
                        inline: true
                    }, {
                        name: "Clarity",
                        value: "clarity",
                        inline: true
                    }
                ],
                image: {
                    url: helpData.image
                }
            }],
            components: [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: "helpconf" + message.id,
                    options: [
                        {
                            label: "OnePage",
                            value: "onepage"
                        },
                        {
                            label: "Bouttons",
                            value: "buttons"
                        },
                        {
                            label: "Menu",
                            value: "menu"
                        },{
                            label: "Clarity",
                            value: "clarity"
                        }, {
                            label: "Modifier l'image",
                            value: "helpimg"
                        }
                    ]
                }]
            }]
        })
    }
await upEmb()
    let collector = await msg.createMessageComponentCollector({
        time: client.ms("5m")
    })
    collector.on("collect", async(i) => {
        if (i.user.id !== message.author.id) return i.reply({
            content: "Vous ne pouvez pas utiliser cette interaction",
            ephemeral: true
        });
        if (i.customId === 'helpconf' + message.id) {
            await i.deferUpdate().catch({})
            if (i.values[0] === 'onepage') {
                await helpData.update({
                    style: 'onepage'
                })
               await upEmb()
            }  else if (i.values[0] === 'buttons') {
                await helpData.update({
                    style: 'buttons'
                })
                await upEmb()
            } else if (i.values[0] === 'menu') {
                await helpData.update({
                    style:'menu'
                })
                await upEmb()
            } else if(i.values[0] === 'clarity') {
                await helpData.update({
                    style: 'clarity'
                })
                await upEmb()
            } else if (i.values[0] === "helpimg") {
                let quest = await i.channel.send({content: "Quel est la nouvelle image du help?"})
                let rep = await i.channel.awaitMessages({filter: m => m.author.id == i.user.id, max: 1, time: 30_000})
                if (rep.first()) {
                    if (rep.first().content.startsWith("https://")) {
                        await helpData.update({
                            image: rep.first().content
                        })
                        quest.delete()
                        rep.first().delete();
                        await upEmb()
                    } else {
                        quest.delete()
                        await helpData.update({
                            image: rep.first().attachments.first().url
                        })
                        rep.first().delete();
                        await upEmb()
                    }
                }
            }
        }
    })
    }