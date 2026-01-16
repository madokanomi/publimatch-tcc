import mongoose from "mongoose";

const influencerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    niches: [{ type: String }],
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },

    realName: { type: String, required: true },
    age: { type: Number },
    description: { type: String },
    aboutMe: { type: String },
    
    social: {
        tiktok: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
        twitch: { type: String, default: '' },
    },

    profileImageUrl: { type: String, default: '' },
    backgroundImageUrl: { type: String, default: '' },
    
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
        youtube: { type: String, default: '' },
        instagram: { type: String, default: '' },
        tiktok: { type: String, default: '' },
        twitch: { type: String, default: '' }, 
    },

    apiData: {
        youtube: {
            accessToken: { type: String, select: false },
            refreshToken: { type: String, select: false },
            channelId: String
        },
        instagram: {
            accessToken: { type: String, select: false }, 
            facebookPageId: { type: String }, 
            instagramBusinessAccountId: { type: String },
            lastFetched: { type: Date }
        },
        twitch: {
            accessToken: { type: String, select: false },
            refreshToken: { type: String, select: false },
            userId: { type: String }
        },
        tiktok: {
            openId: { type: String }
        }
    },

    instagramStats: {
        followers: { type: Number, default: 0 },
        mediaCount: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        reach: { type: Number, default: 0 },
        profileViews: { type: Number, default: 0 },
        engagementRate: { type: Number, default: 0 },
        avgLikes: { type: Number, default: 0 },
        avgComments: { type: Number, default: 0 },
        
        audienceGender: [{ name: String, value: Number }], 
        audienceAge: [{ name: String, value: Number }],    
        audienceCountry: [{ name: String, value: Number }],
        
        qualityScore: { type: Number, default: 95 }
    },

    youtubeStats: { type: Object, default: {} },
    twitchStats: { type: Object, default: {} },
    tiktokStats: { type: Object, default: {} },
    
    isVerified: { type: Boolean, default: false },

}, { timestamps: true });

const Influencer = mongoose.model('Influencer', influencerSchema);

export default Influencer;