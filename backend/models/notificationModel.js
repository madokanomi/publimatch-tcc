const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['CAMPAIGN_INVITE', 'CONTRACT_ACCEPTED', 'NEW_MESSAGE'], // Adicione outros tipos se precisar
        required: true
    },
    entityId: { // ID do documento relacionado (neste caso, o ID do convite)
        type: mongoose.Schema.Types.ObjectId
    },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);