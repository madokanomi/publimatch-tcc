    import express from 'express';
    import dotenv from 'dotenv';
    import cors from 'cors';
    import connectDB from './config/db.js';
    import userRoutes from './routes/userRoutes.js';
    import http from 'http';
    import { Server } from 'socket.io';
    // Importar todas as suas rotas
    import authRoutes from './routes/authRoutes.js';
    import campaignRoutes from './routes/campaignRoutes.js';
    import applicationRoutes from './routes/applicationRoutes.js';
    import dashboardRoutes from './routes/dashboardRoutes.js';
    import solicitacaoRoutes from './routes/solicitacaoRoutes.js';
    import influencerRoutes from './routes/influencerRoutes.js';
    import inviteRoutes from './routes/inviteRoutes.js';
    import notificationRoutes from './routes/notificationRoutes.js';
    // Carregar variáveis de ambiente
    dotenv.config();

    // Conectar ao banco de dados
    connectDB();

    const app = express();
    // NOVO: Criar o servidor HTTP a partir do app Express
    const server = http.createServer(app);


    // --- CONFIGURAÇÃO DO CORS ---
    // Lista de endereços que terão permissão para acessar sua API
    const allowedOrigins = [
    'http://localhost:3000',      // Para seu app React
    'http://127.0.0.1:5500',  
        // Para o Live Server do VS Code
    // 'https://www.seusite.com', // Adicione a URL do seu site em produção aqui
    ];

    const corsOptions = {
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Não permitido pela política de CORS'));
        }
      },
      // ✅ ADICIONE ESTA LINHA:
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    };

    const io = new Server(server, {
        cors: corsOptions
    });

    app.use((req, res, next) => {
        req.io = io;
        next();
    });

    io.on('connection', (socket) => {
        console.log('✅ Um usuário conectou via WebSocket:', socket.id);

        // Ouve pelo evento 'join' para colocar o usuário em uma sala privada
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`Usuário ${userId} entrou na sua sala privada.`);
        });

        socket.on('disconnect', () => {
            console.log('❌ Usuário desconectou:', socket.id);
        });
    });

    // --- MIDDLEWARES ---
    app.use(cors(corsOptions)); // ✅ GARANTA QUE VOCÊ ESTÁ PASSANDO 'corsOptions' AQUI
    app.use(express.json());   // Permite que o servidor entenda o formato JSON
    // server.js

    app.use('/api/users', userRoutes);
    // --- DEFINIÇÃO DAS ROTAS DA API ---z
    app.use('/api/auth', authRoutes);
    app.use('/api/campaigns', campaignRoutes);
    app.use('/api/applications', applicationRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/solicitacoes', solicitacaoRoutes);
    app.use('/api/influencers', influencerRoutes); 
    app.use('/api/invites', inviteRoutes);
    app.use('/api/notifications', notificationRoutes);

    const PORT = process.env.PORT || 5001;

    // CORRETO: Inicia o servidor http que contém o Express e o Socket.IO.
    server.listen(PORT, () => console.log(`🚀 Servidor e WebSocket rodando na porta ${PORT}`));
