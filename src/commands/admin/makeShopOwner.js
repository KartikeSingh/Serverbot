const guilds = require('../../models/guild');

module.exports = {
    data: {
        name: "shop-owner",
        description: "Add / Remove a shop owner",
        options: [{
            name: "user",
            type: 6,
            description: "User whom you want to make (or remove) a shop owner",
            required: true
        }, {
            name: "action",
            type: 3,
            description: "You want to make them a shop owner or remove them from that position",
            required: true,
            choices: [{
                name: "Make A Owner",
                value: "owner"
            }, {
                name: "Remove From Ownership",
                value: "notOwner"
            }]
        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "🔃 Fetching configs ⚙",
            }]
        });

        const guild = await guilds.findOne({ id: interaction.guildId }) || await guilds.create({ id: interaction.guildId }),
            user = interaction.options.getUser("user"),
            owner = interaction.options.getString("action") === "owner";

        if (!owner && !guild.shopOwners.includes(user.id)) return interaction.reply({
            embeds: [{
                title: "❌ Mentioned user is not a Shop Owner",
                color: "#ff0000"
            }]
        });

        interaction.editReply({
            embeds: [{
                title: `Succesffuly ${owner ? "added" : "removed"} ${user.username} ${owner ? "as" : "from the position of"} shop owner`,
                color: "#50C878"
            }]
        })

        if (owner) await guilds.findOneAndUpdate({ id: interaction.guildId }, { $push: { shopOwners: user.id } })
        else await guilds.findOneAndUpdate({ id: interaction.guildId }, { $pull: { shopOwners: { $in: [user.id] } } })
    }
}