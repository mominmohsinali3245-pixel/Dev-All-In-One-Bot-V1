const { model, Schema} = require("mongoose");
 
let reminderSchema = new Schema({
    User: String,
    Time: String,
    Remind: String,
    ID: String
})
 
module.exports = model("rSch", reminderSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
