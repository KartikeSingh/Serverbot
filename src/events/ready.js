module.exports = (client) => {
    console.log(`${client.user.username} is online`);
    client.application.commands.set([...client.commands.map(v => v.data)],);
}