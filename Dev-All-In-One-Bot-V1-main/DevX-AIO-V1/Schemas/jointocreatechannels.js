const { model, Schema } = require ('mongoose');
 
let jointocreatechannels = new Schema({
    Guild: String,
    User: String,
    Channel: String
})
 
module.exports = model('jointocreatechannels', jointocreatechannels);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
