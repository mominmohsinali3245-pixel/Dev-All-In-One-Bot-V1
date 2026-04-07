const { model, Schema } = require("mongoose");
 
let staffrole = new Schema({
    Role: String,
    Guild: String
})
 
module.exports = model("staffrole", staffrole);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
