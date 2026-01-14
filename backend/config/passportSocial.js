import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitchStrategy } from 'passport-twitch-new';
import Influencer from '../models/influencerModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Serialização (necessária para sessões do passport)
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// --- Lógica Comum de Verificação ---
const verifyAccount = async (req, profile, platform, done) => {
    try {
        // O 'state' contém o ID do influenciador codificado em Base64 vindo do frontend
        const encodedState = req.query.state; 
        if (!encodedState) {
            return done(new Error("Estado de verificação perdido. Tente novamente."));
        }

        const influencerId = Buffer.from(encodedState, 'base64').toString('ascii');
        
        const influencer = await Influencer.findById(influencerId);

        if (!influencer) {
            return done(new Error("Influenciador não encontrado para vinculação."));
        }

        // Atualiza os dados de verificação
        if (!influencer.socialVerification) influencer.socialVerification = {};
        
        influencer.socialVerification[platform] = true;
        
        // Salva o ID da conta social para evitar fraudes futuras (opcional, mas recomendado)
        // Você precisaria adicionar esses campos no Model se quiser salvar o ID externo
        // influencer.socialIds[platform] = profile.id; 

        // Se tiver pelo menos uma rede, marca como verificado geral
        influencer.isVerified = true;

        await influencer.save();

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
    // Escopos do Youtube garantem que é uma conta válida
    return verifyAccount(req, profile, 'youtube', done);
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