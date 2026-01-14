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
            const channelTitle = customData.title || profile.displayName;
            const channelId = customData.id || profile.id;
            influencer.socialHandles.youtube = channelTitle;
            influencer.social.youtube = `https://www.youtube.com/channel/${channelId}`;
            
            // Salva token se disponível no customData (adaptação futura)
        } 
        else if (platform === 'twitch') {
            influencer.socialHandles.twitch = profile.display_name;
            influencer.social.twitch = `https://www.twitch.tv/${profile.login}`;
        }
        else if (platform === 'instagram') {
            // Lógica atualizada para Instagram
            // Se conseguimos pegar o username via Graph API, salvamos.
            if (customData.username) {
                influencer.socialHandles.instagram = customData.username;
                influencer.social.instagram = `https://www.instagram.com/${customData.username}`;
            } else {
                // Fallback: Usa o nome do Facebook se não achar Insta (menos ideal, mas evita crash)
                influencer.socialHandles.instagram = profile.displayName || "Verificado via Meta";
            }
            
            // Salva token de acesso se necessário para uso futuro no endpoint de estatísticas
            if (req.authInfo && req.authInfo.accessToken) {
               // Se você quiser salvar o token, precisaria passar para aqui. 
               // Mas por enquanto vamos focar em funcionar o OAuth básico.
            }
        }

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
    try {
        const youtubeResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: { part: 'snippet,id', mine: 'true' },
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        let channelData = {};
        if (youtubeResponse.data.items && youtubeResponse.data.items.length > 0) {
            const item = youtubeResponse.data.items[0];
            channelData = { id: item.id, title: item.snippet.title };
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
    // Removido 'email' dos profileFields para evitar erro se o escopo não for concedido
    profileFields: ['id', 'displayName'], 
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
        // --- BUSCA CONTA INSTAGRAM VINCULADA ---
        // 1. Busca as páginas do Facebook que o usuário administra
        // 2. Solicita o campo 'instagram_business_account' para ver se tem vínculo
        // NOTA: Sem o escopo 'instagram_basic', este campo pode não vir, 
        // mas tentamos 'pages_show_list' que às vezes permite leitura básica.
        const pagesResponse = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
            params: {
                access_token: accessToken,
                fields: 'name,instagram_business_account{id,username,profile_picture_url}'
            }
        });

        let instagramData = {};

        // Procura a primeira página que tenha uma conta de Instagram vinculada
        const linkedPage = pagesResponse.data?.data?.find(page => page.instagram_business_account);

        if (linkedPage && linkedPage.instagram_business_account) {
            instagramData = {
                id: linkedPage.instagram_business_account.id,
                username: linkedPage.instagram_business_account.username
            };
            // console.log("Instagram Business encontrado:", instagramData.username);
        } else {
            console.warn("Nenhuma conta de Instagram Business vinculada encontrada nas páginas deste usuário ou permissão insuficiente.");
        }

        return verifyAccount(req, profile, 'instagram', done, instagramData);

    } catch (error) {
        console.error("Erro na Graph API (Instagram):", error.response?.data || error.message);
        // Não falha o login inteiro, apenas segue sem os dados extras do Insta
        return verifyAccount(req, profile, 'instagram', done, {});
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
    return verifyAccount(req, profile, 'twitch', done);
  }
));

export default passport;