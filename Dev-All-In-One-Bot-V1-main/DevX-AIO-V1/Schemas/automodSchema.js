const { model, Schema } = require('mongoose');

let automodSchema = new Schema({
    Guild: String,
    AntiSpam: {
        enabled: { type: Boolean, default: false },
        maxMessages: { type: Number, default: 5 },
        timeWindow: { type: Number, default: 5 },
        action: { type: String, default: 'timeout' }
    },
    AntiLink: {
        enabled: { type: Boolean, default: false },
        action: { type: String, default: 'delete' },
        whitelistedDomains: { type: [String], default: [] }
    },
    AntiCaps: {
        enabled: { type: Boolean, default: false },
        percentage: { type: Number, default: 70 },
        action: { type: String, default: 'delete' }
    },
    AntiInvite: {
        enabled: { type: Boolean, default: false },
        action: { type: String, default: 'delete' }
    },
    AntiMentionSpam: {
        enabled: { type: Boolean, default: false },
        maxMentions: { type: Number, default: 5 },
        action: { type: String, default: 'timeout' }
    },
    BannedWords: {
        enabled: { type: Boolean, default: false },
        words: { type: [String], default: [] },
        action: { type: String, default: 'delete' }
    },
    AntiRaid: {
        enabled: { type: Boolean, default: false },
        joinThreshold: { type: Number, default: 5 },
        timeWindow: { type: Number, default: 10 },
        action: { type: String, default: 'kick' }
    },
    IgnoredChannels: { type: [String], default: [] },
    IgnoredRoles: { type: [String], default: [] }
});

module.exports = model('automod', automodSchema);

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
