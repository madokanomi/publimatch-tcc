import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express'; // Apenas para referência, o 'app' importado já o utiliza.
import connectDB from './config/db.js';

// ✅ 1. IMPORTE AS VARIÁVEIS PRINCIPAIS DO SEU NOVO ARQUIVO socket.js
//    'app', 'server' e 'io' são as instâncias já criadas e configuradas.
import { app, server, io, getReceiverSocketId } from './socket.js';

// ✅ 2. IMPORTE TODAS AS SUAS ROTAS NORMALMENTE
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import solicitacaoRoutes from './routes/solicitacaoRoutes.js';
import influencerRoutes from './routes/influencerRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// --- CONFIGURAÇÃO INICIAL ---
dotenv.config();
connectDB();

// --- MIDDLEWARES (DECLARADOS APENAS UMA VEZ) ---

// ✅ 3. CONFIGURE O CORS PARA AS ROTAS HTTP.
//    A configuração para o Socket.IO já está dentro de socket.js
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
};
app.use(cors(corsOptions));

// Middleware para o Express entender o formato JSON
app.use(express.json());

// ✅ 4. MIDDLEWARE PERSONALIZADO PARA INJETAR 'io' E 'getReceiverSocketId' NAS REQUISIÇÕES
//    Isso permite que seus controllers (como o chatController) usem a lógica do socket.
app.use((req, res, next) => {
    req.io = io;
    req.getReceiverSocketId = getReceiverSocketId;
    next();
});

// ❌ A LINHA ABAIXO FOI REMOVIDA
// const server = http.createServer(app); // Erro! 'server' já foi importado de socket.js

// --- DEFINIÇÃO DAS ROTAS DA API ---
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/solicitacoes', solicitacaoRoutes);
app.use('/api/influencers', influencerRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 5001;

// ✅ 5. INICIE O 'server' IMPORTADO, QUE JÁ CONTÉM O EXPRESS E O SOCKET.IO
server.listen(PORT, () => console.log(`🚀 Servidor e WebSocket rodando na porta ${PORT}`));