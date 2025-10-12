import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    influencer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Influencer', // <-- MUDANÇA PRINCIPAL: Agora referencia o perfil do Influencer
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pendente', 'aprovada', 'rejeitada'],
        default: 'pendente'
    },
}, { timestamps: true });

applicationSchema.index({ campaign: 1, influencer: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;