const { model, Schema } = require("mongoose");

module.exports = model(
  "suggestions",
  new Schema({
    GuildID: String,
    ChannelID: String,
    MessageID: String,
    MemberID: String,
    MemberTag: String,
    Suggestion: String,
    Accepted: Boolean,
    Declined: Boolean,
    Upvotes: [String],
    Downvotes: [String],
  })
);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
