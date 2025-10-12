// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../auth/AuthContext';
const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        // Só conecta se houver um usuário logado
        if (user?._id) {
            // Conecta ao servidor
            const newSocket = io('http://localhost:5001');

            // Envia o evento 'setup' para o backend com o ID do usuário
            // para que o backend possa colocar este socket na sala correta.
            newSocket.emit('setup', user._id); 

            newSocket.on('connected', () => {
                console.log('Frontend: Conectado ao servidor de sockets e na sala!');
            });

            setSocket(newSocket);

            // Função de limpeza para desconectar ao fazer logout ou fechar a aba
            return () => newSocket.disconnect();
        } else {
            // Se não há usuário, garante que qualquer socket antigo seja desconectado
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]); // Roda sempre que o estado de 'user' mudar

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};