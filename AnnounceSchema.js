const mongoose = require('mongoose')

const announceSchema = new mongoose.Schema({
    announceCode: String,
    title: String,
    isActive: Boolean,
    description: String,
    createdAt: String,
    updatedAt: Date,
})

module.exports = mongoose.model("announcements", announceSchema)