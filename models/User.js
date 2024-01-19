const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    email: {type: String, requred: true, unique: true},
    password: {type: String, requred: true},
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema)