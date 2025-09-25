const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign', // Referência ao modelo de Campanha
        required: true
    },
    influencer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referência ao usuário que é o influenciador
        required: true
    },
    // Quem enviou a candidatura: o próprio influenciador ou seu agente
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    status: {
        type: String,
        enum: ['Pendente', 'Aprovado', 'Rejeitado'],
        default: 'Pendente'
    },
    // Você pode adicionar um campo para mensagem de candidatura se quiser
    // message: { type: String } 
}, { timestamps: true });

// Garante que um influenciador não pode se candidatar duas vezes para a mesma campanha
applicationSchema.index({ campaign: 1, influencer: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;