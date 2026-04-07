const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, SeparatorSpacingSize, PermissionFlagsBits } = require('discord.js');
const levelSchema = require('../../Schemas/levelSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Manage XP for users (Admin only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give XP to a user')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('The user to give XP to')
                        .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName('amount')
                        .setDescription('Amount of XP to give')
                        .setRequired(true)
                        .setMinValue(1)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove XP from a user')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('The user to remove XP from')
                        .setRequired(true)
                )
                .addIntegerOption(option => 
                    option.setName('amount')
                        .setDescription('Amount of XP to remove')
                        .setRequired(true)
                        .setMinValue(1)
                )
        ),
    
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'You need Administrator permissions to use this command!',
                ephemeral: true
            });
        }
        
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        
        try {
            let levelData = await levelSchema.findOne({ 
                userId: target.id, 
                guildId: interaction.guild.id 
            });
            
            if (!levelData) {
                levelData = new levelSchema({
                    userId: target.id,
                    guildId: interaction.guild.id,
                    xp: 0,
                    level: 1,
                    lastMessage: new Date(),
                    totalMessages: 0
                });
            }
            
            const oldLevel = levelData.level;
            
            if (subcommand === 'give') {
                levelData.xp += amount;
                
                const xpNeeded = levelData.level * 100;
                while (levelData.xp >= xpNeeded) {
                    levelData.xp -= xpNeeded;
                    levelData.level++;
                    levelData.xpNeeded = levelData.level * 100;
                }
                
                await levelData.save();
                
                let description = `Successfully added **${amount} XP** to ${target.username}\n\n**User:** ${target.tag}\n**XP Added:** ${amount}\n**New XP:** ${levelData.xp}`;
                
                if (oldLevel !== levelData.level) {
                    description += `\n\n🎉 **Level Up!**\n${target.username} leveled up to level ${levelData.level}!`;
                }
                
                const container = new ContainerBuilder()
                    .addTextDisplay(
                        new TextDisplayBuilder()
                            .setTitle('✅ XP Added')
                            .setDescription(description)
                    )
                    .addSeparator(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplay(
                        new TextDisplayBuilder()
                            .setDescription(`*Level ${oldLevel} → Level ${levelData.level}*`)
                    );
                
                await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
                
            } else if (subcommand === 'remove') {
                if (levelData.xp < amount) {
                    levelData.xp = 0;
                } else {
                    levelData.xp -= amount;
                }
                
                while (levelData.level > 1 && levelData.xp < 0) {
                    levelData.level--;
                    levelData.xp += (levelData.level * 100);
                }
                
                if (levelData.xp < 0) levelData.xp = 0;
                
                await levelData.save();
                
                let description = `Successfully removed **${amount} XP** from ${target.username}\n\n**User:** ${target.tag}\n**XP Removed:** ${amount}\n**New XP:** ${levelData.xp}`;
                
                if (oldLevel !== levelData.level) {
                    description += `\n\n⬇️ **Level Down**\n${target.username} leveled down to level ${levelData.level}`;
                }
                
                const container = new ContainerBuilder()
                    .addTextDisplay(
                        new TextDisplayBuilder()
                            .setTitle('✅ XP Removed')
                            .setDescription(description)
                    )
                    .addSeparator(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplay(
                        new TextDisplayBuilder()
                            .setDescription(`*Level ${oldLevel} → Level ${levelData.level}*`)
                    );
                
                await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
            
        } catch (error) {
            console.error('Error in xp command:', error);
            await interaction.reply({
                content: 'An error occurred while managing XP.',
                ephemeral: true
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
