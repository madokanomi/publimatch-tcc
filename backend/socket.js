// socket/socket.js
import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

// Mapeamento para rastrear qual usuário está em qual socket
// { userId: socketId }
const userSocketMap = {}; 

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // A URL do seu cliente React
        methods: ["GET", "POST"]
    }
});

// Função para obter o socket ID do destinatário a partir do seu user ID
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
    console.log('✅ Um usuário conectou via WebSocket:', socket.id);

    // Obtém o userId dos parâmetros da query da conexão
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
        // Associa o userId ao socket.id
        userSocketMap[userId] = socket.id;
        console.log(`Usuário ${userId} associado ao socket ${socket.id}`);
    }

    // Emite um evento para todos os clientes informando os usuários online
    // O 'io.emit' envia para todos; 'socket.broadcast.emit' envia para todos exceto o remetente
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('❌ Usuário desconectou:', socket.id);
        // Remove o usuário do mapeamento quando ele desconecta
        for (let key in userSocketMap) {
            if (userSocketMap[key] === socket.id) {
                delete userSocketMap[key];
                break;
            }
        }
        // Atualiza a lista de usuários online para todos os clientes
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Exporta tudo que será necessário em outros arquivos
export { app, io, server };