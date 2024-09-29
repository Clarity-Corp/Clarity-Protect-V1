const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require('discord.js')
const { PermissionsBitField } = require('discord.js');
const Blacklist = require("../../Structure/Models/Protect/blacklist");
module.exports = {
    name: 'guildMemberAdd',
    once:false,
    run: async(client, member) => {
        const {guild} = member
        if(!guild) return
        let data = await Blacklist.findOne({
            where: { botId: client.user.id , userId: member.user.id}
        })
        if(!data) {
            return;
        } else {
            // get the author saved in the data
            const author = await client.users.fetch(data.authorId);
            // ban member with the reason
            member.ban({reason: data.reason})
        }

    }
}