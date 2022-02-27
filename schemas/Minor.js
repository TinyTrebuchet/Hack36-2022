const mongoose = require('mongoose')

const minorSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    courses: [String],
})

module.exports = mongoose.model("Minor", minorSchema)