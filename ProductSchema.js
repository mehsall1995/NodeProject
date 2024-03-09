const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    category: String,
    subCategory: String,
    productCode: String,
    name: String,
    price: Number,
    isActive: Boolean,
    description: String,
    createdAt: Date,
    updatedAt: Date,
})

module.exports = mongoose.model("products", productSchema)