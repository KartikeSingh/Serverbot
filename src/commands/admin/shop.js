const shops = require('../../models/shop');
const users = require('../../models/user');
const guilds = require('../../models/guild');
const fixIt = require('../../utility/fixIt');
const items = require('../../models/item');
const createID = require('create-random-id').randomID;

module.exports = {
    data: {
        name: "shop",
        description: "Create or manage your shop in the server",
        options: [{
            name: "create",
            type: 1,
            description: "Create a new shop",
            options: [{
                name: "name",
                description: "Name of the shop",
                type: 3,
                required: true
            }, {
                name: "description",
                description: "Description of the shop",
                type: 3,
                required: true
            }, {
                name: "image",
                description: "Direct Link of image of the shop",
                type: 3,
                required: false
            }]
        }, {
            name: "remove",
            type: 1,
            description: "Permanently remove your shop",
            options: [{
                name: "shop-id",
                description: "ID of the shop you want to remove",
                type: 3,
                required: true
            }]
        }, {
            name: "close",
            type: 1,
            description: "Temporarily close your shop",
            options: [{
                name: "shop-id",
                description: "ID of the shop you want to close",
                type: 3,
                required: true
            }]
        }, {
            name: "open",
            type: 1,
            description: "Open your shop",
            options: [{
                name: "shop-id",
                description: "ID of the shop you want to open",
                type: 3,
                required: true
            }]
        }, {
            name: "edit",
            type: 1,
            description: "Edit your shop",
            options: [{
                name: "shop-id",
                description: "ID of the shop you want to open",
                type: 3,
                required: true
            }, {
                name: "name",
                description: "New name for the shop",
                type: 3,
                required: false
            }, {
                name: "description",
                description: "Description of the shop",
                type: 3,
                required: false
            }, {
                name: "image",
                description: "Direct Link of new image of the shop",
                type: 3,
                required: false
            }]
        }, {
            name: "add-item",
            type: 1,
            description: "Add a new item to your shop",
            options: [{
                name: "shop-id",
                description: "ID of the shop in which you want to add the item",
                type: 3,
                required: true
            }, {
                name: "name",
                description: "Name of the item",
                type: 3,
                required: true
            }, {
                name: "price",
                description: "Price of this item",
                type: 4,
                required: true
            }, {
                name: "small-description",
                description: "Small description of the item",
                type: 3,
                required: true
            }, {
                name: "large-description",
                description: "Large description of the item",
                type: 3,
                required: false
            }, {
                name: "image",
                description: "Direct Image link of the item",
                type: 3,
                required: false
            }, {
                name: "pieces",
                description: "How many of these are in stock ( available to sell )",
                type: 4,
                required: false
            }, {
                name: "user-limit",
                description: "How many of this item a person can hold at a time",
                type: 4,
                required: false
            }, {
                name: "role",
                description: "What role to give, if a user uses this item",
                type: 8,
                required: false
            }, {
                name: "lootbox",
                description: "If it is a lootbox, give min & max crystal limit like 10-100",
                type: 3,
                required: false
            }]
        }, {
            name: "edit-item",
            type: 1,
            description: "Edit a item of your shop",
            options: [{
                name: "item-id",
                description: "ID of the item you want to edit",
                type: 3,
                required: true
            }, {
                name: "name",
                description: "new Name of the item",
                type: 3,
                required: false
            }, {
                name: "price",
                description: "New price of this item",
                type: 4,
                required: false
            }, {
                name: "small-description",
                description: "Small description of the item",
                type: 3,
                required: false
            }, {
                name: "large-description",
                description: "Large description of the item",
                type: 3,
                required: false
            }, {
                name: "image",
                description: "Direct Image link of the item",
                type: 3,
                required: false
            }, {
                name: "pieces",
                description: "(new) How many of these are in stock ( available to sell )",
                type: 4,
                required: false
            }, {
                name: "user-limit",
                description: "(new) How many of this item a person can hold at a time",
                type: 4,
                required: false
            }, {
                name: "role",
                description: "What role to give, if a user uses this item, type 0 for no role reward",
                type: 8,
                required: false
            }, {
                name: "lootbox",
                description: "If it is a lootbox, give min & max crystal limit like 10-100, type 0 for no lootbox",
                type: 3,
                required: false
            }]
        }, {
            name: "remove-item",
            type: 1,
            description: "Remove a item form your shop",
            options: [{
                name: "item-id",
                description: "ID of the item you want to edit",
                type: 3,
                required: true
            }]
        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "🔃 Fetching required details 📚"
            }]
        });


        let option = interaction.options.getSubcommand(),
            id = interaction.options.getString("shop-id"),
            itemId = interaction.options.getString("item-id"),
            item = await items.findOne({ id: itemId }) || {},
            shop = await shops.findOne({ id }) || await shops.findOne({ id: item?.shop }) || {},
            name = interaction.options.getString("name"),
            guild = await guilds.findOne({ id: interaction.guildId }) || {},
            price = interaction.options.getInteger("price"),
            pieces = interaction.options.getInteger("pieces") || 100,
            userLimit = interaction.options.getInteger("user-limit") || 100,
            role = interaction.options.getRole("role")?.id || "0",
            lootBox = interaction.options.getString("lootbox") || "0",
            small_description = interaction.options.getString("small-description"),
            large_description = interaction.options.getString("large-description"),
            description = interaction.options.getString("description"),
            image = interaction.options.getString("image");

        if (!guild.marketplaceOwners?.includes(interaction.user.id)
            && !interaction.user.id === interaction.guild.ownerId
            && !guild.shopOwners?.includes(interaction.user.id)
        ) return interaction.editReply({
            embeds: [{
                title: "❌ You do not have permissions to either use this command or access the provided shop",
                color: "#ff0000"
            }]
        });

        if (shop && !guild.marketplaceOwners?.includes(interaction.user.id)
            && !interaction.user.id === interaction.guild.ownerId
            && shop.owner !== interaction.user.id
        ) return interaction.editReply({
            embeds: [{
                title: "❌ You do not have access to the provided shop",
                color: "#ff0000"
            }]
        });

        if (
            shop?.guild
            &&
            shop?.guild !== interaction.guild.id
        ) return interaction.editReply({
            embeds: [{
                title: "❌ This shop / item do not belong to this server",
                color: "#ff0000"
            }]
        });

        if (option === "create") {
            const s = await shops.find({ owner: interaction.user.id });
            const user = await users.findOne({ id: interaction.user.id ,guild:interaction.guild.id});

            if (s.length >= user.shopLimit) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: `You reached max shop limit (${user.shopLimit})`
                }]
            });

            const nShop = await shops.create({ name, guild: interaction.guild.id, id: createID(8, ["letter", "number"]), image, owner: interaction.user.id, description });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully create a new shop 🏪",
                    fields: [{
                        name: "Shop Name",
                        value: name,
                        inline: true
                    }, {
                        name: "Shop ID",
                        value: nShop.id + ".",
                        inline: true
                    }]
                }]
            });

        } else if (option === "remove") {
            if (!shop) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop not found"
                }]
            });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully removed the shop 🏪",
                    fields: [{
                        name: "Shop Name",
                        value: shop.name + "",
                        inline: true
                    }, {
                        name: "Shop ID",
                        value: id,
                        inline: true
                    }]
                }]
            });

            await shops.findOneAndDelete({ id });
        } else if (option === "close") {
            if (!shop) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop not found"
                }]
            });

            if (shop.closed) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop is already closed"
                }]
            });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully close the shop 🏪",
                    fields: [{
                        name: "Shop Name",
                        value: shop.name,
                        inline: true
                    }, {
                        name: "Shop ID",
                        value: id,
                        inline: true
                    }]
                }]
            });

            await shops.findOneAndUpdate({ id }, { closed: true });
        } else if (option === "open") {
            if (!shop) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop not found"
                }]
            });

            if (!shop.closed) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop is already open"
                }]
            });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully opened the shop 🏪",
                    fields: [{
                        name: "Shop Name",
                        value: shop.name,
                        inline: true
                    }, {
                        name: "Shop ID",
                        value: id,
                        inline: true
                    }]
                }]
            });

            await shops.findOneAndUpdate({ id }, { closed: false });
        } else if (option === "edit") {

            if (!shop) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop not found"
                }]
            });

            if (!name && !image && !description) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Either provide a new image or name or description to edit"
                }]
            });

            name = name || shop.name;
            image = image || shop.image;
            description = description || shop.description;
            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully change the name of the shop 🏪",
                    fields: [{
                        name: "Shop's Old Name",
                        value: shop.name + ".",
                        inline: true
                    }, {
                        name: "Shop's New Name",
                        value: name + ".",
                        inline: true
                    }, {
                        name: "Shop ID",
                        value: id + ".",
                        inline: true
                    }, {
                        name: "Shop Description",
                        value: description.slice(0, 256) + description.length > 256 ? "..." : "" || "No Description",
                        inline: true
                    }],
                    image: {
                        url: image
                    }
                }]
            });

            await shops.findOneAndUpdate({ id }, { name, image, description });
        } else if (option === "add-item") {

            if (!shop) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Invalid Shop ID was provided"
                }]
            });


            if (price < 1) price = await fixIt(client, interaction, "price", interaction.user, "number");

            if (price === undefined) return;

            if (price < 1) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Price can't be less than 1"
                }]
            });

            if (pieces < 1) pieces = await fixIt(client, interaction, "pieces", interaction.user, "number");
            if (userLimit < 1) userLimit = await fixIt(client, interaction, "user limit", interaction.user, "number");

            if (pieces === undefined || userLimit === undefined) return;

            if (pieces < 0 || userLimit < 0) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Pieces or userLimit can't be less than 0"
                }]
            });
            if (role !== "0" && lootBox !== "0") {
                var v = await fixIt(client, interaction, "yes-no", interaction.user, null, "A item can't be both role & lootbox,\nReact with ✔ to make it a **lootbox**\nReact with ❌ to make it a **role**")

                if (v === true) role = "0"
                else if (v === false) lootBox = "0"
            }

            if (v === undefined && role !== "0" && lootBox !== "0") return;

            if (!large_description) large_description = small_description;

            const item = await items.create({
                id: createID(12, ["letter", "number"]),
                name,
                shop: shop.id,
                price,
                pieces,
                userLimit,
                role,
                image,
                lootbox: {
                    is: lootBox !== "0",
                    min: parseInt(lootBox.split("-")[0]?.trim()) || 0,
                    max: parseInt(lootBox.split("-")[1]?.trim()) || 0,
                },
                description: {
                    small: small_description,
                    large: large_description
                }
            })

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully created the item",
                    description: `**Small Description**:\n${item.description.small}\n\n**Large Description:**\n${item.description.large}`,
                    thumbnail: {
                        url: image
                    },
                    fields: [{
                        name: "Shop",
                        value: shop.name,
                        inline: true
                    }, {
                        name: "Item Name",
                        value: name,
                        inline: true
                    }, {
                        name: "Item ID",
                        value: item.id,
                        inline: true
                    }, {
                        name: "Item Price",
                        value: item.price + " 🔮",
                        inline: true
                    }, {
                        name: "Item pieces in stock",
                        value: item.pieces + ".",
                        inline: true
                    }, {
                        name: "Item a user can hold",
                        value: item.userLimit + ".",
                        inline: true
                    }, {
                        value: role !== "0" ? `<@&${role}>` : lootBox !== "0" ? `${item.lootbox.min} - ${item.lootbox.max} 🔮` : "\u200b",
                        name: role !== "0" ? `Role` : lootBox !== "0" ? `LootBox Limits` : "\u200b",
                        inline: true
                    }]
                }]
            });
        } else if (option === "edit-item") {
            if (!item) return interaction.editReply({
                embeds: [{
                    title: "❌ Invalid Item was provided",
                    color: "#ff00000"
                }]
            });

            price = price || item.price;
            name = name || item.name;
            pieces = pieces || item.pieces;
            userLimit = userLimit || item.userLimit;
            role = role || item.role;
            lootBox = lootBox || item.lootBox.min + ":" + item.lootBox.max;
            small_description = small_description || item.description?.small;
            large_description = large_description || item.description?.large;
            image = image || item.image;

            if (price < 1) price = await fixIt(client, interaction, "price", interaction.user, "number");

            if (price === undefined) return;

            if (price < 1) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Price can't be less than 1"
                }]
            });

            if (pieces < 1) pieces = await fixIt(client, interaction, "pieces", interaction.user, "number");
            if (userLimit < 1) userLimit = await fixIt(client, interaction, "user limit", interaction.user, "number");

            if (pieces === undefined || userLimit === undefined) return;

            if (pieces < 0 || userLimit < 0) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Pieces or userLimit can't be less than 0"
                }]
            });

            if (role !== "0" && lootBox !== "0") {
                var v = await fixIt(client, interaction, "yes-no", interaction.user, null, "A item can't be both role & lootbox,\nReact with ✔ to make it a **lootbox**\nReact with ❌ to make it a **role**")

                if (v === true) role = "0"
                else if (v === false) lootBox = "0"
            }

            if (v === undefined && role !== "0" && lootBox !== "0") return;

            if (lootBox !== "0" && lootBox.split("-").length !== 2 && !lootBox.split("-").every(v => typeof (parseInt(v)) === "number")) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "Lootbox value was filled in incorrect format",
                    description: "Try again later, correct format => \`minValue-maxValue\`"
                }]
            })

            item = await items.findOneAndUpdate(
                { id: item.id }, {
                name,
                shop: shop.id,
                price,
                pieces,
                userLimit,
                role,
                image,
                lootBox: {
                    is: lootBox !== "0",
                    min: parseInt(lootBox.split("-")[0]?.trim()) || 0,
                    max: parseInt(lootBox.split("-")[1]?.trim()) || 0,
                },
                description: {
                    small: small_description,
                    large: large_description
                }
            }, { new: true })

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Successfully edited the item",
                    description: `**Small Description**:\n${item.description.small}\n\n**Large Description:**\n${item.description.large}`,
                    thumbnail: {
                        url: image
                    },
                    fields: [{
                        name: "Item Name",
                        value: name,
                        inline: true
                    }, {
                        name: "Item ID",
                        value: item.id,
                        inline: true
                    }, {
                        name: "Item Price",
                        value: item.price + " 🔮",
                        inline: true
                    }, {
                        name: "Item pieces in stock",
                        value: item.pieces + ".",
                        inline: true
                    }, {
                        name: "Item a user can hold",
                        value: item.userLimit + ".",
                        inline: true
                    }, {
                        value: role !== "0" ? `<@&${role}>` : lootBox !== "0" ? `${item.lootbox.min} - ${item.lootbox.max} 🔮` : "\u200b",
                        name: role !== "0" ? `Role` : lootBox !== "0" ? `LootBox Limits` : "\u200b",
                        inline: true
                    }]
                }]
            });
        } else if (option === "remove-item") {
            if (!item) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Item not found",
                }]
            });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "✅ Item removed successfully",
                }]
            });

            await items.findOneAndDelete({ id: itemId });
        }
    }
}