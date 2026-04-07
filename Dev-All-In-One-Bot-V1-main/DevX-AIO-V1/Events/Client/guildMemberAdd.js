const automodSchema = require("../../Schemas/automodSchema");

const joinCache = new Map();

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    try {
      const automodData = await automodSchema.findOne({ Guild: member.guild.id });
      
      if (!automodData || !automodData.AntiRaid.enabled) return;

      const guildId = member.guild.id;
      const now = Date.now();

      if (!joinCache.has(guildId)) {
        joinCache.set(guildId, []);
      }

      const guildJoins = joinCache.get(guildId);
      guildJoins.push({ userId: member.id, timestamp: now });

      const timeWindow = automodData.AntiRaid.timeWindow * 1000;
      const recentJoins = guildJoins.filter(join => now - join.timestamp < timeWindow);
      joinCache.set(guildId, recentJoins);

      if (recentJoins.length >= automodData.AntiRaid.joinThreshold) {
        console.log(`🚨 Anti-Raid triggered in ${member.guild.name}: ${recentJoins.length} joins in ${automodData.AntiRaid.timeWindow}s`);

        const action = automodData.AntiRaid.action;
        const reason = `Anti-Raid: ${recentJoins.length} joins in ${automodData.AntiRaid.timeWindow} seconds`;

        for (const join of recentJoins) {
          const raidMember = await member.guild.members.fetch(join.userId).catch(() => null);
          if (!raidMember) continue;

          if (action === "kick" && raidMember.kickable) {
            await raidMember.kick(reason).catch(err => 
              console.error(`Failed to kick ${raidMember.user.tag}:`, err)
            );
          } else if (action === "ban" && raidMember.bannable) {
            await raidMember.ban({ reason }).catch(err => 
              console.error(`Failed to ban ${raidMember.user.tag}:`, err)
            );
          }
        }

        joinCache.delete(guildId);

        const owner = await member.guild.fetchOwner();
        await owner.send({
          content: `🚨 **Anti-Raid Alert**\n\nRaid detected in **${member.guild.name}**!\n**Action taken:** ${action}\n**Members affected:** ${recentJoins.length}\n**Time window:** ${automodData.AntiRaid.timeWindow}s`
        }).catch(() => {});
      }
    } catch (error) {
      console.error('[GuildMemberAdd] Anti-raid error:', error);
    }
  },
};

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
