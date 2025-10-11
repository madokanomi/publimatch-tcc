// CORREÇÃO 1: Usando a sintaxe de Módulos ES (import/export)
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    // CORREÇÃO 2: Adicionando o campo 'link' que é essencial para o frontend
    link: { type: String }, 
    
    type: {
        type: String,
        enum: ['CAMPAIGN_INVITE', 'CONTRACT_ACCEPTED', 'NEW_MESSAGE'],
        required: true
    },
      campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign', // A referência para o seu model de campanha
        required: false // Pode não ser obrigatório para todos os tipos de notificação
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invite' // <-- ✅ ADICIONE ESTA LINHA CRÍTICA
    },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;