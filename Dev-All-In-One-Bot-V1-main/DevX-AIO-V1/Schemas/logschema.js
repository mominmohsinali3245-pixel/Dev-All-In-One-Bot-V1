const { model, Schema } = require("mongoose");
 
let logschema = new Schema({
    Guild: String,
    Channel: String,
});
 
module.exports = model("logs", logschema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
