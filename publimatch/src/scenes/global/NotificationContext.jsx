// scenes/global/NotificationContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'; // Adicione useEffect
import axios from 'axios';
import io from 'socket.io-client'; // Mova os imports para cá
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../auth/AuthContext';
import { useSocket } from '../../data/SocketContext';
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
      const socket = useSocket(); 
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
        const fetchNotifications = async () => {
            // Se não houver usuário logado, limpa as notificações e para
            if (!user?.token) {
                setNotifications([]);
                return;
            }
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5001/api/notifications', config);
                
                // Formata os dados recebidos da API
                const formattedData = data.map(notif => ({
                    id: notif._id,
                    title: notif.title,
                    subtitle: notif.message,
                    avatar: notif.senderAvatar || 'default_avatar_url',
                    time: formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR }),
                    link: notif.link,
                    logo: notif.logo,
                    entityId: notif.entityId,
                    type: notif.type,
                }));
                setNotifications(formattedData);
            } catch (error) {
                console.error("Falha ao buscar notificações:", error);
            }
        };

        fetchNotifications();
    }, [user]); // Roda apenas quando o 'user' muda (login/logout)


    // EFEITO 2: Para ouvir as notificações em tempo real via WebSocket
    useEffect(() => {
        // Se a conexão do socket ainda não estiver pronta, não faz nada
        if (!socket) return;

        const handleNewNotification = (newNotification) => {
            console.log("Nova notificação recebida via WebSocket:", newNotification);

            // Formata a nova notificação da mesma forma que as outras
            const formattedNotification = {
                id: newNotification._id,
                title: newNotification.title,
                subtitle: newNotification.message,
                avatar: newNotification.senderAvatar || 'default_avatar_url',
                time: formatDistanceToNow(new Date(newNotification.createdAt), { addSuffix: true, locale: ptBR }),
                link: newNotification.link,
                logo: newNotification.campaignLogo || null,
                entityId: newNotification.entityId,
                type: newNotification.type,
            };

            // Adiciona a nova notificação no início da lista existente
            setNotifications((prevNotifications) => [formattedNotification, ...prevNotifications]);
        };

        // Começa a ouvir pelo evento 'new_notification'
        socket.on('new_notification', handleNewNotification);

        // Função de limpeza: para de ouvir o evento quando o componente desmontar
        // Isso evita adicionar múltiplos listeners e causar bugs.
        return () => {
            socket.off('new_notification', handleNewNotification);
        };

    }, [socket]);


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