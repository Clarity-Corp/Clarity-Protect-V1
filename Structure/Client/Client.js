const { Collection , Client,  REST } = require("discord.js");
const { EventHandler , CommandHandler, SlashCommandHandler, LangHandler, AntiCrashHandler} = require('../handler/handler');
const Database = require("../handler/Database");
const config = require("../Config/index")
const rest = new REST({ version: '10' }).setToken(config.bot.token);
class Clarity extends Client {
    constructor(token, options) {
        super(options);
        this.setMaxListeners(0);
        this.cachedChannels = new Map()
        this.langList = new Collection();
        this.commands = new Collection();
        this.slashCommands = new Collection();
        this.events = new Collection();
        this.aliases = new Collection();
        this.cooldowns = new Collection();
        new EventHandler(this);
        new AntiCrashHandler(this);
        this.slashCommandHandler = new SlashCommandHandler(this, rest)
        new CommandHandler(this)
        this.lang = new LangHandler(this, this.langList);
        this.ms = require('../Util/ms/index')
        this.functions = require("../Util/functions");
        this.connect(token);
        this.config = require("../Config/index");
        this.initDb();
        this.axios = require("axios");
        this.version = "1.0.0"
    }

    async initDb() {
        this.db = new Database(this);
        await this.db.authenticate();
    }

    connect(token) {
        this.login(token).then(() => {
            let x = setInterval(() => {
                if (this.ws.reconnecting || this.ws.destroyed) {
                    this.login(token).catch((err) => {
                        console.error(`[ERROR] Failed to reconnect, retrying in 10 seconds: ${err}`);
                        setTimeout(() => {
                            clearInterval(x);
                        }, 10000);
                    }).catch((err) => {
                        console.error(err);
                        if(err?.code?.toLowerCase()?.includes("token" || "tokens")) return;
                        setTimeout(() => {
                            this.connect(token).catch((err) => {
                                console.error(`[ERROR] Failed to connect, retrying in 10 seconds: ${err}`);
                                setTimeout(() => {
                                    clearInterval(x);
                                }, 10000);
                            })
                        })
                    })
                }
            })
            console.log(`[INFO] Connected to Discord as ${this.user.tag}`);
        })
    }
}

module.exports = Clarity;
