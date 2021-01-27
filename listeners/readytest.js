const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    async exec() {
        console.log("Bot is ready to rumble!");
        await this.client.updateStatus(this.client)
        setInterval(async () => await this.updateStatus(this.client), 1000 * 60 * 30) // Update status every 30 minutes
    }
}

module.exports = ReadyListener;
