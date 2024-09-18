const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require('discord.js')
const { PermissionsBitField } = require('discord.js');
const Lock = require("../../Structure/Models/Protect/Lock")
module.exports = {
    name: "lock",
    description: "Lock the channel",
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
        let isOwner = await client.functions.isOwn(client, message.author.id)
        if (!isOwner) return message.reply({
            content: "Vous n'avez pas la permission requise pour utiliser cette commande"
        })
        let [LockData, LockDataCreated] = await Lock.findOrCreate({where: { guildId: message.guildId}, defaults: {isLocked: false} })
        if (LockDataCreated) console.log(`[DB] Lock Table INIT: ${message.guild.name} (${message.guildId}`);
        const channel = message.mentions.channels.first() || message.channel;
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || await message.guild.roles.fetch(args[0]).catch(()=> {});
        // edit channel perm with the role id if the role if mentionned
        if (role) {
            channel.permissionOverwrites.edit(role.id, {
                SendMessages: false
            }).then(async () => {
                LockData.isLocked = !LockData.isLocked
                LockData.channelId = channel.id;
                Lock.update({isLocked: LockData.isLocked, channelId: LockData.channelId},{where: {guildId: message.guildId}})
                await message.channel.send({ content: channel.name + " " + "lock avec succès" }).then(m => { setTimeout(() => {m.delete()}, client.ms("5s"))});
              })
              .catch(async (e) => {
                await message.channel.send({
                  content: `Je n'ai pas les permissions pour lock ${channel.name}`,
                })
              });

        } else {
            channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            }).then(async () => {
                LockData.isLocked = !LockData.isLocked
                LockData.channelId = channel.id;
                Lock.update({isLocked: LockData.isLocked, channelId: LockData.channelId},{where: {guildId: message.guildId}})
                await message.channel.send({ content: channel.name + " " + "lock avec succès" }).then(m => { setTimeout(() => {m.delete()}, client.ms("5s"))});
              })
              .catch(async (e) => {
                await message.channel.send({
                  content: `Je n'ai pas les permissions pour lock ${channel.name}`,
                })
              });
        }
    }
}