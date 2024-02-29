const { SlashCommandBuilder } = require('discord.js');
const { dynamicReply } = require('./timerUtils.js');

const timers = {};

module.exports = {
    category: 'timer',
    data: new SlashCommandBuilder()
        .setName('stopwatch')
        .setDescription('Track some time')
        .addSubcommand(subcommand =>
            subcommand
            .setName('start')
            .setDescription('start the stopwatch'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('stop')
            .setDescription('stop the stopwatch'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('get-time')
            .setDescription('Get current stopwatch time'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('pause')
            .setDescription('Pause the stopwatch'))
        .addSubcommand(subcommand =>
            subcommand
            .setName('resume')
            .setDescription('Resume the stopwatch')),
    async execute(interaction) {
        const key = `${interaction.channelId}`;

        if (interaction.options.getSubcommand() === 'start') {
            start(interaction, key);
            return;
        } 
        if(!timers[key]) { //check for stopwatch before trying to interact so we don't need to repeat the code in each function
            await interaction.reply('There no stopwatch running!');
            return;
        } else {
            if(interaction.options.getSubcommand() === 'stop') {
                stop(interaction, key);
            } else if(interaction.options.getSubcommand() === 'pause') {
                pause(interaction, key);
            } else if(interaction.options.getSubcommand() === 'resume') {
                resume(interaction, key);
            } else if(interaction.options.getSubcommand() === 'get-time') {
                getTime(interaction, key);
            }
        }
        
    },
};

async function start(interaction, key) {
    if(timers[key]) { 
        await interaction.reply('There is already a stopwatch running!');
        return
    }

    timer(key);
    if(!timers[key]) {
        await interaction.reply('timers[key] does not exist');
    } else { await interaction.reply('Stopwatch started!'); }
}

async function stop(interaction, key) {
    clearInterval(timers[key].ID);
    const time = splitTime(timers[key].time);
    delete timers[key];

    const messageTime = dynamicReply(time); //dynamic only add amount of hours or minutes passed if at least 1 has
    await interaction.reply(`Stopwatch ended. It has been ${messageTime}`);
}

async function pause(interaction, key) {
    clearInterval(timers[key].ID);
    const time = splitTime(timers[key].time);
    timers[key].running = false;

    const messageTime = dynamicReply(time); 
    await interaction.reply(`Stopwatch paused. It has been ${messageTime}`);
}

async function resume(interaction, key) {
    timer(key);
    await interaction.reply('Stopwatch resumed!');
}

async function getTime(interaction, key) {
    const time = splitTime(timers[key].time);

    const messageTime = dynamicReply(time); 
    if(timers[key].running) {
        await interaction.reply(messageTime);
    } else {
        await interaction.reply(`Stopwatch is currently paused. It has been ${messageTime}`);
    }
}

function timer(key) {
    var timeStash = 0;
    const intervalID = setInterval(() => {
        if(timers[key]) {
            if(!timers[key].running) {
                timers[key].ID = intervalID;
                timers[key].start = Date.now();
                timers[key].running = true;
                timeStash = timers[key].time;
                console.log(`Timer is running after being paused. Previous time was ${timeStash}`);
            }
            timers[key].time = Date.now() - timers[key].start + timeStash;
            
            console.log(`It has been ${timers[key].time / 1000} seconds`);
        }
    }, 500); //check timer roughly (setInterval isn't precisely accurate) every half second 

    if(!timers[key]) {
        timers[key] = {
            ID: intervalID,
            start: Date.now(),
            time: 0,
            running: true
        };
    } 
}