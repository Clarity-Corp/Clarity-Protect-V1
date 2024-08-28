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
    cooldown: 5000,
    userPermissions: [],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async(client, message) => {
        const embed = new EmbedBuilder()
            .setTitle(`🏓 Ping!`)
            .addFields({
                name:"Ping", value:`Calcul en cours`, inline: true
            },{name: "\`Latence Bot\`", value: `${client.ws.ping}ms`, inline:true})
            .setFooter({
                text: client.footer.text,
                iconURL: client.footer.iconURL
            })
            .setThumbnail(client.thumbnail.iconURL)
            .setColor(await client.color);
        const msg = await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        const embed2 = new EmbedBuilder()
            .setTitle(`🏓 Pong!`)
            .addFields(
                {
                    name: "\`API Discord\`", value:`${msg.createdAt - message.createdAt + "ms"}`
                },
                {
                    name:"\`Latence Bot\`", value:`${client.ws.ping}ms`
                }
            )
            .setFooter({
                text: client.footer.text,
                iconURL: client.footer.iconURL
            })
            .setThumbnail(client.thumbnail.iconURL)
            .setColor(await client.color);
        return msg.edit({ embeds: [embed2] })

    }
}
