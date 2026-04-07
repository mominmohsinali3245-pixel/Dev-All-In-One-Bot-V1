const { model, Schema } = require('mongoose');
 
let autoroleschema = new Schema ({
    Guild: String,
    Role: String
})
 
module.exports = model('autoroleschema', autoroleschema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
