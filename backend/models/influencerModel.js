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

    socialVerification: {
        youtube: { type: Boolean, default: false },
        instagram: { type: Boolean, default: false },
        tiktok: { type: Boolean, default: false },
        twitch: { type: Boolean, default: false },
    },

    socialHandles: {
        youtube: { type: String, default: '' },   // Ex: "Canal do Enzo"
        instagram: { type: String, default: '' }, // Ex: "enzo.oficial"
        tiktok: { type: String, default: '' },
        twitch: { type: String, default: '' },    // Ex: "enzogamer"
    },

    apiData: {
        youtube: {
            accessToken: { type: String, select: false }, // select: false protege de queries comuns
            refreshToken: { type: String, select: false },
            channelId: String
        },
    },
    
    
    // Campo para saber se o perfil geral é verificado (opcional, se quiser um selo geral)
    isVerified: { type: Boolean, default: false },

}, { timestamps: true });

const Influencer = mongoose.model('Influencer', influencerSchema);

export default Influencer;
