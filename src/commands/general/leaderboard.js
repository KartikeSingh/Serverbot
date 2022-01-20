const users = require('../../models/user');

module.exports = {
    data: {
        name: "leaderboard",
        description: "Leaderboard of richest people of this server",
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "🔃 Fetching Data 📄",
            }]
        });

        const top_users = await users.find({ guild: interaction.guildId }).sort({ balance: -1 }).limit(10);

        if (top_users.length < 1) return interaction.editReply({
            embeds: [{
                title: `❌ This server don't have rich peoples`,
                color: "#ff0000"
            }]
        });

        const string = top_users.map((v, i) => {
            return `${i + 1}\t\t${v.balance} 🔮\t\t\t${client.users.cache.get(v.id)?.username || "Unknown"}`
        }).join("\n\n");

        interaction.editReply({
            embeds: [{
                title: `Transaction ended successfully`,
                description: "Rank.\t\tCrystals 🔮\t\tUser\n\n" + string
            }]
        })
    }
}