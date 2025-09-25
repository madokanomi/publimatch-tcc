// backend/models/campaignModel.js

const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    // --- Campos do seu formulário ---
    title: { type: String, required: true },
    description: { type: String, required: true },
    privacy: { type: String, enum: ['Pública', 'Privada'], default: 'Pública' },
    imageUrl: { type: String },
    categories: [{ type: String }],
    minFollowers: { type: String },
    minViews: { type: String },
    requiredSocials: [{ type: String }],
    
    // 👇 --- CAMPOS AJUSTADOS E ADICIONADOS --- 👇
    brandName: { type: String },
    // 👇 E ADICIONE ESTAS DUAS LINHAS:
paymentType: {
    type: String,
    required: true,
    enum: ['Indefinido', 'Aberto', 'Exato'], // Nossas 3 novas opções
    default: 'Indefinido'
},
// Usado para o tipo 'Exato'
paymentValueExact: {
    type: Number,
    default: 0
},
// Usados para o tipo 'Aberto' (faixa de valor)
paymentValueMin: {
    type: Number,
    default: 0
},
paymentValueMax: {
    type: Number,
    default: 0
},
    startDate: { type: Date },
    endDate: { type: Date },

    // --- Campos de Estatísticas (começarão com 0) ---
    views: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    conversion: { type: String, default: "0%" },
    influencers: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    
    // --- Campos de Controle ---
    status: {
        type: String,
        enum: ['Planejamento', 'Ativa', 'Concluída', 'Cancelada', 'Aberta'],
        default: 'Aberta'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participatingInfluencers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
module.exports = Campaign;