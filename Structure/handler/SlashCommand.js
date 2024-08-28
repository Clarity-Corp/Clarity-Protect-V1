class SlashCommand {
    constructor(opt) {
        this.name = opt.name;
        this.description = opt.description;
        this.options = opt.options || [];
    }
    async run(client, interaction){

    }
}

module.exports = SlashCommand;