const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true,
    },
    receiver: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;