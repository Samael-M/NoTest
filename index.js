const config = require('./config.json'); // Make sure there is a config with token for bot to work

const fs = require('node:fs');
const path = require('node:path');

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ // set premissons of bot
    intents: [
        GatewayIntentBits.Guilds, //Allows changing of roles, and updating roles, making/removing channels
        GatewayIntentBits.GuildMessages, //Allows sending messages
        GatewayIntentBits.MessageContent, // Allows reading messages
        GatewayIntentBits.GuildMembers, // Adding and Removing members
        GatewayIntentBits.GuildMessageReactions, //Allows reactions
        GatewayIntentBits.GuildVoiceStates,
    ],
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


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

    for(command in interaction.client.commands) {
        console.log(`commands: /${command}`);
    }

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
