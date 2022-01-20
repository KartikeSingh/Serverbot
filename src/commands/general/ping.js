module.exports = {
    data: {
        name: "ping",
        description: "Get the bot's ping!",
        options: [],
    },

    run: async (client, interaction) => {
        interaction.reply({
            embeds: [{
                title: "🏓 Pong 🏓",
                description: `The ping of the client is ${client.ws.ping}`,
                color: "#ff0000"
            }]
        });
    }
}