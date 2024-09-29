const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require('discord.js')
const { PermissionsBitField } = require('discord.js');
const Blacklist = require("../../Structure/Models/Protect/blacklist");
module.exports = {
    name: "blacklist",
    usage: "add/remove/list",
    aliases: ["bl"],
    description: "Manage bot blacklist",
    category: "Owner",
    start: "execute",
    cooldown: 5000,
    userPermissions: [],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    async execute(client, message, args) {
        let isOwner = await client.functions.isOwn(client, message.author.id)
        if (!isOwner) return message.reply({
            content: "Vous n'avez pas la permission requise pour utiliser cette commande"
        })
       let [botWl, createbotWl] = await Blacklist.findOrCreate({where: {botId: client.user.id}})
        if (createbotWl) console.log(`[DB] Blacklist table init : ${client.user.username}`)
            if (!args[0]) {
                return message.reply({ content: "Usage: blacklist <add/remove/list> <utilisateur> [raison]" });
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
                        return message.reply({ content: `${user} vous ne pouvez pas vous auto-blacklist.` });
                    }
                    const existingEntry = await Blacklist.findOne({
                        where: {
                            botId: client.user.id,
                            userId: user.id
                        }
                    })
                    if (existingEntry) {
                        return message.reply({ content: `${user} est déjà blacklist` });
                    }
                    await Blacklist.create({
                        botId: client.user.id,
                        userId: user.id,
                        authorId: message.author.id,
                        reason: reason,
                        blAt: Date.now()
                    });
                    message.reply({ content: `${user} est maintenant blacklist : ${reason}` });
                    client.guilds.cache.forEach(async g => {
                        g.members.ban(user.id, { days: 7, reason: `Blacklisted by ${message.author.username} : ${reason}` });
                    });
                    break;
                    case "remove":
                        if (!user) {
                            return message.reply({
                                content: "Vous devez mentionner un utilisateur"
                            });
                        }
                        const entryToRemove = await Blacklist.findOne({
                            where: {
                                botId: client.user.id,
                                userId: user.id
                            }
                        });
                        if (!entryToRemove) {
                            return message.reply({ content: `${user} n'est pas blacklist` });
                        }
                        await entryToRemove.destroy();
                        message.reply({ content: `${user} est maintenant retiré de la blacklist.` });
                        client.guilds.cache.forEach(async g => {
                            g.members.unban(user.id).catch(() => { });
                        });
                        break;
                    case "list":
                        const blacklist = await Blacklist.findAll({
                            where: {
                                botId: client.user.id
                            }
                        });
                        if (blacklist.length === 0) {
                            return message.reply({ content: "Aucun utilisateur n'est blacklist" });
                        }
                        const blacklistDescriptions = await Promise.all(blacklist.map(async (entry) => {
                            const user = await client.users.fetch(entry.userId).catch(() => null);
                            if (user) {
                                return `[${user.username}](https://discord.com/users/${user.id}) (${user.id})`;
                            }
                            return null;
                        }));
                        
                        const validDescriptions = blacklistDescriptions.filter(desc => desc !== null);
                        
                        if (validDescriptions.length === 0) {
                            return message.reply({ content: "Aucun utilisateur blacklisté n'a pu être trouvé." });
                        }
            
                        message.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Blacklist")
                                    .setColor(client.color)
                                    .setTimestamp()
                                    .setDescription(validDescriptions.join("\n"))
                                    .setFooter({
                                        text: client.footer.text,
                                        iconURL: client.footer.iconURL
                                    })
                            ]
                        });
                        break;
            }
    }
}