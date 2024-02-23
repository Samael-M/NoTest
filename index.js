// Full code at :https://github.com/Rademero/DiscordBot1
// https://www.howtogeek.com/364225/how-to-make-your-own-discord-bot/

// https://discordapp.com/oauth2/authorize?client_id=1209895589018476544&scope=bot


const config = require('./config.json'); // Retrieves the Config file from active directory

const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js'); // runs the discord.js script for activating bot

const client = new Client({ // set premissons of bot
    intents: [
        GatewayIntentBits.Guilds, //Allows changing of roles, and updating roles, making/removing channels
        GatewayIntentBits.GuildMessages, //Allows sending messages
        GatewayIntentBits.MessageContent, // Allows reading messages
        GatewayIntentBits.GuildMembers, // Adding and Removing members
        GatewayIntentBits.GuildMessageReactions, //Allows reactions
    ],
    // For more info go here: https://discord-api-types.dev/api/discord-api-types-v10/enum/GatewayIntentBits
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

//Runs when bot Starts Up
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


//whenever a message is posted in a server, run contents
client.on('messageCreate', msg => {

    //If message is ping, respond with pong, messages like ping pong or like my ping will not trigger
    if (msg.content === 'ping') {

        msg.reply('pong');
    }

    var channel = msg.channelId.toString();

    if ((msg.content === 'hello') && (channel == genChat)) {
        msg.reply('there');
    }

});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

//Start up bot using the Config file to get token
client.login(config.token);

const genChat = config.genChat;