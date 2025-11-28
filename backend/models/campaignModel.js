import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: Object, required: true },
    privacy: { type: String, enum: ['Pública', 'Privada'], default: 'Pública' },
    logo: { type: String},
    categories: [{ type: String }],
    minFollowers: { type: Number, default: 0 },
    minViews: { type: Number, default: 0 },
    requiredSocials: [{ type: String }],
    brandName: { type: String },
    paymentType: {
        type: String,
        required: true,
        enum: ['Indefinido', 'Aberto', 'Exato'],
        default: 'Indefinido'
    },
    paymentValueExact: { type: Number, default: 0 },
    paymentValueMin: { type: Number, default: 0 },
    paymentValueMax: { type: Number, default: 0 },
    vagas: { 
        type: Number, required: [true, 'A quantidade de vagas é obrigatória'], min: [1, 'Deve haver pelo menos 1 vaga'] },
    startDate: { type: Date },
    endDate: { type: Date },
    views: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    conversion: { type: String, default: "0%" },
    influencers: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Planejamento', 'Ativa', 'Concluída', 'Cancelada', 'Aberta'],
        default: 'Aberta'
    },
    state: {
        type: String,
        enum: ['Open', 'Hidden'],
        default: 'Open'
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participatingInfluencers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' }]
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;