const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('react')
        .setDescription('Command for Users to react to'),
    async execute(interaction) {
        const message = await interaction.reply({ content: 'You can react with Unicode emojis!', fetchReply: true });
        message.react('🍎')
			.then(() => message.react('🍊'))
			.then(() => message.react('🍇'))
			.catch(error => console.error('One of the emojis failed to react:', error));

        const collectorFilter = (reaction, user) => {
            return ['🍎', '🍊', '🍇'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        };

        message.awaitReactions({ filter: collectorFilter, max: 1, time: 60_000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();

            const role1 = interaction.guild.roles.cache.get('1209980983714127932');
            const role2 = interaction.guild.roles.cache.get('1209981111552311336');
            const role3 = interaction.guild.roles.cache.get('1209981281299861564');

            const member = interaction.member;

            if (reaction.emoji.name === '🍎') {
                if (member.roles.cache.some(role => role === role1)) {
                    member.roles.remove(role1)
                    .then(() => message.reply(`${member.user.username} responded to remove role ${role1.name}`))
                    .catch(error => console.error('Failed to add role:', error));
                } else {
                    member.roles.add(role1)
                .then(() => message.reply(`${member.user.username} responded for role ${role1.name}`))
                .catch(error => console.error('Failed to add role:', error));
                }
            }
            if (reaction.emoji.name === '🍊') {
                if (member.roles.cache.some(role => role === role2)) {
                    member.roles.remove(role2)
                    .then(() => message.reply(`${member.user.username} responded to remove role ${role2.name}`))
                    .catch(error => console.error('Failed to add role:', error));
                } else {
                    member.roles.add(role2)
                .then(() => message.reply(`${member.user.username} responded for role ${role2.name}`))
                .catch(error => console.error('Failed to add role:', error));
                }
            }
            if (reaction.emoji.name === '🍇') {
                if (member.roles.cache.some(role => role === role3)) {
                    member.roles.remove(role3)
                    .then(() => message.reply(`${member.user.username} responded to remove role ${role3.name}`))
                    .catch(error => console.error('Failed to add role:', error));
                } else {
                    member.roles.add(role3)
                .then(() => message.reply(`${member.user.username} responded for role ${role3.name}`))
                .catch(error => console.error('Failed to add role:', error));
                }
            }
        })
        .catch(collected => {
            console.error('Error while collecting reaction:', collected);
            interaction.reply('An error occurred while collecting your reaction.');
        });
    },
};
