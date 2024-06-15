require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "verify",
    description: "verifies a user",
    options: [
    	{
    		name: "user",
    		description: "the user to verify",
    		type: ApplicationCommandOptionType.User,
        required: true
    	},
      {
        name: "verify",
        description: "The actual verification. true: verify, false: ask for further proof/reject",
        type: ApplicationCommandOptionType.Boolean,
        required: true 
      }
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.BOT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Slash commands were registered successfully!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();