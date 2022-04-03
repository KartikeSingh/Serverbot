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
                name: "shop-name",
                description: "ID of the shop you want to remove",
                type: 3,
                required: true
            }]
        }, {
            name: "close",
            type: 1,
            description: "Temporarily close your shop",
            options: [{
                name: "shop-name",
                description: "ID of the shop you want to close",
                type: 3,
                required: true
            }]
        }, {
            name: "open",
            type: 1,
            description: "Open your shop",
            options: [{
                name: "shop-name",
                description: "ID of the shop you want to open",
                type: 3,
                required: true
            }]
        }, {
            name: "edit",
            type: 1,
            description: "Edit your shop",
            options: [{
                name: "shop-name",
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
                name: "shop-name",
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
                name: "reply",
                description: "The message I should send to the owner, when this item is used (don't works for role/lootboxes)",
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
                description: "Lootbox limits, min-max example: 5-10",
                type: 3,
                required: false
            }]
        }, {
            name: "edit-item",
            type: 1,
            description: "Edit a item of your shop",
            options: [{
                name: "item-name",
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
                name: "reply",
                description: "The message I should send to the owner, when this item is used (don't works for role/lootboxes)",
                type: 3,
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
                description: "Lootbox limits, min-max example: 5-10",
                type: 3,
                required: false
            }]
        }, {
            name: "remove-item",
            type: 1,
            description: "Remove a item form your shop",
            options: [{
                name: "item-name",
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
            id = interaction.options.getString("shop-name")?.replace(/\$/g, "\$"),
            name = interaction.options.getString("name")?.replace(/\$/g, "\$"),
            itemName = interaction.options.getString("item-name")?.replace(/\$/g, "\$"),
            r = new RegExp(`^${id?.toLowerCase()}$`, "i"),
            r2 = new RegExp(`^${name?.toLowerCase()}$`, "i"),
            r3 = new RegExp(`^${itemName?.toLowerCase()}$`, "i"),
            item = await items.findOne({
                $or: [
                    { name: { $regex: r2 } },
                    { name: { $regex: r3 } },
                ]
            }) || {},
            shop = await shops.findOne({ $or: [{ name: { $regex: r } }, { id: item?.shop }, { name: { $regex: r2 } }] }) || {},
            guild = await guilds.findOne({ id: interaction.guildId }) || {},
            price = interaction.options.getInteger("price"),
            pieces = interaction.options.getInteger("pieces") || 100,
            userLimit = interaction.options.getInteger("user-limit") || 100,
            role = interaction.options.getRole("role")?.id || "0",
            lootbox = interaction.options.getString("lootbox"),
            reply = interaction.options.getString("reply"),
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
            if (shop?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ A shop with same name already exist"
                }]
            });

            const s = await shops.find({ owner: interaction.user.id, guild: interaction.guild.id });
            const user = await users.findOne({ id: interaction.user.id, guild: interaction.guild.id });

            if ((s.length || 0) >= (typeof user?.shopLimit === "number" ? user?.shopLimit : 2)) return interaction.editReply({
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
            if (!shop?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Shop not found"
                }]
            });

            const items_ = await items.find({ shop: shop.id });

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
                        value: `${shop.id}`,
                        inline: true
                    }]
                }]
            });

            items_.forEach(async v => {
                await items.findOneAndDelete({ id: v.id });
            })

            await shops.findOneAndDelete({ name: { $regex: r } });
        } else if (option === "close") {
            if (!shop?.id) return interaction.editReply({
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

            await shops.findOneAndUpdate({ name: { $regex: r } }, { closed: true });
        } else if (option === "open") {
            if (!shop?.id) return interaction.editReply({
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

            await shops.findOneAndUpdate({ name: { $regex: r } }, { closed: false });
        } else if (option === "edit") {

            if (!shop?.id) return interaction.editReply({
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
                        value: description.slice(0, 256) + (description.length > 256 ? "..." : "") || "No Description",
                        inline: true
                    }],
                    image: {
                        url: image
                    }
                }]
            });

            await shops.findOneAndUpdate({ name: { $regex: r } }, { name, image, description });
        } else if (option === "add-item") {
            if (!shop?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Invalid Shop ID was provided"
                }]
            });

            if (item?.id) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ An Item already exist with the name " + item?.name
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

            if (role !== "0" && lootbox) {
                var v = await fixIt(client, interaction, "yes-no", interaction.user, null, "A item can't be both role & a lootbox ticket,\nReact with ✔ to make it a **lootbox**\nReact with ❌ to make it a **role**")

                if (v === true) role = "0"
                else if (v === false) lootbox = "0"
            }

            if (v === undefined && role !== "0" && lootbox !== "0") return;

            let lv = lootbox?.split("-")?.map(v => parseInt(v));

            if (lootbox && lootbox !== "0" && lv?.length !== 2 && lv?.every(v => typeof (v) === "number") && (parseInt(lootbox?.split("-")[0]) > lootbox?.split("-")[1])) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Lootbox Limits",
                    description: "Lootbox limits should be like min-max example: 5-10"
                }]
            })

            if (!large_description) large_description = small_description;

            item = await items.create({
                id: createID(12, ["letter", "number"]),
                name,
                shop: shop.id,
                price,
                pieces,
                userLimit,
                role,
                image,
                lootbox,
                reply,
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
                        value: item.role !== "0" ? `<@&${item.role}>` : item.lootbox ? `Lootbox Limits ( min - max )` : "\u200b",
                        name: item.role !== "0" ? `Role` : item.lootbox ? `( ${item.lootbox?.split("-")[0]} - ${item.lootbox?.split("-")[1]} )` : "\u200b",
                        inline: true
                    }]
                }]
            });
        } else if (option === "edit-item") {
            if (!item?.id) return interaction.editReply({
                embeds: [{
                    title: "❌ Invalid Item was provided",
                    color: "#ff00000"
                }]
            });

            price = price || item.price;
            reply = reply || item.reply;
            name = name || item.name;
            pieces = pieces || item.pieces;
            userLimit = userLimit || item.userLimit;
            role = role || item.role;
            lootbox = lootbox || item.lootbox;
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
            if (role !== "0" && lootbox !== "0") {
                var v = await fixIt(client, interaction, "yes-no", interaction.user, null, "A item can't be both role & a lootbox ticket,\nReact with ✔ to make it a **lootbox**\nReact with ❌ to make it a **role**")

                if (v === true) role = "0"
                else if (v === false) lootbox = "0"
            }

            if (v === undefined && role !== "0" && lootbox) return;

            let lv = lootbox?.split("-")?.map(v => parseInt(v));

            if (lootbox !== "0" && lv?.length !== 2 && lv?.every(v => typeof (v) === "number") && (parseInt(lootbox?.split(" - ")[0]) > lootbox?.split(" - ")[1])) return interaction.editReply({
                embeds: [{
                    color: "RED",
                    title: "❌ Invalid Lootbox Limits",
                    description: "Lootbox limits should be like min-max example: 5-10"
                }]
            })

            if (lootbox === "0") lootbox = null;

            item = await items.findOneAndUpdate(
                { id: item.id }, {
                name,
                shop: shop.id,
                price,
                pieces,
                userLimit,
                role,
                reply,
                image,
                lootbox,
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
                        value: item.role !== "0" ? `<@&${item.role}>` : item.lootbox ? `Lootbox Limits ( min - max )` : "\u200b",
                        name: item.role !== "0" ? `Role` : item.lootbox ? `( ${item.lootbox?.split("-")[0]} - ${item.lootbox?.split("-")[1]} )` : "\u200b",
                    }]
                }]
            });
        } else if (option === "remove-item") {
            if (!item?.id) return interaction.editReply({
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

            await items.findOneAndDelete({ name: itemName });
        }
    }
}