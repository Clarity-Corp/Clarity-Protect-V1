const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require('discord.js')
const { PermissionsBitField } = require('discord.js');
const Prefix = require("../../Structure/Db/Models/Guild/Prefix");
module.exports = {
    name: "prefix",
    description: "Manage bot prefix",
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
        let newPrefix = args[0];
        if (!newPrefix) return message.channel.send("Merci de fournir un nouveau préfixe.");
        await Prefix.update({ prefix: newPrefix }, { where: { guildID: message.guild.id } });
        return message.channel.send(`Nouveau préfixe : ${newPrefix}`);
    }
}