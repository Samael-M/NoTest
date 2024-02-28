const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const path = require('node:path');

const timers = {};
const holds = {};

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

        if (interaction.options.getSubcommand() === 'set') {
            setTimer(interaction, key);
        } else if(interaction.options.getSubcommand() === 'pause') {
            pauseTimer(interaction, key);
        } else if(interaction.options.getSubcommand() === 'resume') {
            resumeTimer(interaction, key);
        } else if(interaction.options.getSubcommand() === 'cancel') {
            cancelTimer(interaction, key);
        }
        
    },
};

async function pauseTimer(interaction, key) {
    if (timers[key]) {
        const timeUsed = Date.now() - timers[key].startTime;
        timers[key].timeRemaining = timers[key].totalTime - timeUsed;
        clearInterval(timers[key].ID);
        await interaction.reply(`Timer paused! ${timers[key].timeRemaining / 60000} minutes left`);
    } else {
        await interaction.reply('No timer to pause.');
    }
}
async function resumeTimer(interaction, key) {
    if (timers[key]) {
        timers[key].startTime = Date.now();

        timers[key].ID = setInterval(() => {
            if(!interaction.member.voice.channel) { 
                console.log('No connection! Timer stoped');
                return; 
            }
            if (checkExpired(timers[key].startTime, timers[key].timeRemaining)) {
                
                console.log('TIMER GOING OFF');
                //alarm(connection, channel);
                clearInterval(timers[key].ID);
            }
        }, 1000);

        await interaction.reply('Timer resumed!');
    } else {
        await interaction.reply('No timer to resume.');
    } 
}

async function cancelTimer(interaction, key) {

    if (timers[key]) {
        clearInterval(timers[key]);
        delete timers[key]; 
        await interaction.reply('Timer cancelled!');
    } else {
        await interaction.reply('No timer to cancel.');
    }
}

async function setTimer(interaction, key)  {
    await interaction.deferReply();

    if (timers[key]) {
        clearInterval(timers[key].ID);
    }

    const hours = interaction.options.getInteger('hours') * 3600000;
    const minutes = interaction.options.getInteger('minutes') * 60000;
    const seconds = interaction.options.getInteger('seconds') * 1000;

    // var hours = 0;   
    // var minutes = 0;
    // var seconds = 0;

    // if (getHours) { hours = getHours * 3600000; }            //fields are supposed to be options, but having issues with that
    // if (getMinutes) { const minutes = getMinutes * 60000; } 
    // if (getSeconds) { const seconds = getSeconds * 1000; } 

    const timeToSet = hours + minutes + seconds;
    if (timeToSet == 0) { 
        await interaction.editReply(`You have to set a time! You set timer for ${hours} hours, ${minutes} minutes, ${seconds} seconds`);
        return;
    } else { await interaction.editReply('Setting timer'); }

    const channel = interaction.member.voice.channel;
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    console.log(`Timer will go off in ${timeToSet} miliseconds or ${timeToSet / 60000} minutes`);
    var start = Date.now();
    const intervalID = setInterval(() => {
        if(!channel) { 
            console.log('No connection! Timer stoped');
            return; 
        }
        if (checkExpired(start, timeToSet)) {
            
            console.log('TIMER GOING OFF');
            //alarm(connection, channel);
            clearInterval(timers[key]);
        }
    }, 1000);
    
    timers[key] = {
        ID: intervalID,
        startTime: start,
        totalTime: timeToSet,
        timeRemaining : timeToSet //was just set
    };
}


function alarm(connection, channel) {
    const player = createAudioPlayer();
    const alarmPath = path.join(__dirname, '../..', 'Sound/Alarm.mov');

    const resource = createAudioResource(alarmPath, { inlineVolume: true });
    resource.volume.setVolume(1);
    console.log('Volume set to 1');

    const listeners = channel.members.filter(member => !member.user.bot);

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