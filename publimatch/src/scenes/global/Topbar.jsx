import {Box, IconButton, useTheme, Popover, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Badge, Divider, Menu, MenuItem} from "@mui/material";
import {useContext, useState, useEffect, useCallback} from "react";
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
import { useNotificationModal } from './NotificationContext'; // 👈 1. Importe nosso hook

// Uma função para formatar o tempo (opcional, mas recomendado)
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from "../../auth/AuthContext";


const Topbar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const navigate = useNavigate();
    const { user } = useAuth();

    // CORRIGIDO: O estado agora é totalmente controlado pelo Context.
    // Isso garante que o estado seja a única fonte da verdade.
    const { notifications, setNotifications, openModalWithCampaign } = useNotificationModal();

    // Estados para controle de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [configAnchorEl, setConfigAnchorEl] = useState(null);
    const [visibleCount, setVisibleCount] = useState(5);
    const [notificationsIgnored, setNotificationsIgnored] = useState(false);
    const [silencedUntil, setSilencedUntil] = useState(null);

    const open = Boolean(anchorEl);
    const configOpen = Boolean(configAnchorEl);
    const NOTIFICATIONS_INITIAL_LIMIT = 4;

    // OTIMIZADO: Funções envolvidas em useCallback para evitar recriações.
    const handleNotificationClick = useCallback((event) => setAnchorEl(event.currentTarget), []);
    const handleClose = useCallback(() => setAnchorEl(null), []);
    const handleConfigClick = useCallback((event) => {
        event.stopPropagation();
        setConfigAnchorEl(event.currentTarget);
    }, []);
    const handleConfigClose = useCallback(() => setConfigAnchorEl(null), []);
    const handleSettingsClick = useCallback(() => navigate('/configuracoes'), [navigate]);
    const handleProfileClick = useCallback(() => navigate('/perfil'), [navigate]);

    // Funções

     useEffect(() => {
        if (!open) {
            setTimeout(() => setVisibleCount(NOTIFICATIONS_INITIAL_LIMIT), 200);
        }
    }, [open]);


const handleNotificationItemClick = useCallback(async (notification) => {
    // Primeiro, marcamos como lida (a lógica que você já tinha)
    if (!notification.isRead) {
        try {
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.patch(`http://localhost:5001/api/notifications/${notification.id}/read`, {}, config);
        } catch (error) {
            console.error("Falha ao marcar notificação como lida:", error);
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: false } : n));
        }
    }
    
    // Agora, abrimos o modal
   const campaignId = notification.link?.split('/').pop();
    if (campaignId) {
        // ✅ MUDANÇA AQUI: Passe o objeto 'notification' inteiro
        openModalWithCampaign(campaignId, notification);
    }
}, [openModalWithCampaign, setNotifications, user?.token]);

    const handleIgnoreAll = () => {
        setNotificationsIgnored(true);
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
    // 👇 Apenas esta linha foi alterada
    if (notificationsIgnored) return 0; // ✅ Variável correta
    if (silencedUntil && new Date() < silencedUntil) return 0;
    return notifications.filter(n => !n.isRead).length;
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
   {notifications.length > 0 ? (
                            notifications.slice(0, visibleCount).map((notification) => {
                                const campaignId = notification.link?.split('/').pop();
                                return (
                            <Box key={notification.id}>
                                <ListItem 
                                onClick={() => handleNotificationItemClick(notification)}
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
                                       <Avatar 
                                          sx={{ width: 40, height: 40, bgcolor: 'rgba(255, 255, 255, 0.2)' }} 
                                          src={notification.logo}
                                        >
                                           {notification.subtitle ? notification.subtitle.charAt(0) : ''}
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
                          );
                            })
                        ) : (
                            // NOVO: Mensagem para quando não há notificações
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', p: 4 }}>
                                Nenhuma notificação nova.
                            </Typography>
                        )}
                    </List>

                    {/* Footer com lógica condicional */}
                    {/* ALTERADO: O footer agora tem lógica para mostrar mais */}
                    {notifications.length > visibleCount && (
                        <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                            <Typography
                                variant="body2"
                                onClick={() => setVisibleCount(notifications.length)} // Expande a lista
                                sx={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', '&:hover': { color: 'white' } }}
                            >
                                Ver todas as {notifications.length} notificações
                            </Typography>
                        </Box>
                    )}
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
