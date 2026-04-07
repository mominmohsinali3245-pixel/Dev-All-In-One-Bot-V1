const { model, Schema } = require('mongoose');
 
let confessschema = new Schema ({
    Guild: String,
    Channel: String,
    Timeout: Number,
    Logs: String
})
 
module.exports = model('confessschema', confessschema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
