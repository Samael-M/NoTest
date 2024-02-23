const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave voice channel'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);
        connection.destroy();
    },
};
