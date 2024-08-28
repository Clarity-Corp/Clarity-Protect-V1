const Clarity  = require('./Structure/Client/Client.js');
const config = require('./Structure/Config/index.js');
const client = new Clarity(config.bot.token, {
    intents: 3276799,
    partials: [0, 1, 2, 3, 4]
})