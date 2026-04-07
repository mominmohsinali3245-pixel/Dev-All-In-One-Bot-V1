const { model, Schema } = require('mongoose');

const schema = new Schema({
    guildId: String,
    autoresponses: [
        {
            trigger: String,
            response: String
        }
    ]
})

module.exports = model("name", schema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
