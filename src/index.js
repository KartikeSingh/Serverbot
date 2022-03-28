// Hosting
const app = (require('express'))();
const axios = require('axios').default;

app.get("/", (req, res) => res.sendStatus(200));
app.listen(3000)

setInterval(() => {
    axios.get("http://conscious-petal-archduchess.glitch.me/").catch(e => { })
    axios.get("http://burly-pricey-sycamore.glitch.me/").catch(e => { })
})

// Importing Lib
const Discord = require('discord.js');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const { readdirSync } = require('fs');
const { join } = require('path');

// Loading the enviromentvariables
dotenv.config();

// Connecting to mongoose
mongoose.connect(process.env.URI, { useUnifiedTopology: true, useNewUrlParser: true });

// Creating the client instance
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGES","GUILD_MEMBERS"],
    partials: ["REACTION", "MESSAGE"]
});

// Required vari
client.commands = new Discord.Collection();
client.categories = readdirSync(join(__dirname, "./commands"));
client.owners = ["441943765855240192"];

// Event handler
readdirSync(join(__dirname, "./events")).forEach(file => client.on(file.split(".")[0], (...args) => require(`./events/${file}`)(client, ...args)));

// Command Handler
for (let i = 0; i < client.categories.length; i++) {
    const commands = readdirSync(join(__dirname, `./commands/${client.categories[i]}`)).filter(file => file.endsWith(".js"));

    for (let j = 0; j < commands.length; j++) {
        const command = require(`./commands/${client.categories[i]}/${commands[j]}`);
        if (!command || !command?.data?.name || typeof (command?.run) !== "function") continue;

        client.commands.set(command.data.name, command);
    }
}

// Logging in the client!
client.login(process.env.TOKEN);