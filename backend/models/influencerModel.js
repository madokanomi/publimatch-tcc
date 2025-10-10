import mongoose from "mongoose";

const influencerSchema = new mongoose.Schema({
    // --- CAMPOS QUE JÁ ESTAVAM CORRETOS ---
    name: { type: String, required: true },
    niches: [{ type: String }],
agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },

    // --- CAMPOS ADICIONADOS PARA COMPATIBILIDADE ---
    realName: { type: String, required: true },
    age: { type: Number },
    description: { type: String },
    aboutMe: { type: String },
    
    // --- ESTRUTURA SOCIAL CORRIGIDA PARA ACEITAR UM OBJETO ---
    // Isto é mais escalável do que ter um campo para cada rede social.
    social: {
        tiktok: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
        twitch: { type: String, default: '' },
    },

    profileImageUrl: { type: String, default: '' },
    backgroundImageUrl: { type: String, default: '' },
    
    
    
    // Campos que você pode usar no futuro
    followersCount: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    contactEmail: { type: String },


}, { timestamps: true });

const Influencer = mongoose.model('Influencer', influencerSchema);

export default Influencer;
