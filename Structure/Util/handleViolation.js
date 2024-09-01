const ms = require("./ms/index")
module.exports = function handleViolation(member, sanction, sanction_admin, reason) {
    if (member.permissions.has('Administrator')) {
        switch (sanction_admin) {
            case "kick":
                member.kick(reason).catch(() => false);
                break;
            case "ban":
                member.ban({ reason }).catch(() => false);
                break;
            case "derank":
                member.roles.set([], reason).catch(() => false);
                break;
            default:
                break;
        }
    }

    switch(sanction) {
        case "mute":
            member.timeout(ms("15m"), reason).catch(() => false);
            break;
        case "kick":
            member.kick(reason).catch(() => false);
            break;
        case "ban":
            member.ban({ reason }).catch(() => false);
            break;
        case "derank":
            member.roles.set([], reason).catch(() => false);
            break;
        default:
            break;
    }
}