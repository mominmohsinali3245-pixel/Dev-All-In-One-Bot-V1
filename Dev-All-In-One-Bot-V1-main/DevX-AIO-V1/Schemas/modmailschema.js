const { model, Schema } = require("mongoose");
 
let modmail = new Schema({
    Guild: String,
    Category: String
});
 
module.exports = model("modmail", modmail);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
