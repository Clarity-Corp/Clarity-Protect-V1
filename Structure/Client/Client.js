const { Client, REST } = require("discord.js");
const { Collection } = require("../Util/Collection");
const { EventHandler, CommandHandler, SlashCommandHandler, LangHandler, AntiCrashHandler } = require('../handler/handler');
const Database = require("../handler/Database")
const config = require("../Config/index");
const rest = new REST({ version: '10' }).setToken(config.bot.token);
const Axios = require ('../Util/Axios/index');
class Clarity extends Client {
    constructor(token, options) {
        super(options);
        this.setMaxListeners(0);
        this.cachedChannels = new Map();
        this.langList = new Collection();
        this.commands = new Collection();
        this.slashCommands = new Collection();
        this.events = new Collection();
        this.aliases = new Collection();
        this.cooldowns = new Collection();
        this.ms = require('../Util/ms/index');
        this.functions = require("../Util/functions");
        this.axios = new Axios()
        this.version = "1.0.0";
        this.config = config;
        this.connect(token);
    }

    // Initialisation des handlers
    async initializeHandlers() {
        new EventHandler(this);
        new AntiCrashHandler(this);
        this.slashCommandHandler = new SlashCommandHandler(this, rest);
        new CommandHandler(this);
        this.lang = new LangHandler(this, this.langList);
        await this.initDb();
    }

    async initDb() {
        this.db = new Database(this);
        await this.db.authenticate();
    }
    // Connexion à Discord avec gestion des erreurs et reconnections
    async connect(token) {
        try {
            await this.login(token);
            console.log(`[INFO] Connected to Discord as ${this.user.tag}`);
            await this.initializeHandlers()
            // Gestion des reconnections
            this.handleReconnect(token);
        } catch (err) {
            console.error(`[ERROR] Failed to connect: ${err.message}`);
            this.retryConnection(token);
        }
    }

    // Gestion de la reconnexion automatique
    handleReconnect(token) {
        setInterval(async () => {
            if (this.ws.reconnecting || this.ws.destroyed) {
                try {
                    await this.login(token);
                    console.log('[INFO] Reconnected to Discord');
                } catch (err) {
                    console.error(`[ERROR] Failed to reconnect, retrying in 10 seconds: ${err.message}`);
                    this.retryConnection(token);
                }
            }
        }, 10000); // Vérifier toutes les 10 secondes
    }

    // Méthode de reconnexion avec gestion des erreurs
    async retryConnection(token) {
        try {
            await this.login(token);
        } catch (err) {
            console.error(`[ERROR] Failed to reconnect: ${err.message}`);
            if (err?.code?.toLowerCase()?.includes("token" || "tokens")) {
                return; // Si l'erreur est liée au token, ne pas réessayer
            }
            setTimeout(() => this.retryConnection(token), 10000); // Tentative après 10 secondes
        }
    }

}

module.exports = Clarity;
