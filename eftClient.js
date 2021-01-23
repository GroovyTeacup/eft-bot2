const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
const { Intents } = require('discord.js');
const { Message } = require('discord.js');

const VERSION = "2.0.0"

/**
 *
 *
 * @class EFTClient
 * @extends {AkairoClient}
 */
class EFTClient extends AkairoClient {
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
            prefix: ".", // The command prefix
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

        this.verificationHandler = new VerificationHandler(this)

        this.serverStatsHandler = new ServerStatsHandler(this)
        this.brSyncHandler = new BRSyncHandler(this)

        console.log("Loading command files")
        this.commandHandler.loadAll() // Load all commands

        console.log("Loading listener files")
        this.listenerHandler.loadAll()

        console.log("Opening verification handler database")
        this.verificationHandler.loadData()
    }

    getGuild()
    {
        return this.util.resolveGuild("691845659321565244", this.guilds.cache)
    }
}

// pseudo code for vscode completions in command files
/*class EnlightenedMessage extends Message {
    constructor()
    {
        this.client = new EnlightenedClient()
    }
 }*/

module.exports = EnlightenedClient