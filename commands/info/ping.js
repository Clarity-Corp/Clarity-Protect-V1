const {
    Client,
    Message,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    name: "ping",
    aliases: ["latency"],
    usage: '',
    description: "Gives you information on how fast the Bot can respond to you",
    category: "Info",
    start: "execute",
    cooldown: 5000,
    userPermissions: [],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
     async execute(client, message)  {
        const embed = new EmbedBuilder()
            .setTitle(`🏓 Ping!`)
            .addFields({name: "\`Ping\`", value: `${client.ws.ping}ms`, inline:true})
            .setFooter({
                text: client.footer.text,
                iconURL: client.footer.iconURL
            })
            .setThumbnail(client.thumbnail.iconURL)
            .setColor(await client.color);
       await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    }
}
