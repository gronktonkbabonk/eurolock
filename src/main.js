require("dotenv").config();
const { global } = require('./globals.js');
const { Client, IntentsBitField, GuildMember, User, EmbedBuilder} = require("discord.js");

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.DirectMessages
	],
});

let purgatees = [ "ji" ];
let denials = [];

client.on("ready", async () => {
    console.log("online :D");
    updatePurgateeListEmbed();
});

client.on("guildMemberAdd", async (member) => {
	const purgateeRole = await global("purgateeRole")
	member.roles.add(purgateeRole)

    console.log(`User ${member.user.tag} joined.`);    
    updatePurgateeListEmbed();
});

client.on("guildMemberRemove", (member) => {
    updatePurgateeListEmbed();
});

client.on("messageCreate", (message) => {
	console.log(`${message.author.username}: ${message.content}`);
	if (message.content === "/j" || message.content.slice(-2) == "/j") {
		message.reply("I'm dead 💀 (biologically speaking I am, in fact, alive. However, to emphasize how hilarious I found the comment just made, I made a hyperbolic statement saying that I was dead because it implies that I found the joke so funny I ceased to live. However, I am indeed alive and well so there is no need for you all to worry. I was simply employing the tactic of figurative language in order to better and more effectively communicate my message. Additionally, using slang and sayings commonly employed by the youth has made my message more understandable and reachable by the younger generation, many of whom are in this chat. For example, I could have said 'that joke was a real knee slapper'. This would have made sense to some of the older people in this chat as knee slapping used to be a sign of hilarity. However, in this digital age in which we now live, knee slapping is not as common and many of today's youth may not understand the reference. I therefore made my message more understandable to younger people through my use of simple, easily understood slang. I hope this clears everything up, and I appreciate any concern that I was actually dead. I can assure you I am alive and well.)");
	}
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	console.log(`${interaction.user.username} ran command: ${interaction.commandName}`);

	if (interaction.commandName === "verify") {
		const verifyUser = interaction.options.get("user");
		const verify = interaction.options.get("verify");
		const member = await interaction.guild.members.fetch(verifyUser.user.id);

		const verifyRole = await global("verifyRole")
		const denyRole = await global("denyRole")
		const purgateeRole = await global("purgateeRole")

		const purgatory = await global("purgatory")
		const general = await global("purgatory")

		console.log(verifyRole)

		if (verify.value === true) {
			member.roles.add(verifyRole);
			member.roles.remove(denyRole);
			member.roles.remove(purgateeRole);
			updatePurgateeListEmbed();						

			try {
				await member.send("Welcome to the EuroLock discord server! You've been verified!");
			} catch (error) {
				console.log(error);
			}
			updatePurgateeListEmbed()
			interaction.reply({ content: `User ${verifyUser.user.username} has been verified.`, ephemeral: true });
		} else {
			member.roles.add(denyRole);
			member.roles.remove(verifyRole);
			member.roles.remove(purgateeRole);
			updatePurgateeListEmbed();

			try {
				await member.send("Hi there! You joined the EuroLock server but it's for playtesters only, you need to be in the official Deadlock discord. If you have the game, but aren't in the discord, DM an online moderator with a screenshot of your email from valve, and a message asking to be verified. if not, you can join the larger community server, that one is open for everybody: https://discord.gg/UE5Adhbg");
			} catch (error) {
				purgatory.send({ content: `Hi there ${member}! You joined the EuroLock server but it's for playtesters only, you need to be in the official Deadlock discord. If you have the game, but aren't in the discord, DM an online moderator with a screenshot of your email from valve, and a message asking to be verified. if not, you can join the larger community server, that one is open for everybody: https://discord.gg/UE5Adhbg` });
			}

			interaction.reply({ content: `User ${verifyUser.user.username} has been denied.`, ephemeral: true });
		}
	}
});

function getRoleList(list){
	if (list.length === 0) {
        return "No current denials in server.";
    } else {
    	const roleNames = list.map(member => `<@${member.user.id}>`);
        return roleNames.join("\n")
    }
}

async function updateRoleArrays(){
	const purgateeRole = await global("purgateeRole")
	const denyRole = await global("denyRole")

	purgatees = purgateeRole.members
	denials = denyRole.members	
}


async function updatePurgateeListEmbed() {
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
	
	await delay(1500)

    await updateRoleArrays();

    try {
        const botchannel = await global("botchannel"); 

        if (!botchannel) {
            console.error("Bot channel not found."); 
            return;
        }

        const messages = await botchannel.messages.fetch();
        const existingMessage = messages.first();
        const embed = {
            color: 0x0099FF,
            title: "Purgatee List",
            fields: [
                {
                    name: "Users",
                    value: getRoleList(purgatees)
                },
                {
                    name: "Denials",
                    value: getRoleList(denials)
                }
            ]
        };

        if (existingMessage) {
            await existingMessage.edit({ embeds: [embed] });
        } else {
            await botchannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error("Error updating purgatee list embed:", error);
    }
}

client.login(process.env.TOKEN);