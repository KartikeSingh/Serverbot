const user = require('../../models/user');
const ms = require('ms-prettify');

module.exports = {
    data: {
        name: "daily",
        description: "Get your daily reward",
        options: [],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "Verifying Data",
            }]
        });

        const u = await user.findOne({ id: interaction.user.id, guild: interaction.guild.id }) || await user.create({ id: interaction.user.id, guild: interaction.guild.id });

        if (u.lastDaily + 24000 * 3600 > Date.now()) return interaction.editReply({
            embeds: [{
                title: "You already claimed your daily bonus",
                color: "#ff0000",
                description: `You have to wait for **${ms.default(u.lastDaily + 24000 * 3600 - Date.now(), { till: "second" })}**`
            }]
        });

        let streak = u.lastDaily + (24000 * 3600 * 1.5) < Date.now() ? 0 : u.dailyStreak + 1.
        extra = streak <= 10 ? streak * 5 : 50 + (streak - 10) * 3;

        await user.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guild.id }, {
            streak: streak,
            $inc: { balance: extra + 50 },
            lastDaily: Date.now()
        });

        interaction.editReply({
            embeds: [{
                title: "🎉 Daily bonus claimed successfully 🎉",
                color: "#1f73e0",
                description: `You got ${50}🔮 ${extra > 0 ? `and extra ${extra}🔮 for ${streak} days streak` : ``}`
            }]
        });
    }
}