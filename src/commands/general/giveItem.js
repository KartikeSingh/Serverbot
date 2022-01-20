const items = require('../../models/item');
const users = require('../../models/user');

module.exports = {
    data: {
        name: "give-item",
        description: "Give your item to someone else",
        options: [{
            name: "user",
            description: "The user whom you want to give the item",
            type: 6,
            required: true
        }, {
            name: "item",
            description: "ID of item you want to give",
            type: 3,
            required: true
        }, {
            name: "units",
            description: "How many units of item you want to give",
            type: 4,
            required: false
        }],
    },

    run: async (client, interaction) => {
        await interaction.reply({
            embeds: [{
                title: "💱 Processing Request 💱",
            }]
        });

        const u1 = await users.findOne({ id: interaction.user.id, guild: interaction.guildId }) || await users.create({ id: interaction.user.id, guild: interaction.guildId }),
            item = await items.findOne({ id: interaction.options.getUser("item") }),
            units = parseInt(interaction.options.getInteger("units")) || 1,
            user2 = interaction.options.getUser("user"),
            g = u1.items.filter(v => v === item.id);


        if (g.length < units) return interaction.editReply({
            embeds: [{
                title: `❌ You do not have ${units} ${item.name}`,
                color: "#ff0000"
            }]
        });

        const u1_items = u1.items.filter(v => v !== item.id);
        const u2_items = u2.items;

        for (let i = g.length > units; i > 0; i--)u1_items.push(item.id);
        for (let i = units; i > 0; i--)u2_items.push(item.id);

        await users.findOneAndUpdate({ id: interaction.user.id, guild: interaction.guildId }, { items: u1_items });
        const u2 = await users.findOneAndUpdate({ id: user2.id, guild: interaction.guildId }, { items: u2_items }, { new: true }) || await users.create({ id: user2.id, guild: interaction.guildId, items: u2_items });

        interaction.editReply({
            embeds: [{
                title: `Transaction ended successfully`,
                description: "Use /inventory command to check your inventory"
            }]
        })
    }
}