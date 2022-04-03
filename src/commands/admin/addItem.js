const users = require('../../models/user');
const items = require('../../models/item');

module.exports = {
    data: {
        name: "add-item",
        description: "Add some item to a user",
        options: [{
            name: "user",
            description: "The user whom you want to give the item",
            type: 6,
            required: true
        }, {
            name: "item-name",
            description: "Name of the item you want to use",
            type: 3,
            required: true
        }],
    },
    permissions: ["ADMINISTRATOR"],

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "💱 Processing Request 💱",
            }]
        });

        const
            name = interaction.options.getString("item-name"),
            r = new RegExp(`^${name?.toLowerCase()}$`, "i"),
            item = await items.findOne({ name: { $regex: r } }),
            user = interaction.options.getUser("user");

        if (!item) return interaction.editReply({
            embeds: [{
                title: "❌ No item found with the provided ID",
                color: "#ff0000"
            }]
        });

        const u1 = await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guildId }, { $push: { items: itemID } }) || await users.create({ id: interaction.user.id, guild: interaction.guildId, items: [itemID] });

        interaction.editReply({
            embeds: [{
                title: `Item added successfully`,
                description: `\`${user.username}\` got a \`${item.name}\` successfully`
            }]
        })
    }
}