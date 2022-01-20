const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = async function pagination(interaction, embeds, start = 0, emojis = ["⬅", "➡", "❌"], timeout = 60000) {
    let index = start,
        row = new MessageActionRow().addComponents([
            new MessageButton().setCustomId("1_embed_page").setStyle("PRIMARY").setEmoji(emojis[0]),
            new MessageButton().setCustomId("2_embed_page").setStyle("PRIMARY").setEmoji(emojis[1]),
            new MessageButton().setCustomId("3_embed_page").setStyle("DANGER").setEmoji(emojis[2])
        ]), data = { components: [row], content: typeof (embeds[index]) === "string" ? embeds[index] : null, embeds: typeof (embeds[index]) === "string" ? null : [embeds[index]] };

    try {
        typeof (embeds[index]) === "string" ? data.content = embeds[index] : data.embeds = [embeds[index]];

        const msg = interaction.replied ? await interaction.editReply(data) : await interaction.reply(data, { fetchReply: true });

        const collector = msg.createMessageComponentCollector({ time: timeout, interaction: msg, filter: (i) => i.user.id === interaction?.user?.id })

        collector.on('collect', async (i) => {
            if (i.customId[0] === "1") index--;
            else if (i.customId[0] === "2") index++;
            else {
                collector.stop("goodEnd");
                data = { components: [], content: typeof (embeds[index]) === "string" ? embeds[index] : null, embeds: typeof (embeds[index]) === "string" ? null : [embeds[index]] };
                return i.update(data);
            }

            index = index < 0 ? embeds.length - 1 : index >= embeds.length ? index = 0 : index;
            data = { content: typeof (embeds[index]) === "string" ? embeds[index] : null, embeds: typeof (embeds[index]) === "string" ? null : [embeds[index]] };

            i.update(data);
        });
    } catch (e) {
        console.log(e)
        // throw new Error("I was unable to send/edit embed either the client do not have permission to send interaction or Invalid embed was provided");
    }
}