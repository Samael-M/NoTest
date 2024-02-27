const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Command for Users to give themselves roles'),
    async execute(interaction) {
        const message = await interaction.reply({ content: 'React to get roles', fetchReply: true });
        message.react('🍎')
            .then(() => message.react('🍊'))
            .then(() => message.react('🍇'))
            .catch(error => console.error('One of the emojis failed to react:', error));

        const collector = message.createReactionCollector({ filter: (reaction, user) => !user.bot });

        collector.on('collect', async (reaction, user) => {
            const member = await interaction.guild.members.fetch(user.id);
            const emoji = reaction.emoji.name;

            const role1 = interaction.guild.roles.cache.get('1209980983714127932'); // string is the ID of the role
            const role2 = interaction.guild.roles.cache.get('1209981111552311336');
            const role3 = interaction.guild.roles.cache.get('1209981281299861564');

            if (emoji === '🍎') {
                await handleReaction(member, role1, emoji, !member.roles.cache.has(role1.id));
            } else if (emoji === '🍊') {
                await handleReaction(member, role2, emoji, !member.roles.cache.has(role2.id));
            } else if (emoji === '🍇') {
                await handleReaction(member, role3, emoji, !member.roles.cache.has(role3.id));
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} reactions.`);
        });
    },
};

async function handleReaction(member, role, emoji, added) {
    if (added) {
        await member.roles.add(role);
        console.log(`${member.user.username} responded to add role ${role.name}`);
    } else {
        await member.roles.remove(role);
        console.log(`${member.user.username} responded to remove role ${role.name}`);
    }
}