const {EmbedBuilder} = require("discord.js")
module.exports = {
    name: "set",
    description: "change bot profile",
    usage: "set <name/pic/banner> <value>",
    category: "Owner",
    start: "run",
    cooldown: 2000,
    userPermissions: [],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    devOnly: true,
    run: async (client, message, args) => {
        let isOwner = await client.functions.isOwn(client, message.author.id)
        if (!isOwner) return message.reply({
            content: "Vous n'avez pas la permission requise pour utiliser cette commande"
        })

        if (!args[0]) return message.reply({
            content: "Veuillez spécifier ce que vous voulez changer (name/pic/banner)"
        });
        switch (args[0].toLowerCase()) {
            case "name":
                if (!args[1]) return message.reply({
                    content: "Veuillez spécifier un nouveau nom pour le bot"
                });
                try {
                    await client.user.setUsername(args.slice(1).join(" "))
                    message.reply({
                        content: `Le nom du bot a été changé en : ${args.slice(1).join(' ')}`
                    })
                } catch(e) {
                    console.error(e);
                    message.reply({
                        content: "[ERROR] :", e
                    });
                }
                break;

            case "pic":
                if (!message.attachments.first() && !args[1]) return message.reply({
                    content: "Veuillez fournir une image pour l'avatar du bot"
                });
                const avatarUrl = message.attachments.first()?.url || args[1];
                try {
                    await client.user.setAvatar(avatarUrl)
                    message.reply({
                        content: `L'avatar du bot a été changé pour : ${avatarUrl}`
                    })
                }catch(e) {
                    console.error(e);
                    message.reply({
                        content: "[ERROR] :", e
                    });
                }
                break; 

            case "banner":
                if (!message.attachments.first() && !args[1]) return message.reply({
                    content: "Veuillez fournir une image pour le bannieire du bot"
                });
                const bannerUrl = message.attachments.first()?.url || args[1];
                try {
                    await client.user.setBanner(bannerUrl)
                    message.reply({
                        content: `Le banniere du bot a été changé pour : ${bannerUrl}`
                    })
                }catch(e) {
                    console.error(e);
                    message.reply({
                        content: "[ERROR] :", e
                    });
                }
                break;
        }
    }
};
