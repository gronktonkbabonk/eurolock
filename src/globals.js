require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
    ]
});

const vars = {
    verifyRole: null,
    denyRole: null,
    purgateeRole: null,
    purgatory: null,
    general: null,
    botchannel: null,
    serverchannel: null,
    guild: null
}

async function initializeGlobals() {
    if(!client.isReady()){
        return new Promise((resolve, reject) => {
            client.once('ready', async () => {
                try {
                    await initializeGlobals();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    const guild = client.guilds.cache.get(process.env.GUILD_ID);

    if (!guild) {
        throw new Error("Guild not found");
    }

    try {
        await guild.members.fetch();

        vars.verifyRole = guild.roles.cache.get("1249111841339084830");
        vars.denyRole = guild.roles.cache.get("1250836031918313563");
        vars.purgateeRole = guild.roles.cache.get("1250838094513573909");

        vars.purgatory = guild.channels.cache.get("1249111811278508142");
        vars.general = guild.channels.cache.get("1249093079496003635");
        vars.botchannel = guild.channels.cache.get("1249520258595684373");
        vars.serverchannel = guild.channels.cache.get("1251678507042603149");

    } catch (error) {
        console.error("Failed to initialize global variables:", error);
        throw error;
    }
}

async function global(globalvar) {
    if (!vars[globalvar]) {
        await initializeGlobals();
    }
    return vars[globalvar];
}

module.exports = {
    global
};

client.login(process.env.TOKEN).catch(console.error);
