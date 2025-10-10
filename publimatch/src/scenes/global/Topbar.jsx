import {Box, IconButton, useTheme, Popover, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Badge, Divider, Menu, MenuItem} from "@mui/material";
import {useContext, useState, useEffect} from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useNavigate } from "react-router-dom";
import axios from 'axios'; // Importe o axios
import io from 'socket.io-client';
// Uma função para formatar o tempo (opcional, mas recomendado)
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from "../../auth/AuthContext";
const Topbar = () => {
     const { user } = useAuth(); // Pega o usuário logado

 

    
    // 1. Substitua os dados estáticos por um estado
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
       const navigate = useNavigate(); 
    // Estados
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [configAnchorEl, setConfigAnchorEl] = useState(null);
    const configOpen = Boolean(configAnchorEl);
 const handleSettingsClick = () => {
        navigate('/configuracoes');
    };
    const [notificationsIgnored, setNotificationsIgnored] = useState(false);
    const [silencedUntil, setSilencedUntil] = useState(null);

    const [ignoredBadge, setIgnoredBadge] = useState(false); // só para ocultar badge

    // Dados das notificações
    const amigo = [
        {
            id: 1,
            title: "Contrato Aprovado - Lançamento IPhone 17",
            subtitle: "Enaldinho realizou a confirmação do contrato para a campanha Lançamento...",
            avatar: "https://i.pinimg.com/736x/cd/76/67/cd7667a2bc222e1f0a3ab694247ddd6e.jpg",
            time: "5 min"
        },
        {
            id: 2,
            title: "Contrato Aprovado - Komonew: Criando o Novo",
            subtitle: "Mussa realizou a confirmação do contrato para a campanha Komonew: Criando...",
            avatar: "https://yt3.googleusercontent.com/OLTr1-kMrPQOFmS-7Z3bdapRwP46rP36VgAzv7vhoLXmUEjb4xqqEf5Ej70K6QTT1xXyws7IsXE=s900-c-k-c0x00ffffff-no-rj",
            time: "15 min"
        },
        {
            id: 3,
            title: "Influenciador em Alta - Tecnologia e Inovação",
            subtitle: "Conheça Dormiman, este novo influenciador está em alta na categoria de Tecnologia...",
            avatar: "https://down-br.img.susercontent.com/file/5da8ee70df39b96e7979ba644bf96668",
            time: "1h"
        }
    ];

    // Funções
    const handleNotificationClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleConfigClick = (event) => {
        event.stopPropagation();
        setConfigAnchorEl(event.currentTarget);
    };

    const handleProfileClick = () => {
    navigate('/perfil'); // Navega para a rota do perfil do agente
};
    const handleConfigClose = () => setConfigAnchorEl(null);

    const handleIgnoreAll = () => {
        setIgnoredBadge(true); // apenas remove a badge
        handleConfigClose();
        handleClose();
    };

    const handleSilenceFor = (duration) => {
        const now = new Date();
        let silenceUntil;
        
        switch(duration) {
            case '1hour': silenceUntil = new Date(now.getTime() + (60 * 60 * 1000)); break;
            case '12hours': silenceUntil = new Date(now.getTime() + (12 * 60 * 60 * 1000)); break;
            case '1day': silenceUntil = new Date(now.getTime() + (24 * 60 * 60 * 1000)); break;
            case '1week': silenceUntil = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); break;
            default: silenceUntil = null;
        }
        
        setSilencedUntil(silenceUntil);
        setNotificationsIgnored(false);
        handleConfigClose();
        handleClose();
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.token) {
                setLoading(false);
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                };
                // Rota para buscar as notificações do usuário logado
                const { data } = await axios.get('http://localhost:5001/api/notifications', config);
                
                // Formata os dados para o formato que o componente espera
                const formattedData = data.map(notif => ({
                    id: notif._id,
                    title: notif.title,
                    subtitle: notif.message,
                    // O backend deve fornecer o avatar do remetente
                    avatar: notif.senderAvatar || 'default_avatar_url', 
                    // Formata o tempo para "há 5 minutos", "há 2 horas", etc.
                    time: formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })
                }));

                setNotifications(formattedData);

            } catch (error) {
                console.error("Falha ao buscar notificações:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

            // Conecta ao servidor WebSocket
    const socket = io('http://localhost:5001'); // URL do seu backend

    // Entra em uma "sala" específica do usuário para receber notificações privadas
    if (user?._id) {
        socket.emit('join', user._id);
    }

    // Ouve por novas notificações
    socket.on('new_notification', (newNotification) => {
        // Formata a notificação recebida
         const formattedNotification = {
            id: newNotification._id,
            title: newNotification.title,
            subtitle: newNotification.message,
            avatar: newNotification.senderAvatar,
            time: formatDistanceToNow(new Date(newNotification.createdAt), { addSuffix: true, locale: ptBR })
        };
        // Adiciona a nova notificação no topo da lista
        setNotifications((prevNotifications) => [formattedNotification, ...prevNotifications]);
    });

    // Limpa a conexão quando o componente for desmontado
    return () => {
        socket.disconnect();
    };
    }, [user]);
     // Roda o efeito quando o usuário muda (login/logout)


    const handleReactivateNotifications = () => {
        setNotificationsIgnored(false);
        setSilencedUntil(null);
        handleConfigClose();
    };

    const isCurrentlySilenced = () => {
        if (notificationsIgnored) return true;
        if (silencedUntil && new Date() < silencedUntil) return true;
        return false;
    };

      const getBadgeContent = () => {
        if (ignoredBadge) return 0;
        if (silencedUntil && new Date() < silencedUntil) return 0;
        // Agora conta o tamanho do array de estado
        return notifications.filter(n => !n.isRead).length; // Mostra apenas as não lidas
    };

    const getSilenceTimeRemaining = () => {
        if (!silencedUntil) return '';
        const now = new Date();
        const diff = silencedUntil - now;
        if (diff <= 0) return '';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return hours > 0 ? `Silenciado por ${hours}h${minutes > 0 ? ` ${minutes}min` : ''}` : `Silenciado por ${minutes}min`;
    };

    return (
        <Box display="flex" justifyContent="space-between" pt={6} pb={5} pr={8} pl={8}>
            {/* Barra de busca */}
            <Box display="flex"  borderRadius="3px" alignContent="center" margin="0 auto">
               
              
            </Box>
            
            {/* Ícones */}
            <Box display="flex">
                <IconButton onClick={handleNotificationClick}>
                    <Badge badgeContent={getBadgeContent()} fontWeight="bold" color="error">
                        {open ? <NotificationsIcon /> : (isCurrentlySilenced() ? <NotificationsOffIcon sx={{ opacity: 0.6 }}/> : <NotificationsOutlinedIcon/>)}
                    </Badge>
                </IconButton>

                  <IconButton onClick={handleSettingsClick}>
                    <SettingsOutlinedIcon/>
                </IconButton>

        <IconButton onClick={handleProfileClick}>
                    <PersonOutlinedIcon/>
                </IconButton>
            </Box>

            {/* Popover das Notificações */}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        transform: 'translateX(10px) !important',
                        width: "27vw",
                        maxHeight: 500,
                        background: 'linear-gradient(135deg, rgba(123, 67, 151, 0.71) 0%, rgba(220, 66, 130, 0.64) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.51)',
                        mt: 1,
                        position: 'relative',
                        overflow: 'visible',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-8px',
                            right: '20px',
                            width: 0,
                            height: 0,
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderBottom: '8px solid rgba(255, 255, 255, 0.9)',
                            zIndex: -1
                        }
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center">
                            <NotificationsIcon sx={{ color: 'white', mr: 1 }} />
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                Notificações
                            </Typography>
                        </Box>
                        <IconButton onClick={handleConfigClick} sx={{ color: 'white' }}>
                            <SettingsOutlinedIcon />
                        </IconButton>
                    </Box>

                    {/* Status das notificações */}
                    {isCurrentlySilenced() && (
                        <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', p: 1.5, mb: 2, display: 'flex', alignItems: 'center' }}>
                            <VolumeOffIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: '1.2rem' }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>
                                {notificationsIgnored ? 'Todas as notificações foram ignoradas' : getSilenceTimeRemaining()}
                            </Typography>
                        </Box>
                    )}

                    {/* Lista de Notificações */}
                    <List sx={{ p: 0 }}>
                        {notifications.map((notification) => (
                            <Box key={notification.id}>
                                <ListItem 
                                    sx={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        mb: 1,
                                        opacity: isCurrentlySilenced() ? 0.5 : 1,
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255, 255, 255, 0.2)' }} src={notification.avatar}>
                                            {notification.title.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={<Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', lineHeight: 1.2 }}>{notification.title}</Typography>}
                                        secondary={<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem', mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{notification.subtitle}</Typography>}
                                    />
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem', alignSelf: 'flex-start' }}>
                                        {notification.time}
                                    </Typography>
                                </ListItem>
                            </Box>
                        ))}
                    </List>

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}>
                            Ver todas as notificações
                        </Typography>
                    </Box>
                </Box>
            </Popover>

            {/* Menu de Configurações das Notificações */}
            <Menu
                anchorEl={configAnchorEl}
                open={configOpen}
                onClose={handleConfigClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { background: 'linear-gradient(135deg, rgba(123, 67, 151, 0.58) 0%, rgba(220, 66, 130, 0.58) 100%)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.3)', minWidth: 220, mt: 1 } }}
            >
                {(notificationsIgnored || isCurrentlySilenced()) ? (
                    <MenuItem onClick={handleReactivateNotifications} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
                        <NotificationsIcon sx={{ mr: 2 }} />
                        Reativar notificações
                    </MenuItem>
                ) : (
                    <>
                        <MenuItem onClick={handleIgnoreAll} sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
                            <NotificationsOffIcon sx={{ mr: 2 }} />
                            Ignorar tudo
                        </MenuItem>
                        
                        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                        
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', px: 2, py: 1, fontSize: '0.8rem' }}>
                            Silenciar por:
                        </Typography>
                        
                        <MenuItem onClick={() => handleSilenceFor('1hour')} sx={{ color: 'white', pl: 3, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
                            <VolumeOffIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                            1 hora
                        </MenuItem>
                        <MenuItem onClick={() => handleSilenceFor('12hours')} sx={{ color: 'white', pl: 3, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
                            <VolumeOffIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                            12 horas
                        </MenuItem>
                        <MenuItem onClick={() => handleSilenceFor('1day')} sx={{ color: 'white', pl: 3, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
                            <VolumeOffIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                            1 dia
                        </MenuItem>
                        <MenuItem onClick={() => handleSilenceFor('1week')} sx={{ color: 'white', pl: 3, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
                            <VolumeOffIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                            1 semana
                        </MenuItem>
                    </>
                )}
            </Menu>
        </Box>
    );
};

export default Topbar;
