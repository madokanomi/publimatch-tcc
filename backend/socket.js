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

io.on('connection', (socket) => {
    console.log('✅ Um usuário conectou via WebSocket:', socket.id);

    // Ouve pelo evento 'setup' que o frontend vai enviar após o login
    socket.on('setup', (userId) => {
        // Coloca este socket em uma sala com o nome do userId
        socket.join(userId);
        console.log(`Usuário ${userId} entrou na sua sala privada.`);
        socket.emit('connected'); // Envia uma confirmação de volta para o cliente
    });

    socket.on('disconnect', () => {
        console.log('❌ Usuário desconectou:', socket.id);
    });
});

// A função getReceiverSocketId não é mais necessária para as notificações
// se você estiver usando salas. O req.io.to(userId) cuidará disso.
export { app, io, server };