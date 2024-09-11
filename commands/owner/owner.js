const Owner = require("../../Structure/Models/Buyer/Owner");
module.exports = {
    name: "owner",
    description: "Owner/unowner des utilisateurs",
    aliases: [],
    usage: "add/remove/list",
    category: "Owner",
    cooldown: 2000,
    userPermissions: [],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async (client, message, args) => {
        if (message.author.id !== client.config.bot.buyer) return message.channel.send({content: "Vous n'avez pas la perm d'utiliser cette commande"});
        let [ownerData , createownerData] = await Owner.findOrCreate({
            where: {
                botId: client.user.id
            },
            defaults: {
                userId: client.config.bot.buyer
            }
        })
        if (createownerData) console.log(`[DB] Owner table init : ${client.user.username}`);
        const user = message.mentions.members.first() || client.users.cache.get(args[1]) || await client.users.fetch(args[1]).catch(() => { });
        switch (args[0].toLowerCase()) {
            case "add":
                if (!user) {
                    return message.reply({
                        content: "Vous devez mentionner un utilisateur"
                    });
                }

                if (user.id === message.author.id) {
                    return message.reply({ content: `${user} vous ne pouvez pas vous auto-owner.` });
                }
                if (user.bot) {
                    return message.reply({ content: `${user} est un bot et ne peut pas être owner bot.` });
                }
                const alreadyOwn = await Owner.findOne({
                    where: {
                        botId: client.user.id,
                        userId: user.id
                    }
                });
                if (alreadyOwn) {
                    return message.reply({ content: `${user} est déjà owner bot` });
                }
                await Owner.create({
                    botId: client.user.id,
                    userId: user.id
                });
                message.reply({ content: `${user} est maintenant owner bot` });
                break;
            case "remove":
                if (!user) {
                    return message.reply({
                        content: "Vous devez mentionner un utilisateur"
                    });
                }
                const isOwner = await Owner.findOne({
                    where: {
                        botId: client.user.id,
                        userId: user.id
                    }
                })
                if (!isOwner) {
                    return message.reply({ content: `${user} n'est pas owner bot` });
                }
                await Owner.destroy({
                    where: {
                        botId: client.user.id,
                        userId: user.id
                    }
                })
                message.reply({ content: `${user} n'est plus owner bot` });
                break;
            case "list":
                const whitelistEntries = await Owner.findAll({
                    where: {
                        botId: client.user.id
                    }
                });

                if (whitelistEntries.length === 0) {
                    return message.reply({
                        content: "Il n'y a aucun owner bot"
                    });
                }
                const blList = await Promise.all(whitelistEntries.map(async entry => {
                    const user = await client.users.fetch(entry.userId).catch(() => { });
                    return `[${user.username}](https://discord.com/users/${entry.userId})`;
                }));
                message.reply({
                    embeds: [{
                        title: "Owner",
                        description: blList.join("\n"),
                        color: await client.color,
                        footer: client.footer
                    }]
                });
                break;
            default:
                return message.reply({ content: "Usage: owner <add/remove/list> <utilisateur>" });
        }
    }}