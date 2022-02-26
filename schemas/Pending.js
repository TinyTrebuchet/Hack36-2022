const mongoose = require('mongoose')

const pendingCourseSchema = new mongoose.Schema({
    student: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },

    course: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },

    daysAttended: {
        type: Number,
        default: 0,
    },
})

module.exports = mongoose.model("Pending_Course", pendingCourseSchema)