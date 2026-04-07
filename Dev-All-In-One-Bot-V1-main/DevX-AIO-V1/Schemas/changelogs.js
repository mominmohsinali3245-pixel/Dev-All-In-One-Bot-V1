const { Schema, model } = require("mongoose");
const changelogs = new Schema({
    date: Date,
    config: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        footer: { type: String, default: null },
        color: { type: String, default: null },
        type: { type: String, default: null }
    }
}, { versionKey: false });

module.exports = model("changelogs", changelogs, "changelogs");

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
