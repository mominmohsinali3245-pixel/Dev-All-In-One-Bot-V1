const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    guildId: {
        type: String,
        required: true
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    lastMessage: {
        type: Date,
        default: Date.now
    },
    totalMessages: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Level', levelSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
