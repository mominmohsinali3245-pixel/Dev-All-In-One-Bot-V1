const { model, Schema } = require('mongoose');

let countschema = new Schema ({
    Guild: String,
    Channel: String,
    Count: Number,
    LastUser: String,
})

module.exports = model('countschema', countschema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
