const users = require('../../models/user');

module.exports = {
    data: {
        name: "give-crystal",
        description: "Give your crystals to someone else",
        options: [{
            name: "user",
            description: "The user whom you want to give the crystals",
            type: 6,
            required: true
        }, {
            name: "amount",
            description: "The number of crystals you want to give",
            type: 4,
            required: true
        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "💱 Processing transaction 💱",
            }]
        });

        const u1 = await users.findOne({ id: interaction.user.id, guild: interaction.guildId }) || await users.create({ id: interaction.user.id, guild: interaction.guildId }),
            user2 = interaction.options.getUser("user"),
            amount = parseInt(interaction.options.getInteger("amount"));


        if (!amount < 0 || amount > u1.balance) return interaction.editReply({
            embeds: [{
                title: "❌ Amount should be more than 0 and less than or equal to " + u1.balance,
                color: "#ff0000"
            }]
        });

        await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guildId }, { $inc: { balance: -amount } });
        const u2 = await users.findOneAndUpdate({ id: user2.id, guild: interaction.guildId }, { $inc: { balance: amount } }, { new: true }) || await users.create({ id: user2.id, guild: interaction.guildId, balance: amount });

        interaction.editReply({
            embeds: [{
                title: `Transaction ended successfully`,
                fields: [{
                    name: `${interaction.user.username}'s Balance`,
                    value: `${u1.balance - amount} 🔮`,
                    inline: true
                }, {
                    name: `${user2.username}'s Balance`,
                    value: `${u2.balance} 🔮`,
                    inline: true
                }]
            }]
        })
    }
}