const { model, Schema } = require("mongoose");
 
let verifyusers = new Schema({
    Guild: String,
    Key: String,
    User: String
})
 
module.exports = model("verifyusers", verifyusers);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
