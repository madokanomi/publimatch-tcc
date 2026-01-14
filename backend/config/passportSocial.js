import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
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
        const influencer = await Influencer.findById(influencerId);

        if (!influencer) return done(new Error("Influenciador não encontrado."));

        if (!influencer.socialVerification) influencer.socialVerification = {};
        if (!influencer.socialHandles) influencer.socialHandles = {};
        if (!influencer.social) influencer.social = {};

        // 1. Marca como verificado
        influencer.socialVerification[platform] = true;
        influencer.isVerified = true;

        // 2. Atualiza Dados (Priorizando dados customizados da API se houver)
        if (platform === 'youtube') {
            // Usa os dados que pegamos da API do YouTube (veja a estratégia abaixo)
            const channelTitle = customData.title || profile.displayName;
            const channelId = customData.id || profile.id;

            influencer.socialHandles.youtube = channelTitle;
            // AQUI ESTÁ A CORREÇÃO: Usa o ID do Canal (UC...), não o ID do Google
            influencer.social.youtube = `https://www.youtube.com/channel/${channelId}`;
        } 
        else if (platform === 'twitch') {
            influencer.socialHandles.twitch = profile.display_name;
            influencer.social.twitch = `https://www.twitch.tv/${profile.login}`;
        }
        else if (platform === 'instagram') {
            influencer.socialHandles.instagram = profile.displayName;
            // Para instagram mantemos o link que já estava ou não alteramos pois a API do FB não retorna link direto fácil
        }

        await influencer.save();
        return done(null, influencer);

    } catch (error) {
        console.error(`Erro ao verificar ${platform}:`, error);
        return done(error, null);
    }
};
// 1. Google (YouTube) - COM CORREÇÃO DE API
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
        // --- CHAMADA EXTRA PARA A API DO YOUTUBE ---
        // O profile.id padrão é do Google Account, não do Canal. Precisamos buscar o canal.
        const youtubeResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                part: 'snippet,id',
                mine: 'true' // Pega o canal do usuário logado
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        let channelData = {};
        
        // Se encontrou um canal vinculado à conta
        if (youtubeResponse.data.items && youtubeResponse.data.items.length > 0) {
            const item = youtubeResponse.data.items[0];
            channelData = {
                id: item.id, // Este é o ID correto que começa com "UC..."
                title: item.snippet.title // Nome oficial do canal
            };
        } else {
            console.warn("Nenhum canal do YouTube encontrado para esta conta Google.");
            // Fallback para o nome do perfil Google, mas sem ID de canal válido o link vai quebrar
            // Idealmente você poderia lançar um erro aqui se ter canal for obrigatório
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
    profileFields: ['id', 'displayName', 'email'],
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    return verifyAccount(req, profile, 'instagram', done); 
    // Nota: O login é via Facebook, mas validamos como "Ecossistema Meta/Instagram"
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
    return verifyAccount(req, profile, 'twitch', done);
  }
));

export default passport;