const { SlashCommandBuilder } = require('discord.js');

const timers = {};
const status = { 
    running: true,
    paused: false,
}

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
        } else if(interaction.options.getSubcommand() === 'stop') {
            stop(interaction, key);
        } else if(interaction.options.getSubcommand() === 'pause') {
            pause(interaction, key);
        } else if(interaction.options.getSubcommand() === 'resume') {
            resume(interaction, key);
        } else if(interaction.options.getSubcommand() === 'get-time') {
            getTime(interaction, key);
        }
    },
};

async function start() {}
async function stop() {}
async function pause() {}
async function resume() {}
async function getTime() {}

function timer() {
    const intervalID = setInterval(() => {
    }, 500);

    return intervalID;
}