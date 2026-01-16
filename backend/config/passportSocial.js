import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import { Strategy as TikTokStrategy } from 'passport-tiktok-auth';
import Influencer from '../models/influencerModel.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const verifyAccount = async (req, profile, platform, done, customData = {}) => {
    try {
        const encodedState = req.query.state; 
        if (!encodedState) return done(new Error("Estado perdido."));

        const influencerId = Buffer.from(encodedState, 'base64').toString('ascii');
        
        const influencer = await Influencer.findById(influencerId);

        if (!influencer) return done(new Error("Influenciador não encontrado."));

        const updates = {};
        
        const setUpdate = (key, value) => {
            updates[key] = value;
        };

        setUpdate(`socialVerification.${platform}`, true);
        setUpdate('isVerified', true);

        if (customData.accessToken) {
            setUpdate(`apiData.${platform}.accessToken`, customData.accessToken);
        }
        if (customData.refreshToken) {
            setUpdate(`apiData.${platform}.refreshToken`, customData.refreshToken);
        }

        if (platform === 'youtube') {
            const channelTitle = customData.title || profile.displayName;
            const channelId = customData.id || profile.id;
            
            setUpdate('socialHandles.youtube', channelTitle);
            setUpdate('social.youtube', `https://www.youtube.com/channel/${channelId}`);
            
            if (customData.id) setUpdate('apiData.youtube.channelId', customData.id);
        } 
        else if (platform === 'twitch') {
            setUpdate('socialHandles.twitch', profile.display_name);
            setUpdate('social.twitch', `https://www.twitch.tv/${profile.login}`);
            
            if (profile.id) setUpdate('apiData.twitch.userId', profile.id);
        }
        else if (platform === 'instagram') {
            if (customData.username) {
                setUpdate('socialHandles.instagram', customData.username);
                setUpdate('social.instagram', `https://www.instagram.com/${customData.username}`);
                
                if (customData.businessId) setUpdate('apiData.instagram.instagramBusinessAccountId', customData.businessId);
                if (customData.pageId) setUpdate('apiData.instagram.facebookPageId', customData.pageId);
            } 
            else {
                const currentLink = influencer.social ? influencer.social.instagram : null;
                if (!currentLink) {
                    setUpdate('socialHandles.instagram', profile.displayName);
                }
            }
        }
        else if (platform === 'tiktok') {
            const username = profile.username || profile.display_name;
            setUpdate('socialHandles.tiktok', username);
            setUpdate('social.tiktok', `https://www.tiktok.com/@${username}`);
            
            if (profile.id) setUpdate('apiData.tiktok.openId', profile.id);
        }

        await Influencer.updateOne(
            { _id: influencerId },
            { $set: updates },
            { strict: false }
        );

        return done(null, influencer);

    } catch (error) {
        console.error(`Erro ao verificar ${platform}:`, error);
        return done(error, null);
    }
};

// 1. Google (YouTube)
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
        const youtubeResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: { part: 'snippet,id', mine: 'true' },
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        let channelData = { accessToken, refreshToken };
        if (youtubeResponse.data.items && youtubeResponse.data.items.length > 0) {
            const item = youtubeResponse.data.items[0];
            channelData.id = item.id;
            channelData.title = item.snippet.title;
        }

        return verifyAccount(req, profile, 'youtube', done, channelData);

    } catch (error) {
        console.error("Erro ao buscar dados do YouTube API:", error.message);
        return done(error, null);
    }
  }
));

// 2. Meta (Facebook/Instagram)
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName'], 
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
        const pagesResponse = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
            params: {
                access_token: accessToken,
                fields: 'name,instagram_business_account{id,username},connected_instagram_account{id,username}',
                limit: 100
            }
        });

        let instagramData = { accessToken };

        let linkedPage = pagesResponse.data?.data?.find(page => page.instagram_business_account);
        
        if (linkedPage && linkedPage.instagram_business_account) {
            instagramData.businessId = linkedPage.instagram_business_account.id;
            instagramData.username = linkedPage.instagram_business_account.username;
            instagramData.pageId = linkedPage.id;
        } 
        else {
            linkedPage = pagesResponse.data?.data?.find(page => page.connected_instagram_account);
            if (linkedPage && linkedPage.connected_instagram_account) {
                 instagramData.businessId = linkedPage.connected_instagram_account.id;
                 instagramData.username = linkedPage.connected_instagram_account.username;
                 instagramData.pageId = linkedPage.id;
            }
        }

        return verifyAccount(req, profile, 'instagram', done, instagramData);

    } catch (error) {
        console.error("Erro na Graph API (Instagram):", error.response?.data?.error?.message || error.message);
        return verifyAccount(req, profile, 'instagram', done, { accessToken });
    }
  }
));

// 3. Twitch
passport.use(new TwitchStrategy({
    clientID: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/api/auth/twitch/callback",
    scope: "user_read",
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    return verifyAccount(req, profile, 'twitch', done, { accessToken, refreshToken });
  }
));

// 4. TikTok
if (process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
    passport.use(new TikTokStrategy({
        clientKey: process.env.TIKTOK_CLIENT_KEY, 
        clientID: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        callbackURL: "/api/auth/tiktok/callback",
        scope: ['user.info.basic'],
        authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
        profileURL: 'https://open.tiktokapis.com/v2/user/info/',
        state: true,
        pkce: true,
        passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
        return verifyAccount(req, profile, 'tiktok', done, { accessToken, refreshToken });
    }
    ));
} else {
    console.warn("⚠️ TikTok Credentials (TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET) not found in .env. TikTok OAuth is disabled.");
}

export default passport;