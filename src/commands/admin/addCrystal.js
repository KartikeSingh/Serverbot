const users = require('../../models/user');

module.exports = {
    data: {
        name: "add-crystal",
        description: "Add crystals to a user",
        options: [{
            name: "user",
            description: "The user whom you want to give the crystals",
            type: 6,
            required: true
        }, {
            name: "amount",
            description: "The number of crystals you want to add to this user's balance",
            type: 4,
            required: true
        }],
    },
    permissions: ["ADMINISTRATOR"],

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "💱 Processing transaction 💱",
            }]
        });

        const amount = parseInt(interaction.options.getInteger("amount")),
            user = interaction.options.getUser("user");
        let u1 = await users.findOne({ id: user.id, guild: interaction.guildId }) || await users.create({ id: user.id, guild: interaction.guildId });

        if (amount === 0 || amount < -u1.balance) return interaction.editReply({
            embeds: [{
                title: "❌ Amount should not be 0 and It can't be less than " + -u1.balance,
                color: "#ff0000"
            }]
        });

        u1 = await users.findOneAndUpdate({ id: user.id, guild: interaction.guildId }, { $inc: { balance: amount } }, { new: true })

        interaction.editReply({
            embeds: [{
                title: `Transaction ended successfully`,
                fields: [{
                    name: `${user.username}'s Balance`,
                    value: `${u1?.balance} 🔮`,
                    inline: true
                }]
            }]
        })
    }
}