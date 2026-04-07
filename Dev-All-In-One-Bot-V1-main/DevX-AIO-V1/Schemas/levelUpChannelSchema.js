const mongoose = require('mongoose');

const levelUpChannelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    channelId: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    customMessage: {
        type: String,
        default: "🎉 Congratulations {user}! You've reached level {level}!"
    }
});

module.exports = mongoose.model('LevelUpChannel', levelUpChannelSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
