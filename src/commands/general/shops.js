const shops = require('../../models/shop');

module.exports = {
    data: {
        name: "shops",
        description: "Get the list of available shops",
        options: [{
            name: "list",
            description: "Get a list of available shops",
            type: 1,
            options: [{
                name: "shop-state",
                description: "Whether the shop should be open or close or any",
                type: 3,
                required: false,
                choices: [{
                    name: "Open Shops",
                    value: "open"
                }, {
                    name: "Closed Shops",
                    value: "close"
                }, {
                    name: "All Shops",
                    value: "all"
                }]
            }]
        }, {
            name: "info",
            description: "Get information of a shop",
            type: 1,
            options: [{
                name: "shop-id",
                description: "ID of the shop you want to check",
                type: 3,
                required: true
            }]
        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "🔃 Loading Shops",
                color: "#ff0000"
            }]
        });

        const show = interaction.options.getString("shop-state"),
            id = interaction.options.getString("shop-id"),
            shop = await shops.findOne({ id }),
            option = interaction.options.getSubcommand();

        if (option === "list") {
            const list = await shops.find({ guild: interaction.guildId }),
                open = list.filter(v => !v.closed),
                close = list.filter(v => v.closed),
                string =
                    show === "open" ? open.map(v => `\`${v.id}\` - **${v.name}**`).join("\n") :
                        show === "close" ? close.map(v => `\`${v.id}\` - **${v.name}**`).join("\n") :
                            "Open Shops\n" + open.map(v => `\`${v.id}\` - **${v.name}**`).join("\n") + "\n\nClosed Shops" + close.map(v => `\`${v.id}\` - **${v.name}**`).join("\n");

            interaction.editReply({
                embeds: [{
                    title: `List of ${show || "all"} shops`,
                    description: `ID - Name\n\n${string}`
                }]
            });
        } else if (option === "info") {
            interaction.editReply({
                embeds: [{
                    title: `${shop.name}'s Details`,
                    description: shop.description,
                    fields: [{
                        name: "Shop ID",
                        value: shop.id,
                        inline: true
                    }, {
                        name: "Shop Owner",
                        value: `<@${shop.owner}>`,
                        inline: true
                    }, {
                        name: "Shop State",
                        value: `Shop is ${shop.closed ? "closed" : "opened"}`,
                        inline: true
                    }],
                    image: {
                        url: shop.image
                    },
                    footer: {
                        text: "use /items to check items of a shop"
                    }
                }]
            })
        }
    }
}