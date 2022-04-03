const users = require('../../models/user');
const items = require('../../models/item');
const shops = require('../../models/shop');
const fixIt = require('../../utility/fixIt');

module.exports = {
    data: {
        name: "item",
        description: "Get information about a item",
        options: [{
            name: "info",
            description: "Get information of a item",
            type: 1,
            options: [{
                name: "item-name",
                description: "ID of the item you want to know about",
                type: 3,
                required: true
            }]
        }, {
            name: "buy",
            description: "Buy a item",
            type: 1,
            options: [{
                name: "item-name",
                description: "ID of the item you want to buy",
                type: 3,
                required: true
            }, {
                name: "units",
                description: "number of time you want to buy",
                type: 4,
                minValue: 1,
                required: true
            }]
        }, {
            name: "sell",
            description: "Sell a item",
            type: 1,
            options: [{
                name: "item-name",
                description: "ID of the item you want to sell",
                type: 3,
                required: true
            }, {
                name: "units",
                description: "number of time you want to sell",
                type: 4,
                minValue: 1,
                required: true
            }]
        }, {
            name: "use",
            description: "Use a item",
            type: 1,
            options: [{
                name: "item-name",
                description: "Name of the item you want to use",
                type: 3,
                required: true
            }]
        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "🔃 Fetching details",
            }]
        });

        let name = interaction.options.getString("item-name"),
            r = new RegExp(`^${name?.toLowerCase()}$`, "i"),
            item = await items.findOne({ name: { $regex: r } }) || {},
            user = await users.findOne({ id: interaction.user.id, guild: interaction.guildId }) || await users.create({ id: interaction.user.id, guild: interaction.guildId }),
            shop = await shops.findOne({ id: item.shop }) || {},
            option = interaction.options.getSubcommand(),
            units = interaction.options.getInteger("units");

        if (option === "info") {
            if (!item) return interaction.editReply({
                embeds: [{
                    title: "❌ Item Not Found",
                    color: "#ff0000"
                }]
            });

            interaction.editReply({
                embeds: [{
                    title: `${item.name}'s details`,
                    description: `${item.description.large}`,
                    image: {
                        url: item.image
                    },
                    fields: [{
                        name: "Shop",
                        value: shop.name,
                        inline: true
                    }, {
                        name: "Item Name",
                        value: item.name,
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
                        name: "Units a user can hold",
                        value: item.userLimit + ".",
                        inline: true
                    }, {
                        value: item.role !== "0" ? `<@&${item.role}>` : item.lootbox ? `Lootbox Limits ( min - max )` : "\u200b",
                        name: item.role !== "0" ? `Role` : item.lootbox ? `( ${item.lootbox?.split("-")[0]} - ${item.lootbox?.split("-")[1]} )` : "\u200b",
                        inline: true
                    }]
                }]
            })
        } else if (option === "buy") {
            if (!item) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Item do not exist"
                }]
            });

            if (shop.closed) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "Shop is closed right now"
                }]
            });

            if (item.pieces - units < 0) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "Shop do not have enough unit of this item",
                    description: `Remaining units: \`${item.pieces}\``
                }]
            });

            if (user.items.filter(v => v === item.id).length + units >= item.userLimit) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "You can't buy more ( or this much ) units of this item",
                    description: `Number of units allowed to hold: \`${item.userLimit}\``
                }]
            });

            if (item.price * units > user.balance) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "You do not have enough crystals 🔮 to buy this item",
                    description: `crystals 🔮 needed to buy \`${units}\` units of \`${item.name}\` are \`${item.price * units}\` 🔮 but you have \`${user.balance}\` 🔮`
                }]
            });

            interaction.editReply({
                embeds: [{
                    color: "#50C878",
                    title: "Purchase successfull",
                    fields: [{
                        name: "crystals 🔮 spent",
                        value: `${item.price * units} 🔮`
                    }, {
                        name: "Item purchased",
                        value: item.name
                    }, {
                        name: "Units purchased",
                        value: units + "."
                    }]
                }]
            })

            await users.findOneAndUpdate({ id: user.id, guild: interaction.guild.id }, { $inc: { balance: -item.price * units }, $push: { items: { $each: new Array(units).fill(item.id) } } }, { new: true });
            await items.findOneAndUpdate({ id: item.id }, { $inc: { pieces: -units } })
        } else if (option === "sell") {
            if (!item) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Item do not exist"
                }]
            });

            const av = user.items.filter(v => v === item.id);

            if (av.length < units) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: `❌ You do not have ${units} unit of this item, you just have ${av}`
                }]
            });

            const sp = Math.floor(units * (item.price * 0.66));

            const sell = await fixIt(client, interaction, "yes-no", interaction.user, null, `Do you want to sell ${units} ${item.name} for ${sp}\nReact with ✔ to **sell** the items\nReact with ❌ to cancel`);

            if (sell === true) {
                interaction.editReply({
                    embeds: [{
                        color: "#50C878",
                        title: `✅ Item sold for ${sp} successfully`
                    }]
                });

                const newItems = user.items.filter(v => v !== item.id);
                for (let i = av.length - units; i > 0; i--)newItems.push(item.id);

                await users.findOneAndUpdate({ id: user.id, guild: interaction.guild.id }, { $inc: { balance: sp }, items: newItems })
            } else if (sell === false) {
                interaction.editReply({
                    embeds: [{
                        color: "#50C878",
                        title: "✅ Command cancelled successfully"
                    }]
                })
            }
        } else if (option === "use") {
            if (!item) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ Item do not exist"
                }]
            });

            if (user.items.filter(v => v === item.id).length < 1) return interaction.editReply({
                embeds: [{
                    color: "#ff0000",
                    title: "❌ You do not have this item"
                }]
            });

            if (item.reply !== "-no") {
                client.users.cache.get(client.owners[0]).send({
                    embeds: [{
                        title: "🎰 Item Used",
                        description: item.reply,
                        color: "RANDOM",
                        fields: [{
                            name: "User",
                            value: `${interaction.user.username} ||(${interaction.user.id})||`,
                            inline: true
                        }, {
                            name: "Item",
                            value: `${item.name} ||(${item.id})||`,
                            inline: true
                        }]
                    }]
                })

                return interaction.editReply({
                    embeds: [{
                        color: "#ff0000",
                        title: "✅ Item used successfully",
                        description: "🦅 Response is sent to the owner!"
                    }]
                });
            }

            const r = interaction.guild.roles.cache.get(item.role);
            const newItems = user.items.filter(v => v !== item.id);

            for (let i = user.items.filter(v => v === item.id).length - 1; i > 0; i--)newItems.push(item.id);

            if (item.role !== "0") {
                if (!r) return interaction.editReply({
                    embeds: [{
                        color: "#ff0000",
                        title: "❌ Role no more exist"
                    }]
                });

                if (r.position >= interaction.guild.me.roles.highest.position) return interaction.editReply({
                    embeds: [{
                        color: "#ff0000",
                        title: "❌ This role is above my highest role, So I can't give it to you, Please contact admins"
                    }]
                });

                interaction.member.roles.add(r);

                interaction.editReply({
                    embeds: [{
                        color: "#50C878",
                        title: "Item used successfully",
                        description: `I gave you ${r.toString()} role`
                    }]
                });

                await users.findOneAndUpdate({ id: user.id, guild: interaction.guild.id }, { items: newItems });
            } else {
                const v = item.lootbox?.split("-").map(v => parseInt(v)) || [], min = v[0], max = v[1],
                    amount = Math.floor(Math.random() * (max - min) + min);

                interaction.editReply({
                    embeds: [{
                        color: "#50C878",
                        title: "🎁 Lootbox Opened",
                        description: `Congrats you got **${amount}** 🔮`
                    }]
                });
            }
        }
    }
}
