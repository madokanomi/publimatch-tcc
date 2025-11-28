// src/auth/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 1. Inicializa o estado lendo do localStorage ou sessionStorage
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

    // 2. Função de Login
    const login = async (email, password, rememberMe) => {
        try {
            const response = await axios.post(
                'http://localhost:5001/api/auth/login', 
                { email, password }
            );

            const userData = response.data; 

            console.log("Login via API bem-sucedido para:", userData.name);
            
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            navigate("/"); 

            return { success: true };

        } catch (error) {
            console.error("Falha no login via API:", error);
            const message = error.response?.data?.message || "Erro ao conectar com o servidor.";
            return { success: false, message: message };
        }
    };

    // 3. Função de Logout
    const logout = () => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        setUser(null);
        navigate("/login");
    };

    // ✅ 4. FUNÇÃO DE ATUALIZAR USUÁRIO (ESSA É A QUE FALTAVA)
    // Ela mescla os dados antigos (token, id) com os novos (nome, foto)
    const updateUser = (updatedData) => {
        setUser((prevUser) => {
            if (!prevUser) return null;

            // Cria o novo objeto combinando o anterior com as atualizações
            const newUser = { ...prevUser, ...updatedData };

            // Atualiza no localStorage se estiver lá
            if (localStorage.getItem('user')) {
                localStorage.setItem('user', JSON.stringify(newUser));
            }
            
            // Atualiza no sessionStorage se estiver lá
            if (sessionStorage.getItem('user')) {
                sessionStorage.setItem('user', JSON.stringify(newUser));
            }

            return newUser;
        });
    };
    
    // 5. Redirecionamento de segurança
    useEffect(() => {
        if(user && window.location.pathname === '/login') {
            navigate('/');
        }
    }, [user, navigate]);

    // 6. Objeto de valores expostos pelo contexto
    const value = {
        isAuthenticated: !!user,
        user,
        login,
        logout,
        updateUser, // ✅ AGORA A SIDEBAR CONSEGUE ACESSAR ISSO
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};