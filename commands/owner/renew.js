const Discord = require("discord.js")
const { PermissionsBitField } = require("discord.js")
module.exports = {
    name: "renew",
    aliases: ["nuke", "clone"],
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
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel
        if (channel === message.channel) {
            try {
                let ee = await channel.clone({
                    name: channel.name,
                    permissions: channel.permissionsOverwrites,
                    type: channel.type,
                    topic: channel.withTopic,
                    nsfw: channel.nsfw,
                    birate: channel.bitrate,
                    userLimit: channel.userLimit,
                    rateLimitPerUser: channel.rateLimitPerUser,
                    permissions: channel.withPermissions,
                    position: channel.rawPosition,
                    reason:  `Salon recréé par ${message.author.tag} (${message.author.id})`
                })
                channel.delete()
                ee.send({ content: `${message.author} salon recréé` })
            } catch(error) {
                console.log(error)
            }
        } else {
            try {
                let ee = await channel.clone({
                    name: channel.name,
                    permissions: channel.permissionsOverwrites,
                    type: channel.type,
                    topic: channel.withTopic,
                    nsfw: channel.nsfw,
                    birate: channel.bitrate,
                    userLimit: channel.userLimit,
                    rateLimitPerUser: channel.rateLimitPerUser,
                    permissions: channel.withPermissions,
                    position: channel.rawPosition,
                    reason:  `Salon recréé par ${message.author.tag} (${message.author.id})`
                })
                channel.delete()
                ee.send({ content: `${message.author} salon recréé` })
            } catch(err) {
                console.log(err)
            }
        }
    }
}