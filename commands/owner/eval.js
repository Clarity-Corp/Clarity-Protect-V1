module.exports = {
    name: "eval",
    description: "Evaluer une commande",
    category: "Owner",
    start: "execute",
    cooldown: 2000,
    userPermissions: [],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    devOnly: true,
     async execute (client, message, args) {
        let isOwner = await client.functions.isOwn(client, message.author.id)
        if (!isOwner) return message.reply({
            content: "Vous n'avez pas la permission requise pour utiliser cette commande"
        })
        try {
            let codein = args.join(" ");
            let code = eval(codein);
            if (typeof code !== 'string')
                code = require('util').inspect(code, {
                    depth: 0
                });
            message.channel.send({
                embeds: [{
                    description: ":inbox_tray: Entrée \`\`\`js\n"
                        + codein + "\`\`\`\n:outbox_tray: Sortie\`\`\`js\n"
                        + code + "\`\`\`"
                }]
            })
        } catch (e) {
            message.channel.send({ content: `\`\`\`js\n${e}\n\`\`\`` })
        }

    }
};
