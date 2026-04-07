const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, SeparatorSpacingSize, PermissionFlagsBits, ChannelType } = require('discord.js');
const levelUpChannelSchema = require('../../Schemas/levelUpChannelSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelupchannel')
        .setDescription('Manage the level-up congratulations message channel (Admin only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set the channel for level-up congratulations messages')
                .addChannelOption(option => 
                    option.setName('channel')
                        .setDescription('The channel to send level-up messages to')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option.setName('message')
                        .setDescription('Custom message for level-ups (use {user} and {level} as variables)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable level-up congratulations messages')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check the current level-up channel settings')
        ),
    
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'You need Administrator permissions to use this command!',
                ephemeral: true
            });
        }
        
        const subcommand = interaction.options.getSubcommand();
        
        try {
            if (subcommand === 'set') {
                const channel = interaction.options.getChannel('channel');
                const customMessage = interaction.options.getString('message') || "🎉 Congratulations {user}! You've reached level {level}!";
                
                if (!channel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
                    return interaction.reply({
                        content: `I don't have permission to send messages in ${channel}!`,
                        ephemeral: true
                    });
                }
                
                let levelUpSettings = await levelUpChannelSchema.findOne({ guildId: interaction.guild.id });
                
                if (!levelUpSettings) {
                    levelUpSettings = new levelUpChannelSchema({
                        guildId: interaction.guild.id,
                        channelId: channel.id,
                        enabled: true,
                        customMessage: customMessage
                    });
                } else {
                    levelUpSettings.channelId = channel.id;
                    levelUpSettings.enabled = true;
                    levelUpSettings.customMessage = customMessage;
                }
                
                await levelUpSettings.save();
                
                const container = new ContainerBuilder()
                    .addTextDisplay(
                        new TextDisplayBuilder()
                            .setTitle('✅ Level-up Channel Set')
                            .setDescription(`Level-up congratulations messages will now be sent in ${channel}`)
                    )
                    .addSeparator(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
                    .addTextDisplay(
                        new TextDisplayBuilder()
                            .setDescription(`**Channel:** <#${channel.id}>\n**Enabled:** Yes\n**Custom Message:** ${customMessage}\n\n*Variables: {user} = user mention, {level} = level number*`)
                    );
                
                await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
                
            } else if (subcommand === 'disable') {
                const levelUpSettings = await levelUpChannelSchema.findOne({ guildId: interaction.guild.id });
                
                if (!levelUpSettings) {
                    return interaction.reply({
                        content: 'Level-up messages are already disabled!',
                        ephemeral: true
                    });
                }
                
                levelUpSettings.enabled = false;
                await levelUpSettings.save();
                
                const container = new ContainerBuilder()
                    .addTextDisplay(
                        new TextDisplayBuilder()
                            .setTitle('⚠️ Level-up Messages Disabled')
                            .setDescription('Level-up congratulations messages have been disabled\n\n*Use /levelupchannel set to re-enable them*')
                    );
                
                await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
                
            } else if (subcommand === 'status') {
                const levelUpSettings = await levelUpChannelSchema.findOne({ guildId: interaction.guild.id });
                
                if (!levelUpSettings) {
                    return interaction.reply({
                        content: 'No level-up channel has been set for this server.',
                        ephemeral: true
                    });
                }
                
                const channel = interaction.guild.channels.cache.get(levelUpSettings.channelId);
                const channelName = channel ? `<#${channel.id}>` : 'Channel not found (deleted)';
                
                const container = new ContainerBuilder()
                    .addTextDisplay(
                        new TextDisplayBuilder()
                            .setTitle('📊 Level-up Channel Status')
                            .setDescription(`**Channel:** ${channelName}\n**Status:** ${levelUpSettings.enabled ? 'Enabled' : 'Disabled'}\n**Custom Message:** ${levelUpSettings.customMessage}\n\n*Variables: {user} = user mention, {level} = level number*`)
                    );
                
                await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
            
        } catch (error) {
            console.error('Error in levelupchannel command:', error);
            await interaction.reply({
                content: 'An error occurred while managing the level-up channel settings.',
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
