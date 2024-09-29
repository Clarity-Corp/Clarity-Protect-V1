const { PermissionsBitField } = require('discord.js');
const voiceLimit = require("../../Structure/Models/Protect/voiceLimit");

module.exports = {
    name: 'voicelimit',
    category: "Antiraid",
    description: "Manage voicelimit module",
    start: "run",
    cooldown: 5000,
    userPermissions: [PermissionsBitField.Flags.Administrator],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async (client, message, args) => {
        if (!args[0]) {
            return message.reply({
                content: "Veuillez bien utiliser la commande : `<voicelimit set>` / `<voicelimit remove>` / `<voicelimit list>`"
            });
        }

        const [db, dbCreated] = await voiceLimit.findOrCreate({ 
            where: { guildId: message.guildId }, 
            defaults: { channelId: null, limit: 2 }
        });
        if (dbCreated) console.log(`[DB] Voice Limit TABLE INIT : ${message.guild.name} (${message.guildId})`);

        const getVoiceChannel = () => {
            return message.mentions.channels.first() || 
                   (args[1] ? message.guild.channels.cache.get(args[1]) : null) || 
                   message.member.voice.channel;
        };

        switch(args[0]) {
            case "set":
                await handleSetCommand(message, args, getVoiceChannel, client, db);
                break;
            case "remove":
                await handleRemoveCommand(message, getVoiceChannel, client);
                break;
            case "list":
                await handleListCommand(message, client);
                break;
            default:
                message.reply({ content: "Commande invalide. Utilisez `set`, `remove`, ou `list`." }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
        }
    }
};

async function handleSetCommand(message, args, getVoiceChannel, client, db) {
    const voiceChannel = getVoiceChannel();
    if (!voiceChannel || voiceChannel.type !== 2) {
        return message.reply({ content: "Veuillez mentionner un canal vocal valide ou être connecté à un canal vocal." }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
    }

    const limit = parseInt(args[2], 10) || 2;
    if (isNaN(limit) || limit < 0) {
        return message.reply({ content: "Veuillez préciser une limite d'utilisateur valide (nombre positif)." }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
    }

    await voiceLimit.upsert({
        guildId: message.guildId,
        channelId: voiceChannel.id,
        limit: limit
    });

    message.reply({
        embeds: [{
            description: `La limite de ${voiceChannel} est de ${limit} utilisateurs !`,
            color: client.color,
            footer: { text: client.footer.text, icon_url: client.footer.iconURL },
            timestamp: new Date(),
            thumbnail: { url: client.user.displayAvatarURL({ dynamic: true }) },
            author: { name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) }
        }]
    }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
}

async function handleRemoveCommand(message, getVoiceChannel, client) {
    const voiceChannel = getVoiceChannel();
    if (!voiceChannel || voiceChannel.type !== 2) {
        return message.reply({ content: "Veuillez mentionner un canal vocal valide ou être connecté à un canal vocal." }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
    }

    const deletedCount = await voiceLimit.destroy({
        where: { guildId: message.guildId, channelId: voiceChannel.id }
    });

    if (deletedCount === 0) {
        return message.reply({ content: "Ce salon n'est pas limité." }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
    }

    message.reply({
        embeds: [{
            description: `La limite de ${voiceChannel} est supprimée !`,
            color: client.color,
            footer: { text: client.footer.text, icon_url: client.footer.iconURL },
            timestamp: new Date(),
            thumbnail: { url: client.user.displayAvatarURL({ dynamic: true }) },
            author: { name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) }
        }]
    }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
}

async function handleListCommand(message, client) {
    const voiceChannels = await voiceLimit.findAll({ where: { guildId: message.guildId } });

    if (voiceChannels.length === 0) {
        return message.reply({ content: "Aucun salon vocal avec une limite de voix n'a été trouvé." }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
    }

    message.reply({
        embeds: [{
            description: `Les limites de voix sont :`,
            color: client.color,
            footer: { text: client.footer.text, icon_url: client.footer.iconURL },
            timestamp: new Date(),
            thumbnail: { url: client.user.displayAvatarURL({ dynamic: true }) },
            author: { name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) },
            fields: voiceChannels.map(vc => ({
                name: message.guild.channels.cache.get(vc.channelId)?.name || 'Canal inconnu',
                value: `Limite : ${vc.limit}`
            }))
        }]
    }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
}