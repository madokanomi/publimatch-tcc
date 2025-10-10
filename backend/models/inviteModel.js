// Dentro de models/Invite.js

import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    
    // ✅ MUDANÇA PRINCIPAL AQUI:
    // Agora o convite está diretamente ligado ao perfil do influenciador.
    influencer: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer', required: true },
    
    adAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    }
}, { timestamps: true });

const Invite = mongoose.model('Invite', inviteSchema);
export default Invite;