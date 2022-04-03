const { Schema, model } = require('mongoose');

const itemSchema = new Schema({
    id: String,
    name: String,
    shop: String,
    reply: String,
    image: String,
    price: Number,
    pieces: Number,
    userLimit: Number,
    role: String,
    lootbox: String,
    response: String,
    description: {
        small: String,
        large: String,
    }
})

module.exports = model("Item_Config_economy_2", itemSchema);