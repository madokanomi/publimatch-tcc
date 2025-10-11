// scenes/global/NotificationContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'; // Adicione useEffect
import axios from 'axios';
import io from 'socket.io-client'; // Mova os imports para cá
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../auth/AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    
    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaignDetails, setCampaignDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Estados das Notificações
    const [notifications, setNotifications] = useState([]);
    const [currentNotificationId, setCurrentNotificationId] = useState(null);
 const [currentNotification, setCurrentNotification] = useState(null);
    // CORREÇÃO: A função foi MOVIDA para fora do useEffect e envolvida com useCallback.
    // Esta é a ÚNICA e correta versão da função.
    const removeNotification = useCallback(async (notificationId) => {
        if (!notificationId || !user?.token) return;

        // Otimista: remove da UI primeiro para uma resposta mais rápida
        setNotifications(prevNotifications =>
            prevNotifications.filter(notification => notification.id !== notificationId)
        );

        try {
            // Remove do backend para garantir a persistência
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.delete(`http://localhost:5001/api/notifications/${notificationId}`, config);
        } catch (error) {
            console.error("Falha ao remover notificação no backend:", error);
            // Se a remoção no backend falhar, idealmente você deveria
            // buscar as notificações novamente para re-sincronizar o estado.
            // fetchNotifications(); // (Função a ser definida)
        }
    }, [user]); // Depende do 'user' para pegar o token
    // Lógica para buscar notificações e conectar ao socket
    useEffect(() => {
        // Função interna para buscar os dados
        const fetchNotifications = async () => {
            if (!user?.token) {
                setNotifications([]);
                return;
            }
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5001/api/notifications', config);
                const formattedData = data.map(notif => ({
                    id: notif._id,
                    title: notif.title,
                    subtitle: notif.message,
                    avatar: notif.senderAvatar || 'default_avatar_url',
                    time: formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR }),
                    link: notif.link,
                     logo: notif.logo, // ✅ Use "logo"
                       entityId: notif.entityId,
                }));
                setNotifications(formattedData);
            } catch (error) {
                console.error("Falha ao buscar notificações:", error);
            }
        };

        fetchNotifications();

        const socket = io('http://localhost:5001');
        if (user?._id) {
            socket.emit('join', user._id);
        }
     socket.on('new_notification', (newNotification) => {
    // ✅ CORREÇÃO: Formate o objeto recebido via socket
    // da mesma forma que você formata os dados da API.
    console.log("Nova notificação recebida via WebSocket:", newNotification); // Opcional: para depurar

    const formattedNotification = {
        id: newNotification._id,
        title: newNotification.title,
        subtitle: newNotification.message,
        avatar: newNotification.senderAvatar || 'default_avatar_url',
        time: formatDistanceToNow(new Date(newNotification.createdAt), { addSuffix: true, locale: ptBR }),
        link: newNotification.link,
        isRead: newNotification.isRead || false,
          logo: newNotification.campaignLogo || null,
               entityId: newNotification.entityId,
    };

    setNotifications((prevNotifications) => [formattedNotification, ...prevNotifications]);
});

        return () => socket.disconnect();
    }, [user]);


    // 4. ATUALIZE a função openModal para receber também o ID da notificação
       const openModalWithCampaign = useCallback(async (campaignId, notification) => {
        if (!campaignId || !user?.token) return;
        
        // Armazena o objeto inteiro
        setCurrentNotification(notification);
        setIsLoading(true);
        setIsModalOpen(true);
        
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`http://localhost:5001/api/campaigns/${campaignId}`, config);
            setCampaignDetails(data);
        } catch (error) {
            console.error("Erro ao buscar detalhes da campanha:", error);
            setIsModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setCampaignDetails(null);
        setCurrentNotificationId(null);
    }, []);


    // CORREÇÃO: A segunda declaração de `removeNotification` foi removida daqui.

  const value = {
    isModalOpen,
    campaignDetails,
    isLoading,
    notifications,
    setNotifications, // ✅ ADICIONE ESTA LINHA
    openModalWithCampaign,
    closeModal,
    removeNotification,
    currentNotificationId,
     currentNotification 
};

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationModal = () => {
    return useContext(NotificationContext);
};