const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require('discord.js')
const { PermissionsBitField } = require('discord.js');
const Blacklist = require("../../Structure/Models/Protect/blacklist");
module.exports = {
    name: 'blacklistinfo',
    category: 'Owner',
    aliases: ["blinfo"],
    start: "run",
    cooldown: 5000,
    userPermissions: [PermissionsBitField.Flags.Administrator],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async(client, message, args) => {
        let user = client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => null);
        if (!user) return message.reply('Utilisateur introuvable.');
        const whitelist = await Blacklist.findOne({ where: {
            botId: client.user.id,
            userId: user.id
            } });
        if (!whitelist) return message.reply('Utilisateur non blacklist.');
        const userBl = await client.users.fetch(whitelist.userId);
        const authorBl = await client.users.fetch(whitelist.authorId);
        message.reply({
            embeds: [{
                title: `Blacklist de ${user.username}`,
                color: client.color,
                fields: [{ name: 'Utilisateur', value: `Mention: ${userBl}\n Nom d'utilisateur: ${userBl.displayName}\n ID: ${userBl.id}\n Avatar: [Lien](https://cdn.discordapp.com/avatars/${userBl.id}/${userBl.avatar})`, inline: true },
                    { name: "Modérateur", value: `Mention: ${authorBl}\n Nom d'utilisateur: ${authorBl.displayName}\n ID: ${authorBl.id}\n Raison: ${whitelist.reason}\n Avatar: [Lien](https://cdn.discordapp.com/avatars/${authorBl.id}/${authorBl.avatar})`, inline: true },
                    {name: 'Date', value: `<t:${Math.floor(new Date(whitelist.blAt).getTime() / 1000)}:R>`}],
                footer: {
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                },
                thumbnail: {
                    url: client.thumbnail.iconURL
                }
            }]
        })
    }
}