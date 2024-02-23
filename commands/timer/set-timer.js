const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-timer')
        .setDescription('Set a timer')
        .addIntegerOption(option =>
            option.setName('time')
            .setDescription('Amount of time to set')
            .setRequired(true)),
    async execute(interaction) {
        interaction.reply('Setting timer');

        const channel = interaction.member.voice.channel;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
    },
};