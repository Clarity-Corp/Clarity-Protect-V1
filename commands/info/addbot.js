
module.exports = {
    name: "addbot",
    description: "Get Bot invite link",
    category: 'Info',
    cooldown: 5000,
    start: "execute",
    userPermissions: [],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    async execute (client, message, args) {
        let msg = await message.channel.send({
            embeds: [{
                title: "Votre bot",
                description: `[${client.user.username}](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)`,
                color: await client.color,
                footer: {
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                },
                timestamp: new Date()
            }]
        });
    }
};