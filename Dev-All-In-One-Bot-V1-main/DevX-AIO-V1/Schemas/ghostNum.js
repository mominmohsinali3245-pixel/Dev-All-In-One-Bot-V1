const { model, Schema } = require("mongoose");
 
let numSchema = new Schema({
    Guild: String,
    User: String,
    Number: Number
});
 
module.exports = model("ghostNum", numSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
