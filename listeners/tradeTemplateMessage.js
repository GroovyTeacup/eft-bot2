const { Listener } = require('discord-akairo');
const EFTMessage = require('../eftMessage');
const ContentParser = require('discord-akairo/src/struct/commands/ContentParser');
const embedHelper = require("../embedHelper")
const fs = require("fs")
const path = require("path")

const OK = {
    IGN: 1,
    ITEMS: 2,
    PRICE: 4,
}

class TradeTemplateListener extends Listener {
    constructor() {
        super('tradeTemplate', {
            emitter: 'client',
            event: 'message',
        });

        console.log(path.join(__dirname, "..", "tradeTemplate.txt"))
        this.templateMessage = fs.readFileSync(path.join(__dirname, "..", "tradeTemplate.txt")).toString()
    }

    /**
     *
     *
     * @param {EFTMessage} message
     * @returns
     * @memberof TradeTemplateListener
     */
    async exec(message) {
        let config = this.client.config
        let configServer = this.client.configServer
        let tradeChannels = configServer.TradeChannels || []

        if (tradeChannels.includes(message.channel.id))
        {
            let member = message.member
            let content = message.content.trim().toLowerCase()

            // Don't delete messages made by administrators (or by the bot)
            if (member.hasPermission("ADMINISTRATOR") || member.id === this.client.user.id) return
            
            let okFlags = 0
            let lines = content.split(/\r?\n/)

            for (const line of lines)
            {
                if ((okFlags & OK.IGN) != OK.IGN && line.startsWith("ign"))
                {
                    okFlags |= OK.IGN
                }
                else if ((okFlags & OK.ITEMS) != OK.ITEMS && line.startsWith("items"))
                {
                    okFlags |= OK.ITEMS
                }
                else if ((okFlags & OK.PRICE) != OK.PRICE && line.startsWith("price"))
                {
                    okFlags |= OK.PRICE
                }
            }

            // Stop if not all fields have been found
            if (okFlags == 7)
            {
                return
            }

            if (message.deletable && !message.deleted)
            {
                await message.delete()
            }

            let msg = await message.reply(this.templateMessage)
                        
            if (msg.deletable && !msg.deleted)
            {
                await msg.delete({timeout: 5000})
            }
        }
    }
}

module.exports = TradeTemplateListener;
