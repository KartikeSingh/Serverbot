const users = require('../../models/user');

module.exports = {
    data: {
        name: "leaderboard",
        description: "Leaderboard of richest people of this server",
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "📄 Fetching Data",
            }]
        });

        const top_users = (await users.find({ guild: interaction.guildId }).limit(10)).sort((a,b) => b.balance - a.balance);

        if (top_users.length < 1) return interaction.editReply({
            embeds: [{
                title: `❌ This server don't have rich peoples`,
                color: "#ff0000"
            }]
        });

        let string = "";

        for (let i = 0; i < top_users.length; i++) {
            const v = top_users[i];

            string += `\`${i + 1}.\` \t \t **${v.balance}** 🔮 \t \t \t ** ${(await client.users.fetch(v.id).catch(e => "unknown"))?.username || "Unknown"}**\n`
        }

        interaction.editReply({
            embeds: [{
                title: `📊 Server Leaderboard`,
                description: string
            }]
        })
    }
}