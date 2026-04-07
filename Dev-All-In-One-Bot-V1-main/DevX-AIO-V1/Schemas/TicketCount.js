const { Schema, model } = require("mongoose");
const createSchema = new Schema({
  GuildID: String,
  TicketCount: String,
});

module.exports = model("TicketCount", createSchema, "TicketCount");

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
