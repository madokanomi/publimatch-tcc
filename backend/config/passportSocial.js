import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import { Strategy as TikTokStrategy } from 'passport-tiktok-auth';
import Influencer from '../models/influencerModel.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Serialização (necessária para sessões do passport)
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
        
        // 1. Buscamos o influenciador (sem precisar de select específico que quebraria se o campo não existisse)
        const influencer = await Influencer.findById(influencerId);

        if (!influencer) return done(new Error("Influenciador não encontrado."));

        // 2. Preparamos o objeto de atualização dinâmico
        // Isso evita depender da definição do Schema do Mongoose
        const updates = {};
        
        // Helper para definir chaves aninhadas no objeto de atualização
        const setUpdate = (key, value) => {
            updates[key] = value;
        };

        // Marca como verificado
        setUpdate(`socialVerification.${platform}`, true);
        setUpdate('isVerified', true);

        // Salva tokens (Access Token é crucial para buscar estatísticas depois)
        if (customData.accessToken) {
            setUpdate(`apiData.${platform}.accessToken`, customData.accessToken);
        }
        if (customData.refreshToken) {
            setUpdate(`apiData.${platform}.refreshToken`, customData.refreshToken);
        }

        // Lógica específica por plataforma
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
            // CENÁRIO A: API retornou sucesso com Username
            if (customData.username) {
                setUpdate('socialHandles.instagram', customData.username);
                setUpdate('social.instagram', `https://www.instagram.com/${customData.username}`);
                
                if (customData.businessId) setUpdate('apiData.instagram.instagramBusinessAccountId', customData.businessId);
                if (customData.pageId) setUpdate('apiData.instagram.facebookPageId', customData.pageId);
            } 
            // CENÁRIO B: Fallback (lê do objeto em memória se existir, para não sobrescrever incorretamente)
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
            
            // TikTok open_id
            if (profile.id) setUpdate('apiData.tiktok.openId', profile.id);
        }

        // 3. Executa a atualização direta no Banco de Dados ignorando a validação estrita do Schema
        // { strict: false } permite salvar campos (como apiData.tiktok) que não existem no model
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
            } else {
                 console.warn("Nenhuma conta de Instagram vinculada encontrada.");
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
    callbackURL: "/api/auth/twitch/callback",
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
        // IMPORTANTE: Passar AMBOS clientKey e clientID
        // clientKey: usado pela lib passport-tiktok-auth para gerar a URL com ?client_key=... (exigido pela API)
        // clientID: usado pelo passport-oauth2 para validação interna e evitar o erro "requires a clientID"
        clientKey: process.env.TIKTOK_CLIENT_KEY, 
        clientID: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        callbackURL: "/api/auth/tiktok/callback",
        scope: ['user.info.basic'],
        
        // Configurações para API V2 (obrigatório para novos apps e Sandbox)
        authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
        profileURL: 'https://open.tiktokapis.com/v2/user/info/',
        
        state: true,
        pkce: true, // Obrigatório para V2
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