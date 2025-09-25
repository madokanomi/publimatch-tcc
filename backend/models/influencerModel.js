const mongoose = require('mongoose');

const influencerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    instagramHandle: { type: String, unique: true, sparse: true }, // sparse permite valores nulos, mas únicos se existirem
    tiktokHandle: { type: String, unique: true, sparse: true },
    followersCount: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    niches: [{ type: String }],
    contactEmail: { type: String },
    // Link para o usuário se o influenciador tiver um login
    userAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
    // Link para o agente do influenciador
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Influencer = mongoose.model('Influencer', influencerSchema);
module.exports = Influencer;