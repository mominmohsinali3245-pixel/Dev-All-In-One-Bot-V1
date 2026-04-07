const { model, Schema } = require("mongoose");

module.exports = model(
  "suggestionSetup",
  new Schema({
    GuildID: String,
    SuggestChannel: String,
    ManagerRole: String,
    embedColor: String,
    AcceptColor: String,
    DeclineColor: String,
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
