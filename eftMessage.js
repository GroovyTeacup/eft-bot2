const { Message } = require("discord.js")
const EFTClient = require("./eftClient")

/**
 * Dummy class for completions in vscode
 *
 * @class EFTMessage
 * @property {EFTClient} client
 * @extends {Message}
 */
class EFTMessage extends Message {
    constructor() { this.client = new EFTClient() }
}

module.exports = EFTMessage