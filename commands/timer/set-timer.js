const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-timer')
        .setDescription('Set a timer')
        .addIntegerOption(option =>
            option.setName('minutes')
            .setDescription('minutes to set')
            .setRequired(true)),
    async execute(interaction) {
        interaction.reply('Setting timer');

        const channel = interaction.member.voice.channel;

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const timeToSet = interaction.options.getInteger('minutes') * 60000;
        console.log(`Timer will go off in ${timeToSet} miliseconds or ${interaction.options.getInteger('minutes')} minutes`);
        var start = Date.now();
        console.log(start);
        var intervalID = setInterval(() => {
            if (checkExpired(start, timeToSet)) {
                console.log('TIMER GOING OFF');
                console.log(`Timer started at ${start}, it is now ${Date.now()}`);
                alarm(connection, channel);
                clearInterval(intervalID);
            }
          }, 300);

    },
};

function alarm(connection, channel) {
    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play, // Other options: Play, Stop
        },
    });
    const alarmPath = path.join(__dirname, '../..', 'Sound/Alarm.mov');

    const resource = createAudioResource(alarmPath, { inlineVolume: true });
    try {
        resource.volume.setVolume(1);
        console.log('Volume set to 0.5');
    } catch (error) {
        console.error('Error setting volume:', error.message);
    }

    const listeners = channel.members.filter(member => !member.user.bot);

    console.log(`There are ${listeners.size} listeners in the voice channel.`);

    connection.subscribe(player); // Subscribe the connection to the player
    player.play(resource);
}

function checkExpired(startTime, totalTime) {
    const curTime = Date.now();

    var timeDifference = Math.abs(curTime - startTime);
    console.log(`It has been ${timeDifference} miliseconds`);
    if (timeDifference > totalTime) {
        return true;
    } else {
        return false;
    }
  }