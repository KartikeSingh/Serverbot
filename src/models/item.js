const { Schema, model } = require('mongoose');

const itemSchema = new Schema({
    id: String,
    name: String,
    shop: String,
    image: String,
    price: Number,
    pieces: Number,
    userLimit: Number,
    role: String,
    lootbox: {
        is: {
            type: Boolean,
            default: false
        },
        min: Number,
        max: Number,
    },
    description: {
        small: String,
        large: String,
    }
})

module.exports = model("Item_Config_economy", itemSchema);