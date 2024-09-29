const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const roleLimit = require("../../Structure/Models/Protect/RoleLimit")
module.exports = {
    name: "rolelimit",
    category: "Antiraid",
    start: "run",
    description: "Manage RoleLimit Module",
    cooldown: 5000,
    userPermissions: [PermissionsBitField.Flags.Administrator],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async (client, message, args) => {
        const isOwn = await client.functions.isOwn(client, message.author.id);
        if (!isOwn) {
            return message.reply({
                content: "Vous n'avez pas la permission d'utiliser cette commande",
            });
        }
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || await message.guild.roles.fetch(args[0]).catch(()=> {});
        if (!role) {
            return message.reply({
                content: "Veuillez preciser le role",
            });
        } else {
            const data = await roleLimit.findOrCreate({where: { guildId: message.guildId},  defaults: { limit: 0}});
            const limitOptions = Array.from({ length: 20 }, (_, i) => ({
                label: `${i + 1}`,
                value: `${i + 1}`,
            }));

            const menu = new StringSelectMenuBuilder()
                .setCustomId("limit" + message.id)
                .setPlaceholder("Choisissez une limite")
                .addOptions([{
                    label: '1',
                    value: '1',
                }, {
                    label: '2',
                    value: '2',
                }, {
                    label: '3',
                    value: '3',
                }, {
                    label: '4',
                    value: '4',
                }, {
                    label: '5',
                    value: '5',
                }, {
                    label: '6',
                    value: '6',
                }, {
                    label: '7',
                    value: '7',
                }, {
                    label: '8',
                    value: '8',
                }, {
                    label: '9',
                    value: '9',
                }, {
                    label: '10',
                    value: '10',
                }]);

                const menu2 = new StringSelectMenuBuilder()
                .setCustomId("limit2" + message.id)
                .setPlaceholder("Choisissez une limite")
                .addOptions([{
                    label: '11',
                    value: '11',
                }, {
                    label: '12',
                    value: '12',
                }, {
                    label: '13',
                    value: '13',
                }, {
                    label: '14',
                    value: '14',
                }, {
                    label: '15',
                    value: '15',
                }, {
                    label: '16',
                    value: '16',
                }, {
                    label: '17',
                    value: '17',
                }, {
                    label: '18',
                    value: '18',
                }, {
                    label: '19',
                    value: '9',
                }, {
                    label: '20',
                    value: '20',
                }]);

            const menu3 = new StringSelectMenuBuilder()
                .setCustomId("limit3" + message.id)
                .setPlaceholder("Choisissez une limite")
                .addOptions([{
                    label: '21',
                    value: '21',
                }, {
                    label: '22',
                    value: '22',
                }, {
                    label: '23',
                    value: '23',
                }, {
                    label: '24',
                    value: '24',
                }, {
                    label: '25',
                    value: '25',
                }]);

            const reset =  new ButtonBuilder()
                .setCustomId("reset" + message.id)
                .setLabel("Reinitialiser")
                .setStyle(4)


            const menu1row = new ActionRowBuilder()
                .addComponents(menu);

            const menu2row = new ActionRowBuilder()
                .addComponents(menu2);

            const menu3row = new ActionRowBuilder()
                .addComponents(menu3);

            const row2 = new ActionRowBuilder()
                .addComponents(reset);

            await message.reply({ embeds: [{
                title: `Rolelimit de ${role.name}`,
                description: `Veuillez selectionner une limite`,
                color: client.color,
                footer: { text: client.footer.text, icon_url: client.footer.iconURL },
                timestamp: new Date()
                }], components: [menu1row, menu2row, menu3row, row2] });

            const collector = message.channel.createMessageComponentCollector({
                time: client.ms("5m")
            });

            collector.on("collect", async(i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({
                        content: "Vous ne pouvez pas utiliser cette interaction",
                        ephemeral: true
                    });
                };
                await i.deferUpdate().catch(() => false);
                if (i.customId === "reset" + message.id) {
                    const deletedCount = await roleLimit.destoy({where: {guildId: message.guildId, roleId: role.id}});
                    if (deletedCount === 0) {
                        return message.reply({ content: "Ce role n'est pas limité."}).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
                    };
                    message.reply({
                        embeds: [{
                            description: `La limite de ${role} est supprimée !`,
                            color: client.color,
                            footer: { text: client.footer.text, icon_url: client.footer.iconURL },
                            timestamp: new Date(),
                            thumbnail: { url: client.user.displayAvatarURL({ dynamic: true }) },
                            author: { name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) }
                        }]
                    }).then(m => {setTimeout(() => { m.delete()}, client.ms("5s"))});
                } else if (i.customId === "limit" + message.id) {
                    data.limit = i.values[0];
                    await roleLimit.upsert({
                        guildId: message.guildId,
                        roleId: role.id,
                        limit: data.limit,
                        originalName: role.name
                    });
                    const memberCount = message.guild.members.cache.filter(member => member.roles.cache.has(role.id)).size;
                    const newName = `${role.name} [${memberCount}/${data.limit}]`;
                    await role.edit({ name: newName });
                    await message.reply({
                        embeds: [
                            {
                                title: "RoleLimit",
                                color: client.color,
                                description : `Le rolelimit de ${role} a bien ete mis a ${i.values[0]}`,
                                footer: { text: client.footer.text, icon_url: client.footer.iconURL },
                                timestamp: new Date(),
                                thumbnail: { url: client.user.displayAvatarURL({ dynamic: true }) },
                                author: { name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) }
                            }
                        ]
                    }).then(m => setTimeout(() => {m.delete()}, client.ms("5s")))
                }
            })

        }
    }
}