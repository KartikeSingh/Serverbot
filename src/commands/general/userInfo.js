const users = require('../../models/user');
const shops = require('../../models/shop');

module.exports = {
    data: {
        name: "user-info",
        description: "Check someone's information",
        options: [{
            name: "wallet",
            description: "Check someone's wallet, isn't this illegal?",
            type: 1,
            options: [{
                name: 'user',
                type: 6,
                required: false,
                description: "The user who's wallet you wanna check"
            }]
        }, {
            name: "shops",
            description: "Check someone's shops",
            type: 1,
            options: [{
                name: 'user',
                type: 6,
                required: false,
                description: "The user who's shops you wanna check"
            }]
        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "Fetching details"
            }]
        });

        const u = interaction.options.getUser("user") || interaction.user,
            user = await users.findOne({ id: u.id,guild:interaction.guild.id }),
            option = interaction.options.getSubcommand();

        if (option === "wallet") {
            interaction.editReply({
                embeds: [{
                    title: `${u.username}'s wallet`,
                    description: `${user?.balance || 0} 🔮`
                }]
            })
        } else if (option === "shops") {
            const userShops = await shops.find({ owner: u.id }),
                string = userShops.map(v => `\`${v.id}\` - **${v.name}**`).join("\n");

            interaction.editReply({
                embeds: [{
                    title: `${!string || string.length < 2 ? "This user don't have any shops" : `${u.username}'s shops`}`,
                    description: `${!string || string.length < 2 ? "" : `ID  -  Shop Name\n\n${string}`}`,
                    color:!string || string.length < 2 ?"#ff0000":"#50C878"
                }]
            })
        }
    }
}