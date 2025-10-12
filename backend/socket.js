// socket/socket.js

import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const userSocketMap = {}; // {userId: socketId}

// ✅ PASSO 1: CRIE E EXPORTE A FUNÇÃO DE BUSCA
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
    console.log('✅ Um usuário conectou:', socket.id);
    const userId = socket.handshake.query.userId;
    if (userId) { // Checagem mais robusta
        console.log(`Usuário ${userId} associado ao socket ${socket.id}`);
        userSocketMap[userId] = socket.id;
    }

    // Envia a lista de usuários online para todos os clientes
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('❌ Usuário desconectou:', socket.id);
        // Encontra o userId associado a este socket.id para remoção
        const disconnectedUserId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id);
        if (disconnectedUserId) {
            delete userSocketMap[disconnectedUserId];
            // Envia a lista atualizada de usuários online
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

// A exportação principal permanece a mesma
export { app, io, server };