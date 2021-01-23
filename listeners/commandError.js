 
const { Listener, Command } = require('discord-akairo');

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
     * @param {EnlightenedMessage} message
     * @param {Command} command
     * @memberof CommandErrorListener
     */
    exec(error, message, command) {
        console.error(`An error occurred while running command '${command.id}' for message '${message.id}'`, error)
    }
}

module.exports = CommandErrorListener;
