const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    id: String,
    guild: String,
    balance: {
        type: Number,
        default: 0
    },
    items: [String],
    shopLimit: {
        type: Number,
        default: 2
    }
})

module.exports = model("User_Config_economy", userSchema);