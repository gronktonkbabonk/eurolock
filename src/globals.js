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
    botchannel: null
}

async function initializeGlobals() {
    const guild = await client.guilds.cache.get(process.env.GUILD_ID)
    await guild.members.fetch();

    vars["verifyRole"] = await guild.roles.cache.get("1249111841339084830");
    vars["denyRole"] = await guild.roles.cache.get("1250836031918313563");
    vars["purgateeRole"] = await guild.roles.cache.get("1250838094513573909");

    vars["purgatory"] = await guild.channels.cache.get("1249111811278508142");
    vars["general"] = await guild.channels.cache.get("1249093079496003635");
    vars["botchannel"] = await guild.channels.cache.get("1249520258595684373");
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

client.login(process.env.TOKEN);