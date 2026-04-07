const { model, Schema } = require('mongoose');

let boosterschema = new Schema ({
  Guild : String,
  Channel1 : String,
  Channel2 : String,

});

module.exports = model('boosterschema', boosterschema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
