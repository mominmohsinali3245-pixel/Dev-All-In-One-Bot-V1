const { Schema, model } = require("mongoose");

const inviteSchema = new Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    invites: [{
        userId: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        invites: {
            type: Number,
            default: 0
        },
        regularInvites: {
            type: Number,
            default: 0
        },
        bonusInvites: {
            type: Number,
            default: 0
        },
        leaves: {
            type: Number,
            default: 0
        },
        fakeInvites: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true
});

module.exports = model("Invite", inviteSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
