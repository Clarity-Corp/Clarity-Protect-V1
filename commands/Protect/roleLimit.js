const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const roleLimit = require("../../Structure/Models/Protect/RoleLimit")
module.exports = {
    name: "rolelimit",
    category: "Antiraid",
    description: "Manage RoleLimit Module",
    cooldown: 5000,
    userPermissions: [PermissionsBitField.Flags.Administrator],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async (client, message, args) => {
        const isOwn = await client.functions.isOwn(client, message.author.id);
        if (!isOwn) {
            return message.reply({
                content: "Vous n'avez pas la permission d'utiliser cette commande",
            });
        }
    }
}