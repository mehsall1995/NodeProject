const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    lastname: String,
    nationalId: Number,
    gender: String,
    email: String,
    phone: String,
    createdAt: Date,
    updatedAt: Date,
    bestFriend: mongoose.SchemaTypes.ObjectId,
    hobbies: [String],
    evaluationcode: String,
    balance: Number,
    addresses: [
        {title: String,
         latitude: String,
         longitude: String,
         state: String,
         city: String,
         neighbourhood: String,
         address: String,} //complete address
     ],
})



module.exports = mongoose.model("users", userSchema)