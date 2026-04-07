const { Schema, model } = require("mongoose");
const guessSchema = new Schema({
    guildId: { type: String, required: true},
    channelId: { type: String, required: true},
    number: { type: Number, required: true}
});
 
module.exports = model("guess", guessSchema, "guessInfo")

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
