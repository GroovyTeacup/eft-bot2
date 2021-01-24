const { Listener } = require('discord-akairo');
const EFTMessage = require('../eftMessage');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const embedHelper = require("../embedHelper")

class BannedWordsListener extends Listener {
    constructor() {
        super('bannedWordsMessage', {
            emitter: 'client',
            event: 'message'
        });
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof BannedWordsListener
     */
    async exec(message) {
        let config = this.client.config
        let configServer = this.client.configServer
        let tradeChannels = configServer.TradeChannels || []
        let badWords = config.BlacklistedTradeWords

        if (tradeChannels.includes(message.channel.id) && badWords != null)
        {
            let member = message.member
            let content = message.content.trim().toLowerCase()

            // Don't delete messages made by administrators
            if (member.hasPermission("ADMINISTRATOR")) return
            
            for (const word of badWords)
            {
                if (content.includes(word.toLowerCase()))
                {
                    if (content.length > 1850)
                    {
                        content = content.substr(0, 1850) + "\n..."
                    }

                    let embed = embedHelper.makeSimpleEmbed(this.client, `${member} tried to use a blacklisted word \`${word}\` in the trade channel ${message.channel}.`, "Blacklisted Trade Word", 0xffa500)
                    embed.addField("Message", `\`\`\`\n${content}\n\`\`\``, true)

                    console.log(`${member.id} used a blacklisted word (${word}) in the trade channel ${message.channel.name}. Deleted and logged.`)
                    await message.client.logBotAction(embed)
                    

                    if (message.deletable && !message.deleted)
                    {
                        await message.delete()
                    }
                }
            }
            
            return
        }
    }
}

module.exports = BannedWordsListener;
