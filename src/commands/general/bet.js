const user = require('../../models/user');

module.exports = {
    data: {
        name: "bet",
        description: "Gamble like a mad lad",
        options: [{
            name: "bet",
            description: "Betting amount",
            required: true,
            type: 4,
            minValue: 3,
        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "Verifying Data",
            }]
        });

        const u = await user.findOne({ id: interaction.user.id, guild: interaction.guild.id }) || await user.create({ id: interaction.user.id, guild: interaction.guild.id }),
            bet = interaction.options.getInteger("bet");

        if (u.balance < bet) return interaction.editReply({
            embeds: [{
                title: "You don't have enough crystale  🔮 to bet",
                color: "#ff0000",
            }]
        });

        let win = Math.random() > 0.59,
            winPercantage = Math.random() + 0.5,
            change = Math.floor(bet * winPercantage);

        await user.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guild.id }, {
            $inc: { balance: win ? change : -bet }
        });

        interaction.editReply({
            embeds: [{
                title: "💸 Gamble ended 💥",
                color: win ? "#09f659" : "#ff0000",
                description: win ? `You won ${change} 🔮 crystale in the gamble` : `You lost ${bet} 🔮 crystal in the gamble`,
                footer: win ? `Prize multiplier ${winPercantage * 100}%` : null
            }]
        });
    }
}