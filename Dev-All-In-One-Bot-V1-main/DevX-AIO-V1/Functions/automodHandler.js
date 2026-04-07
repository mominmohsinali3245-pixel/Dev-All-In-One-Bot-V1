const automodSchema = require("../Schemas/automodSchema");
const warningSchema = require("../Schemas/warnSchema");

const messageCache = new Map();

async function checkAutomod(message, client) {
  if (message.author.bot || !message.guild || message.system || message.webhookId) {
    return false;
  }

  const automodData = await automodSchema.findOne({ Guild: message.guild.id });
  if (!automodData) return false;

  if (automodData.IgnoredChannels.includes(message.channel.id)) {
    return false;
  }

  const memberRoles = message.member.roles.cache.map(role => role.id);
  if (automodData.IgnoredRoles.some(roleId => memberRoles.includes(roleId))) {
    return false;
  }

  if (message.member.permissions.has("Administrator")) {
    return false;
  }

  let violation = null;

  if (automodData.AntiSpam.enabled) {
    violation = await checkAntiSpam(message, automodData.AntiSpam);
    if (violation) {
      await handleViolation(message, "spam", automodData.AntiSpam.action, violation.reason);
      return true;
    }
  }

  if (automodData.AntiLink.enabled) {
    violation = checkAntiLink(message, automodData.AntiLink);
    if (violation) {
      await handleViolation(message, "link", automodData.AntiLink.action, violation.reason);
      return true;
    }
  }

  if (automodData.AntiCaps.enabled) {
    violation = checkAntiCaps(message, automodData.AntiCaps);
    if (violation) {
      await handleViolation(message, "caps", automodData.AntiCaps.action, violation.reason);
      return true;
    }
  }

  if (automodData.AntiInvite.enabled) {
    violation = checkAntiInvite(message);
    if (violation) {
      await handleViolation(message, "invite", automodData.AntiInvite.action, violation.reason);
      return true;
    }
  }

  if (automodData.AntiMentionSpam.enabled) {
    violation = checkAntiMentionSpam(message, automodData.AntiMentionSpam);
    if (violation) {
      await handleViolation(message, "mention spam", automodData.AntiMentionSpam.action, violation.reason);
      return true;
    }
  }

  if (automodData.BannedWords.enabled && automodData.BannedWords.words.length > 0) {
    violation = checkBannedWords(message, automodData.BannedWords);
    if (violation) {
      await handleViolation(message, "banned word", automodData.BannedWords.action, violation.reason);
      return true;
    }
  }

  return false;
}

async function checkAntiSpam(message, config) {
  const userId = message.author.id;
  const guildId = message.guild.id;
  const key = `${guildId}-${userId}`;

  if (!messageCache.has(key)) {
    messageCache.set(key, []);
  }

  const userMessages = messageCache.get(key);
  const now = Date.now();
  
  userMessages.push(now);
  
  const timeWindow = config.timeWindow * 1000;
  const recentMessages = userMessages.filter(timestamp => now - timestamp < timeWindow);
  messageCache.set(key, recentMessages);

  if (recentMessages.length > config.maxMessages) {
    messageCache.delete(key);
    return { 
      reason: `Sent ${recentMessages.length} messages in ${config.timeWindow} seconds (max: ${config.maxMessages})`
    };
  }

  return null;
}

function checkAntiLink(message, config) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = message.content.match(urlRegex);

  if (!urls) return null;

  for (const url of urls) {
    let isWhitelisted = false;
    
    for (const domain of config.whitelistedDomains) {
      if (url.includes(domain)) {
        isWhitelisted = true;
        break;
      }
    }

    if (!isWhitelisted) {
      return { reason: `Posted unauthorized link: ${url}` };
    }
  }

  return null;
}

function checkAntiCaps(message, config) {
  const content = message.content;
  if (content.length < 5) return null;

  const uppercaseChars = content.replace(/[^A-Z]/g, '').length;
  const totalChars = content.replace(/[^A-Za-z]/g, '').length;

  if (totalChars === 0) return null;

  const capsPercentage = (uppercaseChars / totalChars) * 100;

  if (capsPercentage > config.percentage) {
    return { 
      reason: `Message contains ${Math.round(capsPercentage)}% caps (max: ${config.percentage}%)`
    };
  }

  return null;
}

function checkAntiInvite(message) {
  const inviteRegex = /(discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\/)[^\s]+/gi;
  const invites = message.content.match(inviteRegex);

  if (invites) {
    return { reason: `Posted Discord invite link: ${invites[0]}` };
  }

  return null;
}

function checkAntiMentionSpam(message, config) {
  const mentions = message.mentions.users.size + message.mentions.roles.size;

  if (mentions > config.maxMentions) {
    return { 
      reason: `Mentioned ${mentions} users/roles (max: ${config.maxMentions})`
    };
  }

  return null;
}

function checkBannedWords(message, config) {
  const content = message.content.toLowerCase();

  for (const word of config.words) {
    if (content.includes(word.toLowerCase())) {
      return { reason: `Used banned word: ${word}` };
    }
  }

  return null;
}

async function handleViolation(message, violationType, action, reason) {
  try {
    await message.delete().catch(() => {});

    const logMessage = `🚨 Automod violation by ${message.author.tag} in ${message.channel}: ${violationType} - ${reason}`;
    console.log(logMessage);

    switch (action) {
      case "delete":
        await message.channel.send({
          content: `${message.author}, your message was deleted for: ${reason}`,
        }).then(msg => {
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }).catch(() => {});
        break;

      case "timeout":
        if (message.member.moderatable) {
          await message.member.timeout(5 * 60 * 1000, `Automod: ${violationType} - ${reason}`).catch(() => {});
          await message.channel.send({
            content: `${message.author} has been timed out for 5 minutes for: ${reason}`,
          }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
          }).catch(() => {});
        }
        break;

      case "kick":
        if (message.member.kickable) {
          await message.member.kick(`Automod: ${violationType} - ${reason}`).catch(() => {});
          await message.channel.send({
            content: `${message.author.tag} has been kicked for: ${reason}`,
          }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 10000);
          }).catch(() => {});
        }
        break;

      case "warn":
        try {
          let data = await warningSchema.findOne({
            GuildID: message.guild.id,
            UserID: message.author.id,
            UserTag: message.author.tag,
          });

          if (!data) {
            data = new warningSchema({
              GuildID: message.guild.id,
              UserID: message.author.id,
              UserTag: message.author.tag,
              Content: [
                {
                  ExecuterId: "AUTOMOD",
                  ExecuterTag: "Automod System",
                  Reason: `${violationType}: ${reason}`,
                },
              ],
            });
          } else {
            data.Content.push({
              ExecuterId: "AUTOMOD",
              ExecuterTag: "Automod System",
              Reason: `${violationType}: ${reason}`,
            });
          }
          await data.save();

          await message.channel.send({
            content: `${message.author} has been warned for: ${reason}`,
          }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
          }).catch(() => {});
        } catch (err) {
          console.error("Error saving automod warning:", err);
        }
        break;

      case "ban":
        if (message.member.bannable) {
          await message.member.ban({ reason: `Automod: ${violationType} - ${reason}` }).catch(() => {});
          await message.channel.send({
            content: `${message.author.tag} has been banned for: ${reason}`,
          }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 10000);
          }).catch(() => {});
        }
        break;
    }
  } catch (error) {
    console.error("Automod error:", error);
  }
}

module.exports = { checkAutomod };

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
