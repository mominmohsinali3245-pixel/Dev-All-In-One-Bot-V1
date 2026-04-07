const { Schema, model } = require("mongoose");

const codeSchema = new Schema({
  code: {
    type: String,
    required: true,
  },
  length: {
    type: String,
    required: true,
  },
  redeemedBy: {
    id: {
      type: String,
      default: null,
    },
    username: {
      type: String,
      default: null,
    },
  },
  redeemedOn: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 },
    default: null,
  },
});

const Code = model("Code", codeSchema);

module.exports = { Code };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
