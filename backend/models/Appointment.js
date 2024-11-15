const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    mobile: {
        type: String,
        unique: true,
        required: true
    },
    pass: {
        type: String
    },
    country: {
        type: String,
        default: "India"
    }
})

module.exports = mongoose.model('Users', AppointmentSchema);