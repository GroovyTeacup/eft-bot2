 
const { Listener } = require('discord-akairo');

class CommandBlockedListener extends Listener {
    constructor() {
        super('commandCooldowns', {
            emitter: 'commandHandler',
            event: 'cooldown'
        });
    }

    exec(message, command, remaining) {
        if (command.id === "addrep" )
        {
            return message.reply("You cannot add rep again that fast!")
        }
    }
}

module.exports = CommandBlockedListener;
