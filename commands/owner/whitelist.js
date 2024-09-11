const WhiteList = require('../../Structure/Models/Whitelist/index')
module.exports = {
    name: "whitelist",
    description: "Whitelist/unwhitelist des utilisateurs",
    aliases: ["wl"],
    usage: "add/remove/list",
    category: "Owner",
    cooldown: 2000,
    userPermissions: [],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: true,
    run: async (client, message, args) => {
        let [guildUserWl, CreateGuildUserWl] = await WhiteList.findOrCreate({
            where: {
                guildId: message.guild.id
            },
            defaults: {
                userId: message.guild.ownerId,
                reason: `${message.guild.name} Owner`,
                authorId: message.guild.ownerId,
            }
        })
        // console.log
        if(CreateGuildUserWl) console.log(`[DB] WL TABLE INIT : ${message.guild.name}`)
        if (!args[0]) {
            return message.reply({ content: "Usage: whitelist <add/remove/list> <utilisateur> [raison]" });
        }

        const user = message.mentions.members.first() || client.users.cache.get(args[1]) || await client.users.fetch(args[1]).catch(() => { });
        const reason = args.slice(2).join(" ") || "Aucune raison fournie";
        switch (args[0].toLowerCase()) {
            case "add":
                if (!user) {
                    return message.reply({
                        content: "Vous devez mentionner un utilisateur"
                    });
                }

                if (user.id === message.author.id) {
                    return message.reply({ content: `${user} vous ne pouvez pas vous auto-whitelist.` });
                }

                if (user.bot) {
                    return message.reply({ content: `${user} est un bot et ne peut pas être whitelist.` });
                }

                const existingEntry = await WhiteList.findOne({
                    where: {
                        guildId: message.guild.id,
                        userId: user.id
                    }
                });

                if (existingEntry) {
                    return message.reply({ content: `${user} est déjà whitelist` });
                }

                await WhiteList.create({
                    guildId: message.guild.id,
                    userId: user.id,
                    authorId: message.author.id,
                    reason: reason
                });

                message.reply({ content: `${user} est maintenant whitelist : ${reason}` });
                break;

            case "remove":
                if (!user) {
                    return message.reply({
                        content: "Vous devez mentionner un utilisateur"
                    });
                }
                const entryToRemove = await WhiteList.findOne({
                    where: {
                        guildId: message.guild.id,
                        userId: user.id
                    }
                })
                if (!entryToRemove) {
                    return message.reply({ content: `${user} n'est pas whitelist` });
                }
                await WhiteList.destroy({
                    where: {
                        guildId: message.guild.id,
                        userId: user.id
                    }
                });
                message.reply({ content: `${user} est maintenant unwhitelist` });
                break;
            case "list":
                const whitelistEntries = await WhiteList.findAll({
                    where: {
                        guildId: message.guild.id
                    }
                });

                if (whitelistEntries.length === 0) {
                    return message.reply({
                        content: "Il n'y a aucun utilisateur whitelist dans ce serveur"
                    });
                }


                const blList = await Promise.all(whitelistEntries.map(async entry => {
                    const user = await client.users.fetch(entry.userId).catch(() => { });
                    return `[${user.username}](https://discord.com/users/${entry.userId})`;
                }));
                message.reply({
                    embeds: [{
                        title: "Whitelist",
                        description: blList.join("\n"),
                        color: await client.color,
                        footer: client.footer
                    }]
                });
                break;
            default:
                return message.reply({ content: "Usage: whitelist <add/remove/list> <utilisateur> [raison]" });
        }
    }
}