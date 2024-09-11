const {
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    UserSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    RoleSelectMenuBuilder
} = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const Logs = require("../../Structure/Models/logs/Logs");
const Raidmode = require("../../Structure/Models/Protect/raidmode")
module.exports = {
    name: "raidmode",
    description: "Manage raidmode module",
    aliases: ["rm", "raidmode"],
    category: "Antiraid",
    cooldown: 5000,
    userPermissions: [PermissionsBitField.Flags.Administrator],
    botPermissions: [],
    ownerOnly: false,
    toggleOff: false,
    topGgOnly: false,
    bumpOnly: false,
    guildOwnerOnly: false,
    run: async (client, message, args) => {
        let msg = await message.channel.send({ content: 'Chargement du module en cours . . .' });
        await embed(client, message, msg);
    }
}

async function embed(client, message, msg) {
    let [raidmodeData, raidmodeDataCreate] = await Raidmode.findOrCreate({
        where: { guildId: message.guildId },
        defaults: { status: false }
    });
    if (raidmodeDataCreate) console.log(`[DB] Raidmode Table Init : ${message.guild.name} (${message.guildId})`);
    let currentPage = 0;

    const generateComponents = (page) => {
        let buttons = [
            new ButtonBuilder()
                .setCustomId("activate_antilink" + message.id)
                .setEmoji(raidmodeData.status ? "1224360246940663931" : "1224360257422233671")
                .setStyle(raidmodeData.status ? 3 : 4),
        ];



        const maxPage = Math.ceil(buttons.length / 4) - 1;

        const start = page * 4;
        const currentButtons = buttons.slice(start, start + 4);

        if (page > 0) {
            currentButtons.push(
                new ButtonBuilder()
                    .setCustomId("previous_page" + message.id)
                    .setEmoji("1278356220083834962")
                    .setStyle(2)
            );
        }
        if (page < maxPage) {
            currentButtons.push(
                new ButtonBuilder()
                    .setCustomId("next_page" + message.id)
                    .setEmoji("1278356218842451999")
                    .setStyle(2)
            );
        }

        return new ActionRowBuilder().addComponents(currentButtons);
    };

    const upEmb = async () => {
        const embed = new EmbedBuilder()
            .setTitle(`${message.guild.name} : Raidmode`)
            .setDescription(`\`\`\`État: ${raidmodeData.status ? "✅" : "❌"}\`\`\``)
            .setFooter({
                text: client.footer.text,
                iconURL: client.footer.iconURL
            })
            .setTimestamp()
            .setColor(client.color);

        let components = [];

        components.push(generateComponents(currentPage));


        await msg.edit({
            content: null,
            embeds: [embed],
            components: components
        });
    };

    await upEmb();

    const collector = await msg.createMessageComponentCollector({
        time: client.ms("5m")
    });

    collector.on("collect", async(i) => {
        if (i.user.id !== message.author.id) {
            return i.reply({
                content: "Vous ne pouvez pas utiliser cette interaction",
                ephemeral: true
            });
        }
        await i.deferUpdate().catch(() => false);
        if (i.customId === "activate_antilink" + message.id) {
            raidmodeData.status = !raidmodeData.status;
            await Raidmode.update({status: raidmodeData.status}, {where: {guildId: message.guildId}});
            await upEmb();
            await lockInvite(client, message)
        }
    })
}

async function lockInvite(client, message) {
    if (message.guild.features.includes("INVITES_DISABLED")) {
        await message.guild.disableInvites(false);
        return message.reply({
            embeds: [{
                title: 'Raid-Mode',
                color: client.color,
                footer: client.footer,
                description: `Vous ne bloquez plus les invitations du serveur. `,
                timestamp: new Date()
            }]
        }).then(msg => setTimeout(() => msg.delete(), 5000))
    } else {
        await message.guild.disableInvites(true);
        return message.reply({
            embeds: [{
                title: 'Raid-Mode',
                color: client.color,
                footer: client.footer,
                description: `Vous avez bloquez les invitations du serveur.`,
                timestamp: new Date()
            }]
        }).then(msg => setTimeout(() => msg.delete(), 5000))
    }
}