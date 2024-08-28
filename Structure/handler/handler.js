const { REST, Routes, Client, ApplicationCommandType, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require("../Config/index")
class EventHandler {
    clarity;
    constructor(client) {
        this.clarity = client;
        this.getFiles("events");
    }
    getFiles(path) {
        fs.readdir(`${path}`, (err, files) => {
            if (err) throw err;
            files.forEach(file => {

                if (file.endsWith('.disabled')) return;
                if (file.endsWith('.js')) {
                    console.log( `[EVENTS] Bind: ${file.split('.js')[0]}`)
                    return this.registerFile(`${path}/${file}`, this.clarity);
                }
                if (!file.includes("."))
                    this.getFiles(`${path}/${file}`);
            })
        })
    }

    registerFile(file) {
        const event = require(`../../${file}`);
        if (event.once) {
            this.clarity.once(event.name, (...args) => event.run(this.clarity,...args));
        } else {
            this.clarity.on(event.name, (...args) => event.run(this.clarity,...args));
        }
        console.log(`[EVENTS] Loaded: ${file.split('/').pop().slice(0, -3)}`)
        delete require.cache[require.resolve(`../../${file}`)];
    }

}

class LangHandler {
    clarity;
    constructor(client) {
        this.clarity = client;
        this.getFiles("lang");
    }
    getFiles(path) {
        fs.readdir(`${path}`, (err, files) => {
            if (err) throw err;
            files.forEach(file => {
                if (file.endsWith('.disabled')) return;
                if (file.endsWith('.js')) {
                    console.log( `[LANG] Bind: ${file.split('.js')[0]}`)
                    return this.registerFile(`${path}/${file}`, this.clarity);
                }
                if (!file.includes("."))
                    this.getFiles(`${path}/${file}`);
            })
        })
    }

    get(Lang) {
        return this.clarity.langList.get(Lang);
    }
    registerFile(file) {
        const pull = require(`../../${file}`);
        if (pull.name)
            this.clarity.langList.set(file.split("/").pop().slice(0, -3), pull.dictionary);
        console.log(`[LANG] Loaded: ${file.split('/').pop().slice(0, -3)}`)
        delete require.cache[require.resolve(`../../${file}`)];
    }

}

class CommandHandler {
    clarity;
    constructor(client) {
        this.clarity = client;
        this.getFiles("commands");
    }
    getFiles(path) {
        fs.readdir(`${path}`, (err, files) => {
            if (err) throw err;
            files.forEach(file => {
                if (file.endsWith('.disabled')) return;
                if (file.endsWith('.js')) {
                    console.log( `[COMMANDS] Bind: ${file.split('.js')[0]}`)
                    return this.registerFile(`${path}/${file}`, this.clarity)
                }
                if (!file.includes("."))
                    this.getFiles(`${path}/${file}`);
            })
        })
    }

    registerFile(file) {
        const pull = require(`../../${file}`);
        if (pull.name)
            if (pull.aliases && Array.isArray(pull.aliases))
                pull.aliases.forEach((alias) =>
                    this.clarity.aliases.set(alias.toLowerCase(), pull)
                );
        this.clarity.commands.set(pull.name.toLowerCase(), pull);
        delete require.cache[require.resolve(`../../${file}`)];
    }

}

class SlashCommandHandler {
    constructor(client, rest) {
        this.client = client;
        this.rest = rest;
        this.commands = new Collection(); // Utilisez 'commands' pour stocker les commandes
        this.loadCommands('slashCommands');
    }

    loadCommands(dir) {
        const fullPath = path.join(__dirname, '../../', dir);

        fs.readdir(fullPath, (err, files) => {
            if (err) {
                console.error(`Failed to read directory ${fullPath}:`, err);
                return;
            }

            files.forEach(file => {
                const filePath = path.join(fullPath, file);
                if (fs.statSync(filePath).isDirectory()) {
                    this.loadCommands(path.join(dir, file));
                } else if (file.endsWith('.js')) {
                    this.registerCommand(filePath);
                }
            });
        });
    }

    async registerCommand(filePath) {
        try {
            const command = require(filePath);

            if ([ApplicationCommandType.ChatInput, ApplicationCommandType.User, ApplicationCommandType.Message].includes(command.type)) {
                const commandData = {
                    name: command.name,
                    description: command.description,
                    type: command.type,
                    options: command.options || []
                };

                // Stocke la commande dans la collection
                this.commands.set(command.name, commandData);

                // Ajoute la commande à la collection du client
                this.client.slashCommands.set(command.name, command);

                console.log(`[SLASH COMMANDS] Loaded: ${path.basename(filePath, '.js')}`);
            } else {
                console.warn(`[SLASH COMMANDS] Skipped invalid file: ${path.basename(filePath, '.js')}`);
            }
        } catch (error) {
            console.error(`Failed to register command from file ${filePath}:`, error);
        }
    }

    async deployCommands() {
        try {
            console.log('Started refreshing application (/) commands.');

            // Convertir la Collection en tableau pour le déploiement
            const commandsArray = Array.from(this.commands.values());

            await this.rest.put(Routes.applicationCommands(config.bot.botId), {
                body: commandsArray,
            });

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('Failed to deploy commands:', error);
        }
    }
}

class AntiCrashHandler {
    clarity;
    constructor(client) {
        this.clarity = client;
        this.setup();
        this.setupListeners();
    }
    setup() {
        this.clarity.on("error", (error) => {
            console.error(`[ERROR] ${error.message}\n${error.stack}`);
            this.clarity.user?.send(`An error occurred: ${error.message}`);
        });
        this.clarity.on("warn", (warning) => {
            console.warn(`[WARNING] ${warning}`);
        });
        this.clarity.on("debug", (debug) => {
            console.log(`[DEBUG] ${debug}`);
        });
        this.clarity.on("shardError", (shardId, error) => {
            console.error(`[SHARD ${shardId}] Error: ${error.message}\n${error.stack}`);
        });
        this.clarity.on("shardReady", (shardId) => {
                console.log(`[SHARD ${shardId}] Ready`);
            }
        )
    }
    setupListeners() {
        this.clarity.on("messageCreate", (message) => {
            if (message.author.bot) return;
            if (message.channel.type === 1) return;
        })
    }
}

module.exports = {
    EventHandler,
    LangHandler,
    CommandHandler,
    SlashCommandHandler,
    AntiCrashHandler
}