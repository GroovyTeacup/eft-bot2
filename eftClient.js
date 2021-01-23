const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
const { Intents } = require('discord.js');
const { Message } = require('discord.js');
const config = require("./config.json")

const VERSION = "2.0.0"

/**
 *
 *
 * @class EFTBot
 * @extends {AkairoClient}
 */
class EFTBot extends AkairoClient {
    constructor(ownerID) {
        super({
            ownerID: ownerID || -1,
            // Options for Akairo go here.
        }, {
            disableMentions: "all",
            messageCacheLifetime: 86400, // every day
            messageSweepInterval: 3600, // every hour
            partials: ["REACTION", "MESSAGE"],
            ws: {
                intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"]
            },
            restRequestTimeout: 15000
            // Options for discord.js goes here.
        });

        console.log(`Initializing EFTBot ${VERSION}`)
        
        this.botVersion = VERSION

        // Create Command Handler instance.
        this.commandHandler = new CommandHandler(this, {
            directory: "./commands/", // Directory the commands are loaded from
            prefix: config.CommandPrefix, // The command prefix
            blockClient: true,
            blockBots: true,
            allowMention: false,
            commandUtil: true,
        })

        this.listenerHandler = new ListenerHandler(this, {
            directory: "./listeners/",
        })

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
        });

        console.log("Loading command files")
        this.commandHandler.loadAll() // Load all commands

        console.log("Loading listener files")
        this.listenerHandler.loadAll()

        console.log("Opening bot database")
        this.verificationHandler.loadData()
    }

    // Since this bot is only really meant to be run for a single guild we can do this
    getGuild()
    {
        return this.util.resolveGuild(config.ServerID, this.guilds.cache)
    }
}

module.exports = EFTBot