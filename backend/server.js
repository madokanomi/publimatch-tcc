import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
// Importar todas as suas rotas
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import solicitacaoRoutes from './routes/solicitacaoRoutes.js';

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

const app = express();

// --- CONFIGURAÇÃO DO CORS ---
// Lista de endereços que terão permissão para acessar sua API
const allowedOrigins = [
  'http://localhost:3000',      // Para seu app React
  'http://127.0.0.1:5500',      // Para o Live Server do VS Code
  // 'https://www.seusite.com', // Adicione a URL do seu site em produção aqui
];

const corsOptions = {
  origin: function (origin, callback) {
    // A MÁGICA ESTÁ AQUI: A verificação `!origin` é o que permite
    // que arquivos locais (cuja origem é 'null') façam requisições.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Permite a requisição
    } else {
      callback(new Error('Não permitido pela política de CORS')); // Bloqueia
    }
  }
};

// --- MIDDLEWARES ---
app.use(cors(corsOptions)); // ✅ GARANTA QUE VOCÊ ESTÁ PASSANDO 'corsOptions' AQUI
app.use(express.json());   // Permite que o servidor entenda o formato JSON
// server.js

app.use('/api/users', userRoutes);
// --- DEFINIÇÃO DAS ROTAS DA API ---
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/solicitacoes', solicitacaoRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
