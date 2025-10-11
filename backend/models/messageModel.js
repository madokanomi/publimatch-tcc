import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referência ao seu model de usuário existente
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    // Opcional: para saber se a mensagem foi lida
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }); // timestamps adiciona createdAt e updatedAt

const Message = mongoose.model('Message', messageSchema);

export default Message;