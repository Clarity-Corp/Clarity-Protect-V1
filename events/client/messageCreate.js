const Prefix = require('../../Structure/Models/Guild/Prefix');
const GuildLang = require('../../Structure/Models/Guild/Lang')
const ClientColor = require('../../Structure/Models/Client/Color')
const GuildColor = require('../../Structure/Models/Guild/Color')
const ClientFooter = require("../../Structure/Models/Client/Footer")
const ClientThumbnail = require('../../Structure/Models/Client/Thumbnail')
module.exports = {
    name: 'messageCreate',
    run: async (client, message) => {
        if (message.author.bot) return;
        if (!message.guild) return;

        const [config, create] = await Prefix.findOrCreate({
            where: {
                guildId: message.guildId
            },
            defaults: {
                prefix: '.'
            }
        })

        if (create) console.log(`Created new prefix for guild ${message.guild.name} (${message.guildId})`);

        const [guildLang, createGuildLang] = await GuildLang.findOrCreate({
            where: {
                guildId: message.guildId
            },
            defaults: {
                lang: "fr"
            }
        })
        if (createGuildLang) console.log(`Created new guild lang for guild ${message.guild.name} (${message.guildId})`);

        let lang = await client.lang.get(guildLang ? guildLang.lang : "fr");

        const [clientColor, createClientColor] = await ClientColor.findOrCreate({
            where: {
                botId: client.user.id
        },
            defaults: {
                color: "#3535f8"
            }
        })
        if (createClientColor) console.log(`Created new client color for bot ${client.user.username} (${client.user.id})`);

        let [guildColor, createGuildColor] = await GuildColor.findOrCreate({
            where: {
                guildId: message.guild.id
            },
            defaults: {
                color: clientColor ? clientColor.color : "#3535f8"
            }
        })
        if (createGuildColor) console.log(`Created new guild color for guild ${message.guild.name} (${message.guildId})`);

        let convertColor
        if (guildColor.color.startsWith("#")) {
            // Supprimer le #
            guildColor.color = guildColor.color.slice(1);
            const resp = await client.axios.get(`https://www.thecolorapi.com/id?hex=${guildColor.color}`);
            if (resp.data && resp.data.hex && resp.data.hex.value) {
                const decimal = parseInt(resp.data.hex.clean, 16);
                if (isNaN(decimal)) {
                    throw new Error("Invalid hex color format");
                }
                convertColor = decimal;
            } else {
                throw new Error("Invalid response from API");
            }
        }

        const [clientFooter, createdClientFooter] = await ClientFooter.findOrCreate({
            where: {
                botId: client.user.id
            },
            defaults: {
                text: "Clarity Protect V1",
                iconURL: 'https://cdn.discordapp.com/attachments/1270775157077835787/1276937362965790731/file-hahUxyGWnMgyKwJLEjmUZuXh.png?ex=66cb5817&is=66ca0697&hm=e74d4df674d70bec3d34cc6ab2903616881f22b0fcdc701427bd8a66ca1c668e&'
            }
        })
        if (createdClientFooter) console.log(`Created new client footer for bot ${client.user.id}`);

        const [clientThumbnail, createdClientThumbnail] = await ClientThumbnail.findOrCreate({
            where: {
                botId: client.user.id
            },
            defaults: {
                iconURL: 'https://cdn.discordapp.com/attachments/1270775157077835787/1276937362965790731/file-hahUxyGWnMgyKwJLEjmUZuXh.png?ex=66cb5817&is=66ca0697&hm=e74d4df674d70bec3d34cc6ab2903616881f22b0fcdc701427bd8a66ca1c668e&'
            }
        })
        if (createdClientThumbnail) console.log(`Created new client thumbnail for bot ${client.user.id}`);

        client.footer = clientFooter
        client.color = convertColor;
        client.prefix = config.prefix;
        client.thumbnail = clientThumbnail;


        if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) {
            await message.reply({
                embeds: [{
                    author: {
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    },
                    description: lang.prefix + `\`${client.prefix}\``,
                    color: convertColor,
                    footer: clientFooter,
                    thumbnail: {
                        url: client.thumbnail.iconURL
                    }
                }]
            })
        }

        const escapeRegex = (str) => {
            if (typeof str !== 'string') {
                console.error(`Expected a string but got ${typeof str}:`, str);
                return '';
            }
            return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        };

        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(config.prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;

        const [, matchedPrefix] = message.content.match(prefixRegex);
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/g);
        const commandName = args.shift()?.toLowerCase().normalize();
        if (!commandName) return;
        const cmd = client.commands.get(commandName) || client.aliases.get(commandName);
        if (!cmd) return;

        // Check user permissions
        if (cmd.userPermissions) {
            for (const perm of cmd.userPermissions) {
                if (!message.member.permissions.has(perm)) {
                    return message.reply({ content: `Vous avez besoin de la permission \`${perm}\` pour utiliser cette commande.` });
                }
            }
        }

        // Check bot permissions
        if (cmd.botPermissions) {
            for (const perm of cmd.botPermissions) {
                if (!message.guild.me.permissions.has(perm)) {
                    return message.reply({ content: `Le bot a besoin de la permission \`${perm}\` pour exécuter cette commande.` });
                }
            }
        }

        if (cmd.guildOnly && message.channel.type === "dm") {
            return;
        }
        if (cmd.devOnly && !client.config.clarity.devs.includes(message.author.id)) {
            return;
        }
        if (cmd.buyerOnly && !client.config.buyer.includes(message.author.id)) {
            return;
        }
        if (cmd.bumpOnly && !client.config.owner.includes(message.author.id)) {
            return;
        }
        if (cmd.topGgOnly && !client.config.topGg.includes(message.author.id)) {
            return;
        }
        if (cmd.premiumOnly && !client.config.premium.includes(message.author.id)) {
            return;
        }
        if (cmd.guildOwnerOnly && message.guild.ownerId !== message.author.id) {
            return;
        }
        if (cmd.nsfwOnly && !message.channel.nsfw) {
            return;
        }



        if (cmd.cooldown) {
            if (client.cooldowns.has(`${cmd.name}.${message.author.id}`)) {
                const timeLeft = (client.cooldowns.get(`${cmd.name}.${message.author.id}`) - Date.now()) / 1000;
                return message.reply({ content: `Veuillez attendre ${timeLeft.toFixed(1)} secondes avant d'utiliser cette commande.` });
            } else {
                client.cooldowns.set(`${cmd.name}.${message.author.id}`, Date.now() + cmd.cooldown);
                setTimeout(() => {
                    client.cooldowns.delete(`${cmd.name}.${message.author.id}`);
                }, cmd.cooldown);
            }
        }

        // Execute the command if all checks pass
        try {
            if (cmd.start == "run") {
                try {
                    await cmd.run(client, message, args);
                } catch(e) {
                    console.error(`Error in command ${cmd.name}:`, exports);
                    message.reply({ content: "Une erreur est survenue lors de l'exécution de cette commande." });
                }
               
            } else if (cmd.start == "execute") {
                try {
                    cmd.execute(client, message, args);
                } catch(e) {
                    console.error(`Error in command ${cmd.name}:`, e);
                    message.reply({ content: "[ERROR]:" , e});
                }
            }
           
        } catch (error) {
            console.error(error);
        }




    }
}


