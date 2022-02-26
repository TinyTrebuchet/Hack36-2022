const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },

    name: String,

    credit: {
        type: Number,
        required: true,
    },

    // time in minutes of a day
    // dayNumber: Sunday = 0, ...
    time: [{
        dayNumber: Number,
        startTime: Number,
        endTime: Number,
    }],
})

module.exports = mongoose.model("Course", courseSchema)