require("dotenv").config();
const { global } = require('./globals.js');
const { Client, IntentsBitField, GuildMember, User, EmbedBuilder } = require("discord.js");

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.GuildMessageReactions
	]
});

let purgatees = [];
let denials = [];

client.on("ready", async () => {
    console.log("online :D");
    updatePurgateeListEmbed();
	updateFullServerCount()
});

client.on("guildMemberAdd", async (member) => {
	const purgateeRole = await global("purgateeRole")
	member.roles.add(purgateeRole)

	updateFullServerCount()

    console.log(`User ${member.user.tag} joined.`);    
    updatePurgateeListEmbed();
});

client.on("guildMemberRemove", (member) => {
    updatePurgateeListEmbed();
});

client.on("messageCreate", (message) => {
	if (message.content === "/j" || message.content.slice(-2) == "/j") {
		message.reply("I'm dead 💀 (biologically speaking I am, in fact, alive. However, to emphasize how hilarious I found the comment just made, I made a hyperbolic statement saying that I was dead because it implies that I found the joke so funny I ceased to live. However, I am indeed alive and well so there is no need for you all to worry. I was simply employing the tactic of figurative language in order to better and more effectively communicate my message. Additionally, using slang and sayings commonly employed by the youth has made my message more understandable and reachable by the younger generation, many of whom are in this chat. For example, I could have said 'that joke was a real knee slapper'. This would have made sense to some of the older people in this chat as knee slapping used to be a sign of hilarity. However, in this digital age in which we now live, knee slapping is not as common and many of today's youth may not understand the reference. I therefore made my message more understandable to younger people through my use of simple, easily understood slang. I hope this clears everything up, and I appreciate any concern that I was actually dead. I can assure you I am alive and well.)");
	} 
});

	client.on('messageReactionAdd', async (reaction, user) => {
		message = await client.channels.get(1249101830034558986).fetchMessage(1251687465291481212);
		console.log(message)
	    console.log(`Reaction added: ${reaction.emoji.name} by ${user.username}`);
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
	} else if(interaction.commandName == "update"){
		updatePurgateeListEmbed()
		interaction.reply( {content:"Updated role arrays", ephemeral:true })
	}
});


async function updateFullServerCount(){
	const guild = client.guilds.cache.get(process.env.GUILD_ID);
	const serverchannel = guild.channels.cache.get("1251678507042603149");
	
	const serverCount = Math.floor(guild.memberCount / 12) 
	serverchannel.setName(`Full servers: ${serverCount}`)
}


function getRoleList(list, listName){
	const roleNames = list.map(member => `<@${member.user.id}>`);

	if (roleNames.length === 0) {
        return `No current ${listName} in server.`;
    } else {
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
	await delay(2000)
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
                    name: "Purgatees",
                    value: getRoleList(purgatees, "purgatees"),
                    inline: false
                },
                {
                    name: "Denials",
                    value: getRoleList(denials, "denials"),
                    inline: false
                }
            ]
        };
       	const newMessage = { embeds: [embed] }

        if (existingMessage) {
        	if (!(JSON.stringify(newMessage.embeds[0].fields) === JSON.stringify(existingMessage.embeds[0].fields))) {
	            await existingMessage.delete();
	            await botchannel.send({ embeds: [embed] });
	        } 
        } else {
            await botchannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error("Error updating purgatee list embed:", error);
    }
}

client.login(process.env.TOKEN);