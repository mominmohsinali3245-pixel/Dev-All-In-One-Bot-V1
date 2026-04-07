const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
    messageId: String,
    channelId: String,
    guildId: String,
    startAt: Number,
    endAt: Number,
    ended: { type: Boolean, default: false },
    winnerCount: Number,
    prize: String,
    hostedBy: String,
    entries: { type: [String], default: [] },
    winners: { type: [String], default: [] }
}, { id: false });

module.exports = mongoose.model('giveaways_x', giveawaySchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
