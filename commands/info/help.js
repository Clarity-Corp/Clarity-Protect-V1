const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    AttachmentBuilder
} = require('discord.js')
const Help = require('../../Structure/Db/Models/Client/help');
const path = require("path")
module.exports = {
    name: 'help',
    aliases: ['h'],
    usage: '<command>',
    cooldown: 5000,
    userPermissions: [],
    botPermissions: [],
    description: 'Affiche la liste des commandes disponibles ou les détails d\'une commande spécifique.',
    category: 'Info',
    run: async (client, message, args) => {
        let prefix = client.prefix
        const [helpData, createHelpData] = await Help.findOrCreate({
            where: {
                botId: client.user.id
            },
            defaults: {
                style: "menu",
                image: client.user.displayAvatarURL({dynamic: true})
            }
        });
        if (createHelpData) console.log(`[DB] HELP TABLE INIT : ${client.user.username} (${client.user.id})`);
        const commandsByCategory = {};
        client.commands.forEach((command) => {
            if (!commandsByCategory[command.category]) {
                commandsByCategory[command.category] = [];
            }
            commandsByCategory[command.category].push(command);
        });
        const categoryEmojis = {
            Buyer: "🛒",
            Dev: "📚",
            Info: "ℹ️",
            Owner: "👑",
            Antiraid: "⛔",
        };

        const createCommandEmbed = (command) => {
            return new EmbedBuilder()
                .setColor(client.color)
                .setTitle(`Aide pour la commande: ${command.name}`)
                .setDescription(command.description || "Aucune Description")
                .addFields([
                    {
                        name: 'Usage',
                        value: command.usage ? `\`${prefix}${command.name} ${command.usage}\`` : `\`${prefix}${command.name}\``,
                    },
                    {
                        name: 'Cooldown',
                        value: `${command.cooldown / 1000} secondes`,
                    },
                    {
                        name: 'Alias',
                        value: command.aliases ? command.aliases.join(', ') : 'Aucun',
                    }
                ])
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
                .setTimestamp();
        };

        const paginate = (array, pageSize, pageNumber) => {
            return array.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
        };

        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) {
                return message.reply(`La commande \`${commandName}\` n'existe pas.`);
            }

            const embed = createCommandEmbed(command);
            return message.channel.send({embeds: [embed]});
        }
        if (helpData.style === 'onepage') {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle(client.user.username)
                .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL({dynamic: true})})
                .setDescription(`Mon prefix sur le serveur est : \`${prefix}\`\nNombres de commandes: \`${client.commands.size}\`\n\`${prefix}help <commande> pour plus d'info sur une commande\``)
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
                .setThumbnail(client.thumbnail.iconURL)
                .setImage(helpData.image)
                .setTimestamp();
            for (const category in commandsByCategory) {
                const commands = commandsByCategory[category];
                const commandList = commands.map(command => `\`${command.name}\``).join(', ');
                embed.addFields({
                    name: `${categoryEmojis[category]}〢${category} (${commands.length})`,
                    value: commandList,
                    inline: false,
                });
            }
            return message.channel.send({embeds: [embed]});
        }
        if (helpData.style === 'buttons') {
            let page = 0;
            const pages = [];

            for (const category in commandsByCategory) {
                const commands = commandsByCategory[category];
                const chunks = Math.ceil(commands.length / 25);
                for (let i = 0; i < chunks; i++) {
                    const commandList = paginate(commands, 25, i).map(command => `\`${command.name}\``).join(', ');
                    pages.push({
                        name: `${categoryEmojis[category]}〢${category} (${commands.length}) - Page ${i + 1}`,
                        value: commandList
                    });
                }
            }
            const updateMessage = async (interaction, page) => {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle(client.user.username)
                    .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL({dynamic: true})})
                    .setThumbnail(client.thumbnail.iconURL)
                    .addFields([pages[page]])
                    .setImage(helpData.image)
                    .setFooter({
                        text: `${client.footer.text} Commandes total: ${client.commands.size}`,
                        iconURL: client.footer.iconURL
                    });
                const components = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('<<')
                            .setStyle(2)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('>>')
                            .setStyle(2)
                            .setDisabled(page === pages.length - 1)
                    );

                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({embeds: [embed], components: [components]});
                } else {
                    await interaction.update({embeds: [embed], components: [components]});
                }
            }
            let msg = await message.channel.send({
                embeds: [{
                    color: client.color,
                    title: client.user.username,
                    author: {name: client.user.username, iconURL: client.user.displayAvatarURL({dynamic: true})},
                    description: `Mon prefix sur le serveur est : \`${prefix}\`\nNombres de commandes: \`${client.commands.size}\`\n\`${prefix}help <commande> pour plus d'info sur une commande\``,
                    thumbnail: {
                        url: client.thumbnail.iconURL
                    },
                    footer: {
                        text: `${client.footer.text} Commandes total: ${client.commands.size}`,
                        icon_url: client.footer.iconURL
                    },
                    image: {url: helpData.image}, 
                    fields: [pages[page]]
                }],
                components: [new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('<<')
                            .setStyle(2)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('>>')
                            .setStyle(2)
                            .setDisabled(page === pages.length - 1)
                    )]
            });
            const collector = msg.createMessageComponentCollector({componentType: 2, time: 60000});

            collector.on('collect', async i => {
                if (i.user.id !== message.author.id) return i.reply({
                    content: "Vous ne pouvez pas utiliser ce bouton",
                    ephemeral: true
                });

                if (i.customId === 'next') page++;
                else if (i.customId === 'prev') page--;

                await updateMessage(i, page);
            });
        }
        if (helpData.style === 'menu') {
            const embed = new EmbedBuilder()
                .setTitle("Page d'aide des commandes")
                .setColor(client.color)
                .setTimestamp()
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
                .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL({dynamic: true})})
                .setImage(helpData.image)
                .setThumbnail(client.thumbnail.iconURL)
                .setDescription(`Mon prefix sur le serveur est : \`${prefix}\`\nNombres de commandes: \`${client.commands.size}\``);

            const categories = Object.keys(commandsByCategory);
            const selectMenuOptions = categories.map(category => ({
                label: `${category} (${commandsByCategory[category].length})`,
                value: category,
                description: `Affiche les commandes de la catégorie ${category}`
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('commandes-menu')
                .setPlaceholder('Choisissez une catégorie')
                .addOptions(selectMenuOptions);

            const actionRow = new ActionRowBuilder().addComponents(selectMenu);
            const replyMsg = await message.reply({embeds: [embed], components: [actionRow]});

            const filter = i => i.user.id === message.author.id;
            const collector = replyMsg.createMessageComponentCollector({filter, time: 900000});


            const updateCategoryEmbed = async (interaction, category, page) => {
                const commands = commandsByCategory[category];
                const pages = [];
                const chunks = Math.ceil(commands.length / 15);

                for (let i = 0; i < chunks; i++) {
                    const commandList = paginate(commands, 15, i).map(command => `\`${prefix}${command.name}\`\n${command.description || 'Aucune description.'}`).join('\n');
                    pages.push({
                        name: `${categoryEmojis[category]}〢${category} (${commands.length}) - Page ${i + 1}`,
                        value: commandList
                    });
                }

                const categoryEmbed = new EmbedBuilder()
                    .setColor(client.color)
                    .setTimestamp()
                    .setFooter({
                        text: client.footer.text,
                        iconURL: client.footer.iconURL
                    })
                    .setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL({dynamic: true})})
                    .setImage(helpData.image)
                    .setThumbnail(client.thumbnail.iconURL)
                    .setTitle(`🎩 Voici les commandes de la catégorie ${categoryEmojis[category]}〢${category} :`)
                    .setDescription(pages[page]?.value || 'Aucune commande disponible.');
                const paginationButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('prev-page').setLabel('<<').setStyle(2).setDisabled(page === 0),
                    new ButtonBuilder().setCustomId('next-page').setLabel('>>').setStyle(2).setDisabled(page === pages.length - 1)
                );

                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ embeds: [categoryEmbed], components: [actionRow, paginationButtons] });
                } else {
                    await interaction.update({ embeds: [categoryEmbed], components: [actionRow, paginationButtons] });
                }

                return pages;
            }
            let currentCategory = categories[0];
            let currentPage = 0;
            let pages = await updateCategoryEmbed({ update: async () => { } }, currentCategory, currentPage);
            collector.on('collect', async i => {
                await i.deferUpdate();
                if (i.customId === 'commandes-menu') {
                    currentCategory = i.values[0];
                    currentPage = 0;
                    pages = await updateCategoryEmbed(i, currentCategory, currentPage);
                } else {
                    if (i.customId === 'next-page') currentPage++;
                    else if (i.customId === 'prev-page') currentPage--;
                    await updateCategoryEmbed(i, currentCategory, currentPage);
                }
            });

            collector.on('end', collected => {
                replyMsg.edit({ components: [] })
            });
        }
        if (helpData.style === "clarity") {
            let imgPath = path.resolve(__dirname, "../../Structure/Files/Images/head_commandes.png");
            let bxcimg = new AttachmentBuilder(imgPath, { name: 'clarity_help.png' });


            const categoriesDescription = "```" +
                Object.keys(commandsByCategory).map(category => `- ${category}`).join('\n') +
                "```";


            const embed = new EmbedBuilder()
                .setTitle("Page d'aide des commandes")
                .addFields({
                    name: "Information",
                    value: "```" + `▶ Version : ${client.version}` + "```",
                    inline: false,
                }, {
                    name: "📚 Catégories",
                    value: categoriesDescription || "Aucune catégorie disponible.",
                    inline: true,
                }, {
                    name: "📑 Syntaxes",
                    value: "```\n" +
                        `- ${client.prefix}help <commande>\n` +
                        "<> - Obligatoire\n" +
                        "[] - Optionnel\n" +
                        "() - Spécification\n" +
                        "/ - Sépare syntaxes\n" +
                        "```" + "\n" + "```\n" + `Nombre de commandes: ${client.commands.size}` + "```",
                    inline: true,
                })
                .setThumbnail(client.thumbnail.iconURL)
                .setColor(client.color)
                .setFooter({
                    text: client.footer.text,
                    iconURL: client.footer.iconURL
                })
            const categories = Object.keys(commandsByCategory);
            const selectMenuOptions = categories.map(category => ({
                label: `${category} (${commandsByCategory[category].length})`,
                value: category,
                description: `Affiche les commandes de la catégorie ${category}`
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('commandes-menu')
                .setPlaceholder('Choisissez une catégorie')
                .addOptions(selectMenuOptions);

            const homeButton = new ButtonBuilder()
                .setCustomId('home')
                .setEmoji('1277988783874375751')
                .setStyle(2);

            const actionRow = new ActionRowBuilder().addComponents(selectMenu);
            const actionRow2 = new ActionRowBuilder().addComponents(homeButton);
            const replyMsg = await message.reply({ files: [bxcimg] ,embeds: [embed], components: [actionRow], allowedMentions: { repliedUser: false } });
            await message.channel.send({
                content: "https://discord.gg/8RWmR5M9Ub"
            })

            const filter = i => i.user.id === message.author.id;
            const collector = replyMsg.createMessageComponentCollector({ filter, time: 900000 });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'commandes-menu') {
                    const selectedCategory = interaction.values[0];
                    const commandsInCategory = commandsByCategory[selectedCategory];

                    const commandsDescription = "```" +
                        commandsInCategory.map(command => `${command.name}: ${command.description || "Aucune description."}`).join('\n') +
                        "```";

                    const categoryEmbed = new EmbedBuilder()
                        .setTitle(`Commandes pour la catégorie: ${selectedCategory}`)
                        .setDescription(commandsDescription)
                        .setColor(client.color)
                        .setFooter({
                            text: client.footer.text,
                            iconURL: client.footer.iconURL
                        });

                    await interaction.update({ embeds: [categoryEmbed], components: [actionRow, actionRow2] });
                } else if (interaction.customId === 'home') {
                    await interaction.update({ embeds: [embed], components: [actionRow] });
                }
            });

            collector.on('end', collected => {
                replyMsg.edit({ components: [] });
            });
        }
    }
}
