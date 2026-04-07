const { model, Schema } = require ('mongoose');
 
let jointocreate = new Schema({
    Guild: String,
    Channel: String,
    Category: String,
    VoiceLimit: Number
})
 
module.exports = model('jointocreate', jointocreate);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
