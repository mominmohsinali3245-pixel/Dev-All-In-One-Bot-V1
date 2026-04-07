const { model, Schema } = require('mongoose');

let afkSchema = new Schema({
  User: String,
  Guild: String,
  Message: String,
  Nickname: String,
})

module.exports = model('afkS', afkSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
