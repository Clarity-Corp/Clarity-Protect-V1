const { google } = require('googleapis');
const API_KEY = "AIzaSyCrqBjlfdgKWeb5GGb2qbKisdhBLVb7wLc";
const handleViolation = require("../../Structure/Util/handleViolation");
const Logs = require("../../Structure/Db/Models/logs/Logs");
const Owner = require("../../Structure/Db/Models/Buyer/Owner")
const WhiteList = require('../../Structure/Db/Models/Whitelist/index')
const Antitoxicity = require('../../Structure/Db/Models/Protect/antitoxicity');
const {PermissionsBitField} = require("discord.js");
const userWarnings = new Map();
const usersWithToxicity = new Set();
module.exports = {
    name: "messageCreate",
    once: false,
    run: async(client, message) => {
        if (!message.guild || message.author.id === client.user.id) return;
        let data = await Antitoxicity.findOne({
            where: { guildId: message.guild.id }
        });
        if (!data || !data.status) return;
        let member = message.guild.members.cache.get(message.author.id) || await message.guild.members.fetch(message.author.id).catch(() => null);
        if (!member) return;
        if (data.bypass_status) {
            if (data.wl_link) {
                let wl_links = data.wl_link ? data.wl_link.split(",") : [];
                for (const wlLink of wl_links) {
                    if(message.content.includes(wlLink)) return;
                }
            }
            if (data.wl_users) {
                let wl_users = data.wl_users ? data.wl_users.split(",") : [];
                if (wl_users.includes(message.author.id)) return;
            }
            if (data.wl_role) {
                let wl_roles = data.wl_role ? data.wl_role.split(",") : [];
                let hasRoleInWhitelist = wl_roles.length > 0 && message.member.roles.cache.some(role => wl_roles.includes(role.id));
                if (hasRoleInWhitelist) return;
            }
            if (data.use_botWl) {
                let isWl = await WhiteList.findOne({
                    where: { guildId: message.guild.id, userId: message.author.id }
                });
                if (isWl) return;
            }
            if (data.use_botOwner) {
                let isOwn = client.functions.isOwn(client, message.author.id)
                if (isOwn) return;
            }
        }
        if (data.permission_allowed) {
            let hasPerm = message.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
                message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
            if (hasPerm) return;
        }

    }
}


async function handleViolationAndWarnings(client, message, member, data, userWarnings, usersWithToxicity) {
    message.delete().catch(() => false);
    usersWithToxicity.add(message.author.id);

    let warnings = userWarnings.get(message.author.id) || 0;
    warnings++;
    userWarnings.set(message.author.id, warnings);

    if (data.rep && warnings >= data.rep_limit) {
        userWarnings.delete(message.author.id);
        await handleViolation(member, data.sanction, data.sanction_admin, "Clarity Anti-link system");
        usersWithToxicity.delete(message.author.id);
        await client.functions.tempMessage(message, `${message.author}, vous avez été sanctionné pour avoir envoyé un message contenant un taux de toxicité élevé. Avertissements : ${warnings}/${data.rep_limit}`, client);
    } else if (data.rep) {
        await client.functions.tempMessage(message, `${message.author}, vous avez reçu un avertissement pour avoir envoyé un message contenant un taux de toxicité élevé. Avertissements : ${warnings}/${data.rep_limit}`, client);
    } else {
        await handleViolation(member, data.sanction, data.sanction_admin, "Clarity Anti-toxicity system");
    }
}