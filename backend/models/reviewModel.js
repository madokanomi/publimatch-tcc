// backend/models/reviewModel.js

import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
    {
        // Nota da avaliação (de 1 a 5)
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        // Título da avaliação
        title: {
            type: String,
            required: [true, 'O título é obrigatório.'],
            trim: true,
        },
        // Comentário/descrição detalhada
        comment: {
            type: String,
            trim: true,
        },
        // Tags associadas à avaliação
        tags: [{
            type: String,
            trim: true,
        }],
        // ID do influenciador que está sendo avaliado.
        // Refere-se ao seu 'influencerModel'.
        influencer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Influencer', 
        },
        // ID da campanha na qual a avaliação foi feita.
        // Refere-se ao seu 'campaignModel'.
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Campaign',
        },
        // ID do usuário (AD_AGENT) que fez a avaliação.
        // Refere-se ao seu 'userModel'.
        evaluator: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true, // Adiciona os campos createdAt e updatedAt
    }
);

// Índice único: Garante que um AD_AGENT não possa avaliar o mesmo influenciador
// mais de uma vez dentro da mesma campanha.
reviewSchema.index({ campaign: 1, influencer: 1, evaluator: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;