module.exports = {
    data: {
        name: "help",
        description: "Get some help",
        options: [{
            name: "command",
            description: "Give the command name",
            type: 3,
            required: false
        }, {
            name: "category",
            description: "Give the category name",
            type: 3,
            required: false
        }],
    },

    run: async (client, interaction) => {
        let command = interaction.options.getString("command")?.toLowerCase(),
            category = interaction.options.getString("category")?.toLowerCase();

        if (command && category) return interaction.reply({
            embeds: [{
                title: "Either provide command name or category name",
                color: "#ff0000"
            }]
        });

        if (command) {
            const c = client.commands.get(command);

            if (!c) return interaction.reply({
                embeds: [{
                    title: "Invalid command name was provided",
                    color: "#ff0000"
                }]
            });

            const fields = [{
                name: "Category",
                value: c.category,
                inline: true
            }];

            c.data?.options?.forEach(v => {
                fields.push({
                    name: v.name,
                    value: v.description || "no description",
                    inline: true
                })
            });

            interaction.reply({
                embeds: [{
                    title: `${c.data.name}'s detail`,
                    description: c.data.description,
                    fields,
                    color: "#15d2ea"
                }]
            }).catch(e => console.log(e + ""))
        } else if (category) {
            const commands = client.commands.filter(v => v.category === category);

            if (!commands || commands.size < 1) return interaction.reply({
                embeds: [{
                    title: "Invalid category name was provided",
                    color: "#ff0000"
                }]
            });

            let i = 0;

            interaction.reply({
                embeds: [{
                    title: `Command list of ${category} category`,
                    color: "#f99006",
                    description: commands.map((v) => `\`${++i}.\`**${v.data.name}**`).join("\n"),
                }]
            });
        } else {
            interaction.reply({
                embeds: [{
                    title: `${client.user.username}'s help menu`,
                    description: `Provide commmand name to get information about a command\nProvide category name to get list of commands in that category\n\nFollowing are the categories available in the bot: ${client.categories.join(", ")}`
                }]
            })
        }
    }
}