const { MessageCollector, InteractionCollector, MessageActionRow } = require('discord.js');

module.exports = (client, interaction, thing, user, type, message) => {
    return new Promise(async (res) => {
        if (thing === "yes-no") {
            const msg = await interaction.followUp({
                embeds: [{
                    description: message
                }],
                components: [new MessageActionRow().addComponents([{
                    emoji: "✔",
                    type: "BUTTON",
                    customId: "accept",
                    style: "SUCCESS",
                    label: "Accept"
                }, {
                    emoji: "❌",
                    type: "BUTTON",
                    customId: "reject",
                    style: "DANGER",
                    label: "Reject"
                }])]
            });

            const col = new InteractionCollector(client, { message: msg, time: 60000, max: 1, filter: (i) => i.user.id === user.id })

            col.on('collect', (i) => {
                col.stop(i.customId);
            })

            col.on('end', (s, r) => {
                msg.delete().catch(e => { });

                if (r === "time") {
                    msg.reply({
                        embeds: [{
                            color: "#ff0000",
                            title: "❌ You took way too much time to react, command ended!"
                        }],
                        content: `${user.toString()}`
                    });

                    res(undefined);
                } else {
                    res(r === "accept");
                }
            })
        } else {
            const msg = await interaction.followUp({
                embeds: [{
                    description: `Please provide the value of ${thing} **again**, in the **chat**`
                }],
            });

            const col = new MessageCollector(interaction.channel, {
                filter: (m) => m.author.id === user.id,
                time: 60000
            });

            col.on('collect', (m) => {
                if (typeof (parseInt(m.content)) !== type && typeof (m.content) !== type) return msg.reply(`Invalid value, it should be of ${type} type`)

                msg.delete().catch(e => { })
                col.stop(m.content)
            });

            col.on('end', (s, r) => {
                msg.reply({
                    embeds: [{
                        color: "#ff0000",
                        title: "❌ You took way too much time to respond properly, command ended!"
                    }],
                    content: `${user.toString()}`
                });

                r === "time" ? res(undefined) : res(r);
            })
        }
    })
}