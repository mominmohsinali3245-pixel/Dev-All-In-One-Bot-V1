const { Schema, model } = require("mongoose");
const createSchema = new Schema({
  GuildID: String,
  ChannelID: String,
  TranscriptID: String,
  OpenCategoryID: String,
  ClosedCategoryID: String,
  ArchiveCategoryID: String,
  SupportRoleID: String,
});

module.exports = model("TicketSettings", createSchema, "TicketSettings");

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
