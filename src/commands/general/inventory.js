const users = require('../../models/user');
const items = require('../../models/item');
const pagi = require('../../utility/page');

module.exports = {
    data: {
        name: "inventory",
        description: "Check your / some else's inventory",
        options: [{
            name: "user",
            type: 6,
            description: "User who's inventory you wanna check",
            required: false
        }, {
            name: "page",
            type: 4,
            description: "Number of page you want to visit",
            required: false
        }]
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "🔃 Fetching Data 📄",
            }]
        });

        const user = await users.findOne({ guild: interaction.guildId, id: interaction.options.getUser("user")?.id || interaction.user.id });
        const page = interaction.options.getInteger("page") || 0;
        const pages = [], u_items = {}

        if (user.items.length < 1) return interaction.editReply({
            embeds: [{
                title: `Your inventory is empty ☹`,
                color: "#ff0000"
            }]
        });

        user.items.forEach(v => u_items[v] ? u_items[v]++ : u_items[v] = 1);

        const e = await stuff(u_items);

        for (let i = e.length - 1; i >= 0; i--) {
            let index = parseInt(i / 10), thing = e[i];

            pages[index] ? pages[index].description += `\n${e[i]}` : pages[index] = {
                title: `Inventory of ${interaction.user.username}`,
                footer: {
                    text: `Page number ${i + 1}`
                },
                description: `Item  : Units\n\n${thing}`
            }
        }

        pagi(interaction, pages, page)

    }
}

function stuff(u_items) {
    return new Promise(res => {
        const e = [];
        let l = 0;

        Object.entries(u_items).forEach(async (v, p) => {
            const item = await items.findOne({ id: v[0] });

            if (item) e.push(`**${item?.name}** (${item?.id}) : \`${v[1]}\``);
            if (!item) l++;
            if (e.length + l === Object.keys(u_items).length) res(e)
        });
    })
}