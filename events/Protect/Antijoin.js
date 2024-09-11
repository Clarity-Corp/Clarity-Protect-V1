const Antijoin = require("../../Structure/Models/Protect/antijoin")
const Logs = require("../../Structure/Models/logs/Logs");
const Owner = require("../../Structure/Models/Buyer/Owner")
const WhiteList = require('../../Structure/Models/Whitelist/index')
module.exports = {
    name: 'guildMemberAdd',
    once: false,
    run: async(client, member) => {
        const {guild} = member
        if(!guild) return
        let data = await Antijoin.findOne({
            where: { guildId: member.guild.id }
        });

        if (!data || !data.status) return;
        let claritylogs = await Logs.findOne({
            where: {
                guildId: member.guild.id
            }
        });
        let clarichannel = client.channels.cache.get(claritylogs);
        if (data.status) {
            if (data.logs_status) {
              if (data.logs)  guild.channels.cache.get(data.logs).send({embeds: [{
                        title: 'Anti-Join',
                        color: client.color,
                        timestamp: new Date(),
                        footer: client.footer,
                        description: `${member} a rejoins le serveur ${guild.name} alors que le Raid-Mode est actif je l'ai donc expulser`
                    }]})
            }
            if(clarichannel) clarichannel.send({embeds: [{
                    title: 'Anti-Join',
                    color: client.color,
                    timestamp: new Date(),
                    footer: client.footer,
                    description: `${member} a rejoins le serveur ${guild.name} alors que le Raid-Mode est actif je l'ai donc expulser` + " " + `${data.counter} tentative de join bloquer`
                }]})
        }
        try {
            await member.send({content: data.message});
        } catch (err) {
            console.log(err);
        } finally {
            await member.kick({reason: "Raid-Mode"});
            await Antijoin.update({counter: data.counter + 1}, { where: { guildId: guild.id}})
        }
    }
}