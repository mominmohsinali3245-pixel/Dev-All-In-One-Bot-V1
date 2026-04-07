const { model, Schema } = require('mongoose');

const ytverifiedUsersSchema = new Schema({
    guildId: String,
    userId: String,
    username: String,
    verifiedAt: { type: Date, default: Date.now }
});

module.exports = model('ytverifiedUsersSchema', ytverifiedUsersSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
