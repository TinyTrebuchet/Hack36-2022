const mongoose = require('mongoose')

const completedCourseSchema = new mongoose.Schema({
    student: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },

    course: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },

    grade: {
        type: String,
        required: true,
    },

    semester: {
        type: Number,
        required: true,
    },
})

module.exports = mongoose.model("Completed_Course", completedCourseSchema)