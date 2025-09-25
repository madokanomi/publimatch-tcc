// src/auth/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importa o axios

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // A lógica para iniciar o estado a partir do storage continua a mesma
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Falha ao analisar o usuário do storage", error);
            return null;
        }
    });

    const navigate = useNavigate();

    // 👇 A MÁGICA ACONTECE AQUI: A FUNÇÃO DE LOGIN CONECTADA À API 👇
    const login = async (email, password, rememberMe) => {
        try {
            // Faz a chamada POST para a API de login
            const response = await axios.post(
                'http://localhost:5001/api/auth/login', 
                { email, password } // Envia email e senha no corpo
            );

            // O backend retorna os dados do usuário em response.data
            const userData = response.data; 

            console.log("Login via API bem-sucedido para:", userData.name);
            
            // Salva os dados do usuário (que agora vêm do backend) no storage
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(userData));

            // Atualiza o estado do React
            setUser(userData);

            // Redireciona para o dashboard
            navigate("/"); 

            return { success: true };

        } catch (error) {
            console.error("Falha no login via API:", error);
            const message = error.response?.data?.message || "Erro ao conectar com o servidor.";
            return { success: false, message: message };
        }
    };

    // A função de logout continua a mesma
    const logout = () => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
        navigate("/login");
    };
    
    useEffect(() => {
        if(user && window.location.pathname === '/login') {
            navigate('/');
        }
    }, [user, navigate]);


    const value = {
        isAuthenticated: !!user,
        user,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};