const { model, Schema } = require('mongoose');
 
let phoneschema = new Schema ({
    Guild: String,
    Channel: String,
    Setup: String
})
 
module.exports = model('phoneschema', phoneschema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
