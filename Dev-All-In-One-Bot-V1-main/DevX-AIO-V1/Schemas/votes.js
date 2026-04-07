const {model, Schema} = require('mongoose');
 
let vote = new Schema({
    Guild: String,
    Msg: String,
    UpMembers: Array,
    DownMembers: Array,
    Upvote: Number,
    Downvote: Number,
    Owner: String
});
 
module.exports = model("vote", vote);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
