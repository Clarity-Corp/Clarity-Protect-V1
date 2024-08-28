class Command {
    constructor(opt) {
        this.name = opt.name;
        this.description = opt.description;
        this.usage = opt.usage;
        this.aliases = opt.aliases || [];
        this.cooldown = opt.cooldown || 0;
        this.guildOnly = opt.guildOnly || false;
        this.userPermissions = opt.userPermissions || [];
        this.botPermissions = opt.botPermissions || [];
        this.topGgOnly = opt.topGgOnly || false;
        this.bumpOnly = opt.bumpOnly || false;
        this.premiumOnly = opt.premiumOnly || false;
        this.guildOwnerOnly = opt.guildOwnerOnly || false;
        this.buyerOnly = opt.buyerOnly || false;
        this.devOnly = opt.devOnly || false;
        this.nsfwOnly = opt.nsfwOnly || false;
    }
    async run(client, message, args) {

    }
}

module.exports = Command;