const getNow = () => {
    return {
        time: new Date().toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })
    };
};
const Status = require("../../Structure/Db/Models/Status/index");

module.exports = {
    name: "ready",
    once: true, // Utilisez `true` pour que cela ne se déclenche qu'une fois
    run: async (client) => {
        console.log(`[INVITE] : https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`);
        console.log(`[BOT]: ${client.user.username} est connecté à ${getNow().time}`);
        console.log(`[GUILDS]: ${client.guilds.cache.size}`);
        console.log(`[USERS] ${client.users.cache.size}`);
        console.log(`[COMMANDS] ${client.commands.size}`);
        console.log(`[SCRIPT]: ClarityProtect est connecté au bot ${client.user.username}`);

        const [status, created] = await Status.findOrCreate({
            where: { botId: client.user.id},
            defaults: {
                presence: 'online',
                status: 'Clarity Protect V1',
                type: 'custom'
            }
        })
        if (created) {
            console.log(`[STATUS] Statut créé pour ${client.user.username}`);
            await status.update({
                presence: 'online',
                status: 'Clarity Protect V1',
                type: 'custom'
            });
            client.user.setPresence({
                status: status.presence,
                activities: [{
                    name: status.status,
                    type: 4
                }]
            })
        } else {
            if (status.type === 'custom') {
                client.user.setPresence({
                    status: status.presence,
                    activities: [{
                        name: status.status,
                        type: 4
                    }]
                })
            } else if (status.type === 'stream') {
                const streamUrl = status.url ? `https://twitch.tv/${status.url}` : "https://twitch.tv/tsubasa_poulpy";

                client.user.setPresence({
                    status: status.presence,
                    activities: [{
                        name: status.status,
                        type: 1,
                        url: streamUrl
                    }]
                })
            } else if (status.type === 'watch') {
                client.user.setPresence({
                    status: status.presence,
                    activities: [{
                        name: status.status,
                        type: 3
                    }]
                })
            } else if (status.type === 'listen') {
                client.user.setPresence({
                    status: status.presence,
                    activities: [{
                        name: status.status,
                        type: 2
                    }]
                })
            } else if (status.type === 'compet') {
                client.user.setPresence({
                    status: status.presence,
                    activities: [{
                        name: status.status,
                        type: 5
                    }]
                })
            } else if (status.type === 'play') {
                client.user.setPresence({
                    status: status.presence,
                    activities: [{
                        name: status.status,
                        type: 0
                    }]
                })
            } else if (status.type === 'hang') {
                client.user.setPresence({
                    status: status.presence,
                    activities: [{
                        name: status.status,
                        type: 6
                    }]
                })
            }
            console.log(`[STATUS] Statut mis à jour pour ${client.user.username}`);
        }
    }
};
