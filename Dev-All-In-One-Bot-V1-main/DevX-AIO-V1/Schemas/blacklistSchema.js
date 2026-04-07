const { model, Schema } = require("mongoose")

module.exports = model("blacklist", new Schema({
    userId: String,
    reason: String
}))

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
