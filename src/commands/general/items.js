const shops = require('../../models/shop');
const Items = require('../../models/item');
const paginator = require('../../utility/page');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: {
        name: "items",
        description: "Get items of a shop",
        options: [{
            name: "shop-id",
            description: "ID of the shop you want to know about",
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

        const shop = await shops.findOne({ id: interaction.options.getString("shop-id") }),
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
            pages[parseInt(i / 10)] ? pages[parseInt(i / 10)].description += `\n\n${i + 1}. ${v.name}\nID: \`${v.id}\`\t\tPrice: **${v.price}**\n${v.description.small}\n${v.role !== "0" ? `Role Reward: <@&${v.role}>` : v.lootbox.is ? `LootBox Reward: ${v.lootbox.min} - ${v.lootbox.max} 🔮` : ""}`
                : pages[parseInt(i / 10)] = {
                    title: `${shop.name}'s Items`,
                    footer: {
                        text: `Page Number: ${parseInt(i / 10) + 1}`,
                    },
                    tumbnail: {
                        url: shop.image
                    },
                    description: `${shop.closed ? "**Shop is closed**" : ""}\n\n${i + 1}. ${v.name}\nID: \`${v.id}\`\t\tPrice: **${v.price}**\n${v.description.small}\n${v.role !== "0" ? `Role Reward: <@&${v.role}>` : v.lootbox.is ? `LootBox Reward: ${v.lootbox.min} - ${v.lootbox.max} 🔮` : ""}`
                };

            if (i === items.length - 1) paginator(interaction, pages, page, ["⬅", "➡", "❌"], 300000);
        })
    }
}