 
const { Listener } = require('discord-akairo');

class CommandBlockedListener extends Listener {
    constructor() {
        super('commandCooldowns', {
            emitter: 'commandHandler',
            event: 'cooldown'
        });
    }

    async exec(message, command, remaining) {
        return await message.reply(`Do not spam commands! Try again in ${Math.round(remaining / 1000)} seconds.`)
    }
}

module.exports = CommandBlockedListener;
