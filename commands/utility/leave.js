const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave voice channel'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        if(!connection) {
            await interaction.reply('No connection to leave from!');
            return;
        }
        connection.destroy();
    },
};
