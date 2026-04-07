const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require(`discord.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription(`Get info of a member in the server.`)
    .addUserOption(option => option.setName(`user`).setDescription(`the user you want to get info from`).setRequired(false)),
    async execute (interaction, client) {

        const formatter = new Intl.ListFormat(`en-GB`, { style: `narrow`, type: `conjunction` });
        
        //Change the emojis down below
        const badges = {
            BugHunterLevel1: "🐛",
            BugHunterLevel2: "🐛",
            HypeSquadOnlineHouse1: "🦁",
            HypeSquadOnlineHouse2: "✨",
            HypeSquadOnlineHouse3: "⚖️",
            Hypesquad: "⭐",
            Nitro: "",
            Boost: "",
            Partner: "🤝",
            PremiumEarlySupporter: "🅿️",
            Staff: "👔",
            VerfiedDeveloper: "<:admin:1423012525561348248>",
            ActiveDeveloper: "👨‍💻",
        }

        const user = interaction.options.getUser(`user`) || interaction.user;
        const userFlags = user.flags.toArray();
        const member = await interaction.guild.members.fetch(user.id);
        const topRoles = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map(role => role)
        .slice(0, 1)
        const banner = await (await client.users.fetch(user.id, { force: true })).bannerURL({ size: 4096 });
        const booster = member.premiumSince ? `<:booster:1423012527973072986> Yes` : `No`; //Change the emoji
        const ownerE = `<:owner:1423012530233540760>`// change the server owner emoji
        const devs = `<:admin:1423012525561348248>` // change the bot dev emoji
        const owners = [
            `870179991462236170`, // id for the devs of the bot
        ]
        const MutualServers = []
        const JoinPosition = await interaction.guild.members.fetch().then(Members => Members.sort((a, b) => a.joinedAt - b.joinedAt).map((User) => User.id).indexOf(member.id) + 1)

        for (const Guild of client.guilds.cache.values()) {
            if (Guild.members.cache.has(member.id)) {
                MutualServers.push(`[${Guild.name}](https://discord.com/guilds/${Guild.id})`)
            }
        }

        if (member.user.bot) {
          const botContainer = new ContainerBuilder();
          botContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`❌ Bots are not available`)
          );
          return await interaction.reply({
            components: [botContainer],
            flags: MessageFlags.IsComponentsV2,
          });
        }

        const container = new ContainerBuilder();

        // Title with badges
        let title = `# ${member.user.tag}`;
        if (owners.includes(member.id) && member.id == interaction.guild.ownerId) {
          title += ` ${devs} ${ownerE}`;
        } else if (member.id == interaction.guild.ownerId) {
          title += ` ${ownerE}`;
        } else if (owners.includes(member.id)) {
          title += ` ${devs}`;
        }

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(title)
        );

        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );

        // User information
        container.addTextDisplayComponents(
          new TextDisplayComponents().setContent(
            `**Id** - ${member.id}\n• **Boosted** - ${booster}\n• **Top Role** - ${topRoles}\n• **Joined** - <t:${parseInt(member.joinedAt / 1000)}:R>\n• **Discord User** - <t:${parseInt(user.createdAt / 1000)}:R>`
          )
        );

        // Banner
        if (banner) {
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
          );

          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Banner**`)
          );

          container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder().setURL(banner)
            )
          );
        }

        container.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );

        // Footer
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${member ? `Join Position - ${JoinPosition} | ` : ''}Mutual Servers - ${MutualServers.length}`
          )
        );

        await interaction.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
    }
}

/*
*/

/*
: ! Aegis !
    + Discord: itsfizys
    + Portfolio: https://itsfiizys.com
    + Community: https://discord.gg/8wfT8SfB5Z  (AeroX Development )
    + for any queries reach out Community or DM me.
*/
