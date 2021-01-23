 
const { Listener, Command } = require('discord-akairo');
const EFTMessage = require('../eftMessage');

class CommandErrorListener extends Listener {
    constructor() {
        super('commandError', {
            emitter: 'commandHandler',
            event: 'error'
        });
    }

    /**
     *
     *
     * @param {Error} error
     * @param {EFTMessage} message
     * @param {Command} command
     * @memberof CommandErrorListener
     */
    exec(error, message, command) {
        console.error(`An error occurred while running command '${command.id}' for message '${message.id}' ran by member ${message.author.id}`, error)
    }
}

module.exports = CommandErrorListener;
