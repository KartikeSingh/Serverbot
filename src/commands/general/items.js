const shops = require('../../models/shop');
const Items = require('../../models/item');
const paginator = require('../../utility/page');

module.exports = {
    data: {
        name: "items",
        description: "Get items of a shop",
        options: [{
            name: "shop-name",
            description: "Name of the shop you want to know about",
            type: 3,
            required: true
        }, {
            name: "page",
            description: "The number of page you want to visit",
            type: 4,
            required: false
        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "🔃 Fetching shop details",
            }]
        });

        const r = new RegExp(`^${interaction.options.getString("shop-name")?.toLowerCase()}$`, "i")
        const shop = await shops.findOne({ name: { $regex: r } }),
            items = await Items.find({ shop: shop.id });

        if (!shop) return interaction.editReply({
            embeds: [{
                title: "❌ Shop Not Found",
                color: "#ff0000"
            }]
        });

        const pages = [];
        const page = interaction.options.getInteger("Page") || 0;

        items.forEach((v, i) => {
            pages[parseInt(i / 10)] ? pages[parseInt(i / 10)].description += `\n\n${i + 1}. ${v.name}\nID: \`${v.id}\`\t\tPrice: **${v.price}**\n${v.description.small}\n${v.role !== "0" ? `Role Reward: <@&${v.role}>` : v.lootbox ? `Lootbox limits : ${v.lootbox}` : ""}`
                : pages[parseInt(i / 10)] = {
                    title: `${shop.name}'s Items`,
                    footer: {
                        text: `Page Number: ${parseInt(i / 10) + 1}`,
                    },
                    tumbnail: {
                        url: shop.image
                    },
                    description: `${shop.closed ? "**Shop is closed**" : ""}\n\n${i + 1}. ${v.name}\nID: \`${v.id}\`\t\tPrice: **${v.price}**\n${v.description.small}\n${v.role !== "0" ? `Role Reward: <@&${v.role}>` : v.lootbox ? `Lootbox limits : ${v.lootbox}` : ""}`
                };

            if (i === items.length - 1) paginator(interaction, pages, page, ["⬅", "➡", "❌"], 300000);
        })
    }
}