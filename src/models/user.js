const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    id: String,
    guild: String,
    items: [String],
    shopLimit: {
        type: Number,
        default: 2
    },
    lastDaily: {
        type: Number,
        default: 0
    },
    dailyStreak: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 50
    }
})

module.exports = model("User_Config_economy_bot", userSchema);