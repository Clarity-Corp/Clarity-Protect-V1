const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require('discord.js')
const { PermissionsBitField } = require('discord.js');
const AntiSpam = require("../../Structure/Models/Protect/antispam");

module.exports = {
    name: "antispam",
    description: "Manage antispam module",
    category: "Antiraid",
    start: "run",
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
        let msg = await message.channel.send({content: 'Chargement du module en cours . . .'});
        await embed(client, message, msg);
    }
}
async function embed(client, message, msg)  {
    
    }