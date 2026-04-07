const {model, Schema} = require("mongoose");
 
let warningSchema = new Schema({
    GuildID: String,
    UserID: String,
    UserTag: String,
    Content: Array
});
 
module.exports = model("warnTutorial", warningSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
