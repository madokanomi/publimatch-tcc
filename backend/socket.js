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

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
    console.log('✅ Um usuário conectou:', socket.id);

    socket.on('setup', (userId) => {
        if (userId) {
            console.log(`Usuário ${userId} associado ao socket ${socket.id}`);
            userSocketMap[userId] = socket.id;
            socket.emit('connected');
            
            // ✅ AVISE TODOS QUE UM NOVO USUÁRIO ENTROU
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });

    // ❌ REMOVA O 'emit' QUE ESTAVA SOLTO AQUI

    socket.on('disconnect', () => {
        console.log('❌ Usuário desconectou:', socket.id);
        const disconnectedUserId = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id);
        if (disconnectedUserId) {
            delete userSocketMap[disconnectedUserId];
            
            // ✅ AVISE TODOS QUE UM USUÁRIO SAIU (já estava correto)
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export { app, io, server };