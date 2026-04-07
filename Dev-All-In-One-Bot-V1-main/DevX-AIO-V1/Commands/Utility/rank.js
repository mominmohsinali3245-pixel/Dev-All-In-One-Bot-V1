const { 
  SlashCommandBuilder, 
  ContainerBuilder, 
  TextDisplayBuilder, 
  MessageFlags, 
  AttachmentBuilder 
} = require('discord.js');
const levelSchema = require('../../Schemas/levelSchema');
const { RankCardBuilder } = require('discord-card-canvas');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your or another user\'s rank and XP')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to check the rank of (defaults to yourself)')
                .setRequired(false)
        ),
    
    async execute(interaction, client) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id);
        
        try {
            // Get user's level data
            const levelData = await levelSchema.findOne({
                userId: target.id,
                guildId: interaction.guild.id
            });
            
            if (!levelData) {
                return interaction.reply({
                    content: target.id === interaction.user.id
                        ? 'You don\'t have any XP yet! Send messages to start earning XP.'
                        : `${target.username} doesn\'t have any XP yet.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
            
            // Calculate XP needed for next level
            const xpNeeded = levelData.level * 100;
            const currentXP = levelData.xp;
            
            // Get rank position
            const allUsers = await levelSchema.find({ guildId: interaction.guild.id }).sort({ xp: -1 });
            const rank = allUsers.findIndex(user => user.userId === target.id) + 1;
            
            // Defer the reply to prevent interaction timeout
            await interaction.deferReply();
            
            // Create rank card using discord-card-canvas
            try {
                const canvasRank = await new RankCardBuilder({
                    currentLvl: levelData.level,
                    currentRank: rank,
                    currentXP: currentXP,
                    requiredXP: xpNeeded,
                    backgroundColor: { background: '#070d19', bubbles: '#0ca7ff' },
                    avatarImgURL: target.displayAvatarURL({ extension: 'png' }),
                    nicknameText: { content: target.username, font: 'Nunito', color: '#0CA7FF' },
                    userStatus: member.presence?.status || 'online',
                }).build();
                
                const buffer = canvasRank.toBuffer();
                const attachment = new AttachmentBuilder(buffer, { name: "RankCard.png" });
                await interaction.editReply({ content: "Here is your rank card:", files: [attachment] });
            } catch (error) {
                console.error('Error building rank card:', error);
                
                // Fallback to container if card generation fails
                const xpProgress = (currentXP / xpNeeded) * 100;
                const progressBar = '█'.repeat(Math.floor(xpProgress / 10)) + '░'.repeat(10 - Math.floor(xpProgress / 10));
                
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `# ${target.username}'s Rank\n\n**Level**\n${levelData.level}\n\n**XP**\n${currentXP} / ${xpNeeded}\n\n**Rank**\n#${rank}\n\n**Progress**\n${progressBar} ${xpProgress.toFixed(1)}%\n\n**Total Messages**\n${levelData.totalMessages}\n\n*Requested by ${interaction.user.tag}*`
                  )
                );
                
                await interaction.editReply({
                  components: [container],
                  flags: MessageFlags.IsComponentsV2,
                });
            }
            
        } catch (error) {
            console.error('Error in rank command:', error);
            await interaction.reply({
                content: 'An error occurred while fetching rank information.',
                flags: MessageFlags.Ephemeral,
            });
        }
    }
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
