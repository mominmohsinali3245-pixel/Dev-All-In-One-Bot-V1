const { model, Schema } = require('mongoose');

let marriageSchema = new Schema({
    marriedUser: String,
    marriedTo: String
})

module.exports = model('MarriageSchema', marriageSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
