const { model, Schema } = require("mongoose");
 
let verify = new Schema({
    Guild: String,
    Channel: String,
    Role: String,
    Message: String,
    Verified: Array
})
 
module.exports = model("verify", verify);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
