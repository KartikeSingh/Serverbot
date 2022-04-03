const users = require('../../models/user');

module.exports = {
    data: {
        name: "shop-limit",
        description: "Set limit on number of shop a user can create",
        options: [{
            name: "user",
            type: 6,
            description: "User whom you want to make (or remove) a shop owner",
            required: true
        }, {
            name: "limit",
            type: 4,
            description: "The number of shop this user can create",
            required: true,

        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "🔃 Fetching configs ⚙",
            }]
        });

        const user = interaction.options.getUser("user"),
            limit = parseInt(interaction.options.getInteger("limit"));

        if (limit < 0) return interaction.reply({
            embeds: [{
                title: "❌ Shop Limit can't be less than 0",
                color: "#ff0000"
            }]
        });

        await users.findOneAndUpdate({ guild: interaction.guildId, id: interaction.user.id }, { shopLimit: limit })

        interaction.editReply({
            embeds: [{
                title: `Succesffuly setted shop limit for ${user.username} to ${limit}`,
                color: "#50C878"
            }]
        })
    }
}