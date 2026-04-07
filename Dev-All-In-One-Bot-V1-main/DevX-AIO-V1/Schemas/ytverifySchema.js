const { model, Schema } = require('mongoose');

const ytverifySchema = new Schema({
    guildId: String,
    channelId: String, // Channel where users submit screenshots
    roleId: String, // Role to give to verified subscribers
    channelName: String, // YouTube channel name to verify
    enabled: { type: Boolean, default: true }
});

module.exports = model('ytverifySchema', ytverifySchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
