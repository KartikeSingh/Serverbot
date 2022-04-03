module.exports = async (client) => {
    console.log(`${client.user.username} is online`);

    // 920506157850820668

    client.application.commands.set([...client.commands.map(v => v.data)], "732883841395720213");
}