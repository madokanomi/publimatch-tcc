import express from 'express';
import passport from 'passport';

const router = express.Router();

// Função auxiliar para gerar o state (InfluencerID)
const getState = (req) => {
    const { influencerId } = req.query;
    if (!influencerId) return null;
    return Buffer.from(influencerId).toString('base64');
};

// --- GOOGLE ---
router.get('/google', (req, res, next) => {
    const state = getState(req);
    if (!state) return res.status(400).json({ message: "Influencer ID necessário" });

    passport.authenticate('google', { 
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'],
        state: state,
        accessType: 'offline', // Importante para receber o refresh_token
        prompt: 'consent'
    })(req, res, next);
});

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
    (req, res) => {
        res.redirect(`http://localhost:3000/influenciadores/perfil/${req.user._id}?status=success&platform=youtube`);
    }
);

// --- FACEBOOK (META/INSTAGRAM) ---
// CORREÇÃO: Escopos reduzidos para evitar erro "Invalid Scopes". 
// 'email' e 'instagram_basic' removidos pois exigem configuração específica no painel da Meta.
router.get('/facebook', (req, res, next) => {
    const state = getState(req);
    if (!state) return res.status(400).json({ message: "Influencer ID necessário" });

    passport.authenticate('facebook', { 
        scope: [
            'public_profile', 
            'pages_show_list',       // Necessário para listar as páginas do usuário
            'pages_read_engagement'  // Necessário para ler dados básicos de conexão
        ],
        state: state 
    })(req, res, next);
});

router.get('/facebook/callback', 
    passport.authenticate('facebook', { session: false, failureRedirect: '/login-failed' }),
    (req, res) => {
        res.redirect(`http://localhost:3000/influenciadores/perfil/${req.user._id}?status=success&platform=instagram`);
    }
);

// --- TWITCH ---
router.get('/twitch', (req, res, next) => {
    const state = getState(req);
    if (!state) return res.status(400).json({ message: "Influencer ID necessário" });

    passport.authenticate('twitch', { state: state })(req, res, next);
});

router.get('/twitch/callback', 
    passport.authenticate('twitch', { session: false, failureRedirect: '/login-failed' }),
    (req, res) => {
        res.redirect(`http://localhost:3000/influenciadores/perfil/${req.user._id}?status=success&platform=twitch`);
    }
);

export default router;