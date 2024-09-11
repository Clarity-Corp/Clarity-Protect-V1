const Verif = require("../../Structure/Models/Protect/verif")
module.exports = {
    name: 'interactionCreate',
    run: async(client, interaction) => {
        if (!interaction.isButton()) return;
        if(!interaction.guild) return;
        let db = await Verif.findOne({where: {guildId: interaction.guildId}})
        const { customId, user } = interaction;
        if(customId.startsWith('passverif')){

            const member = interaction.guild.members.cache.get(user.id);
            if(!member){
                return;
            }
            if (db.status && !member.roles.cache.has(db.roleId)) {
                await member.roles.add(db.roleId);
                await interaction.reply({ content: `${db.emoji} verification passer avec succes : <@&${db.roleId}> ajouter` , flags: 64});
            }
            else if (db.status  & member.roles.cache.has(db.roleId)){
                return;
            }
            else {
                await interaction.reply({ content: `${db.emoji} Le systeme de verif est actuellement desactiver` , flags: 64});
            }
        }

    }
}