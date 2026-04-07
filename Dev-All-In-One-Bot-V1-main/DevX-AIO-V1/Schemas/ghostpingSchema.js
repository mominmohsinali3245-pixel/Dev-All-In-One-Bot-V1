const { model, Schema } = require("mongoose");
 
let ghostSchema = new Schema({
    Guild: String,
});
 
module.exports = model("ghost", ghostSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
