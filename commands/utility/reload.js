const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload commands')
        .addStringOption( option =>
            option.setName('command')
                .setDescription('Command to reload')
                .setRequired(true)),
    async execute(interaction) {

        const comandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(comandName);

        if(!command) {
            return interaction.reply(`There is no command with name \`${commandName}\`!`);
        }

        delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`../${command.category}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`Command ${command.data.name}\ was reloaded!`);
        } catch(error) {
            console.error(error);
            await interaction.reply(`There was and error reloaded the command /${command.data.name}\`:\n\`${error.message}\``);
        }

    }
}