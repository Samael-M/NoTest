const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource, getVoiceConnection } = require('@discordjs/voice');
const path = require('node:path');
const { subscribe } = require('node:diagnostics_channel');

const timers = {};
const status = { 
    running: true,
    paused: false,
}

const modulo = (dividend, divisor) => [Math.floor(dividend / divisor), dividend % divisor];

module.exports = {
    category: 'timer',
    data: new SlashCommandBuilder()
        .setName('timer')
        .setDescription('General Use Timer')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('set timer')
                .addIntegerOption(option =>
                    option.setName('hours')
                        .setDescription('hours to set')
                        .setMinValue(0)
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('minutes to set')
                        .setMaxValue(59)
                        .setMinValue(0)
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('seconds')
                        .setDescription('seconds to set')
                        .setMaxValue(59)
                        .setMinValue(0)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('remaining')
            .setDescription('Show time left on timer'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('pause')
            .setDescription('Pause the timer'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('resume')
            .setDescription('Resume the timer'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('cancel')
            .setDescription('cancel the timer')),
    async execute(interaction) {
        const key = `${interaction.channelId}`;
        const channel = interaction.member.voice.channel;
        const connection = getVoiceConnection(interaction.guild.id);

        if (interaction.options.getSubcommand() === 'set') {
            setTimer(interaction, key, channel);
        } else if(interaction.options.getSubcommand() === 'pause') {
            pauseTimer(interaction, key);
        } else if(interaction.options.getSubcommand() === 'resume') {
            resumeTimer(interaction, key, channel);
        } else if(interaction.options.getSubcommand() === 'cancel') {
            cancelTimer(interaction, key, connection);
        } else if(interaction.options.getSubcommand() === 'remaining') {
            remaining(interaction, key);
        } 
        
    },
};

async function remaining(interaction, key) {
    if(timers[key]) {
        const time = timers[key].timeRemaining;

        const split = timeSplit(time);

        if (timers[key].running) {
            await interaction.reply(`The timer has ${split[0]} hours, ${split[1]} minutes, and ${split[2]} seconds left`);
        } else {
            await interaction.reply(`The timer is currently paused with ${split[0]} hours, ${split[1]} minutes, and ${split[2]} seconds time remaining`);
        }
    } else {
        await interaction.reply('No timer is set!');
    }
}

async function pauseTimer(interaction, key) {
    if (timers[key]) {
        const timeUsed = Date.now() - timers[key].startTime;
        timers[key].timeRemaining = timers[key].totalTime - timeUsed;
        timers[key].running = status.paused;
        clearInterval(timers[key].ID);

        const split = timeSplit(timers[key].timeRemaining );

        await interaction.reply(`Timer paused! ${split[0]} hours, ${split[1]} minutes, and ${split[2]} seconds left`);
    } else {
        await interaction.reply('No timer to pause.');
    }
}
async function resumeTimer(interaction, key, channel) {
    if (timers[key]) {
        timers[key].startTime = Date.now();
        const connection = getVoiceConnection(interaction.guild.id);
        timers[key].running = status.running;
        timers[key].ID = timer(timers[key].startTime, timers[key].timeRemaining, key, channel, connection);

        const split = timeSplit(timers[key].timeRemaining );

        await interaction.reply(`Timer resumed for ${split[0]} hours, ${split[1]} minutes, and ${split[2]} seconds`);
    } else {
        await interaction.reply('No timer to resume.');
    } 
}

async function cancelTimer(interaction, key, connection) {

    if (timers[key]) {
        clearInterval(timers[key].ID);
        delete timers[key]; 
        await interaction.reply('Timer cancelled!');
        if(connection) { connection.destroy(); }
    } else {
        await interaction.reply('No timer to cancel.');
    }
}

async function setTimer(interaction, key, channel)  {
    await interaction.deferReply();

    if (timers[key]) { //do we want the new timer to automaticall override old?
        clearInterval(timers[key].ID);
    }

    const hours = interaction.options.getInteger('hours') * 3600000;
    const minutes = interaction.options.getInteger('minutes') * 60000;
    const seconds = interaction.options.getInteger('seconds') * 1000;

    const timeToSet = hours + minutes + seconds;
    if (timeToSet == 0) { 
        await interaction.editReply('Can\'t set a timer with no duration!');
        return;
    } else { await interaction.editReply(`You have set a timer for ${hours / 3600000} hours, ${minutes / 60000} minutes, ${seconds / 1000} seconds`); }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    console.log(`Timer will go off in ${timeToSet} miliseconds or ${timeToSet / 60000} minutes`);
    var start = Date.now();
    const intervalID = timer(start, timeToSet, key, connection);
    
    timers[key] = {
        ID: intervalID,
        startTime: start,
        totalTime: timeToSet,
        timeRemaining: timeToSet, //was just set
        running: status.running,
    };
}

function timer(startTime, timeToSet, key, channel, connection) {
    const intervalID = setInterval(() => {
        if(!channel) { 
            console.log('No connection! Timer stoped');
            return; 
        }

        timers[key].timeRemaining = timeToSet - (Date.now() - startTime);
        if (checkExpired(startTime, timeToSet)) {
            
            console.log('TIMER GOING OFF');
            alarm(connection);
            clearInterval(intervalID);
            delete timers[key];
        }
    }, 1000);

    return intervalID;
}


function alarm(connection) {
    const player = createAudioPlayer();
    const alarmPath = path.join(__dirname, '../..', 'Sound/Alarm.mov');

    const resource = createAudioResource(alarmPath, { inlineVolume: true });
    resource.volume.setVolume(1);
    console.log('Volume set to 1');

    connection.subscribe(player); // Subscribe the connection to the player
    player.play(resource);
}

function checkExpired(startTime, totalTime) {
    const curTime = Date.now();

    var timeDifference = Math.abs(curTime - startTime);
    console.log(`It has been ${timeDifference / 1000.0} seconds`);
    if (timeDifference > totalTime) {
        return true;
    } else {
        return false;
    }
}

function timeSplit(time) {
    const hours = modulo(time, 3600000);
    const minutes = modulo(hours[1], 60000);
    const seconds = minutes[1] / 1000;

    return [hours[0], minutes[0], seconds];
}