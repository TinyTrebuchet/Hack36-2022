const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
    },

    password: {
        type: String,
        required: true,
    },

    pending: [{
        courseId: String,
        daysAttended: Number,
    }],

    completed: [{
        courseId: String,
        grade: String,
        semester: Number,
    }],
})

module.exports = mongoose.model("Student", studentSchema)