import { useState } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarFooter } from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';
import { Box, IconButton, Typography, useTheme, Tooltip } from '@mui/material'; 
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import PendingActionsIcon from '@mui/icons-material/PendingActions';

import { useAuth } from '../../auth/AuthContext';

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from '@mui/icons-material/Search';
import HotelClassIcon from '@mui/icons-material/HotelClass';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChatIcon from '@mui/icons-material/Chat';
import ThreePIcon from '@mui/icons-material/ThreeP';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

// Imagem padrão caso o usuário não tenha foto
import userDefault from "../../assets/user.png";

// Ícones de Cargo
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'; 
import SupportAgentIcon from '@mui/icons-material/SupportAgent'; 
import FaceIcon from '@mui/icons-material/Face'; 

export const ROLES = {
    AD_AGENT: 'AD_AGENT',
    INFLUENCER_AGENT: 'INFLUENCER_AGENT',
    INFLUENCER: 'INFLUENCER',
    ADMIN: 'ADMIN',
};

const roleIcons = {
    [ROLES.AD_AGENT]: <BusinessCenterIcon sx={{ fontSize: "28px" }} />,
    [ROLES.INFLUENCER_AGENT]: <SupportAgentIcon sx={{ fontSize: "28px" }} />,
    [ROLES.INFLUENCER]: <FaceIcon sx={{ fontSize: "28px" }} />,
    [ROLES.ADMIN]: <AdminPanelSettingsIcon sx={{ fontSize: "28px" }} />,
};

const Item = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <MenuItem 
            active={selected === title} 
            style={{ color: colors.grey[100] }}
            onClick={() => setSelected(title)}
            icon={icon}
        >
            <Typography sx={{ fontWeight: "bold", fontSize: "40px" }}>{title}</Typography>
            <Link to={to} />
        </MenuItem>
    );
};

const Sidebar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selected, setSelected] = useState("Dashboard");

    const { user } = useAuth();

    const roleDisplayNames = {
      [ROLES.AD_AGENT]: 'Agente de Publicidade',
      [ROLES.INFLUENCER_AGENT]: 'Agente do Influenciador',
      [ROLES.INFLUENCER]: 'Influenciador',
      [ROLES.ADMIN]: 'Administrador',
    };

    const influenciadoresSubItems = ["Pesquisa", "Ranking", "Lista"];
    const isInfluenciadoresActive = influenciadoresSubItems.includes(selected);

    return (
        <Box 
            id="sidebar-container"
            sx={{
                "& .pro-sidebar-inner": {
                    background: "linear-gradient(150deg, rgba(15, 28, 149, 0.5), rgba(233, 24, 118, 0.6)), url('../../assets/background.png')",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                },
                "& .pro-icon-wrapper": {
                    backgroundColor: "transparent !important",
                    fontSize: "2rem !important",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                },
                "& .pro-inner-item": {
                    padding: "12px 22px !important",
                    margin: "10px 18px",
                    borderRadius: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                },
                "& .pro-inner-item .MuiTypography-root": {
                    fontSize: "90% !important",
                    fontWeight: "bold !important",
                },
                "& .pro-inner-item:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    color: "#fff !important",
                },
                "& .pro-menu-item.active > .pro-inner-item": {
                    background: "linear-gradient(90deg, rgba(216, 128, 166, 0.4),rgba(172, 34, 206, 0.5))",
                    color: "#fff !important",
                    transition: "all 0.3s ease",
                },
                "& .pro-sidebar:not(.collapsed) .pro-menu-item.active > .pro-inner-item": {
                    borderRadius: "10px",
                },
                "& .pro-sidebar.collapsed .pro-inner-item": {
                    justifyContent: "center !important",
                    padding: "0 !important",
                    margin: "10px auto !important",
                    width: "50px !important",
                    height: "50px !important",
                    borderRadius: "50% !important",
                },
                "& .pro-sidebar.collapsed .pro-inner-item .pro-icon-wrapper": {
                    margin: "5px !important",
                },
                "& .pro-sidebar.collapsed .pro-inner-item .MuiTypography-root": {
                    display: "none !important",
                },
                "& .pro-sub-menu .pro-inner-item": {
                    padding: "5px 22px !important",
                    margin: "10px 18px",
                    borderRadius: "40px",
                    fontSize: "1.15rem",
                    fontWeight: "600",
                },
                "& .pro-sub-menu .pro-inner-item:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                },
                "& .pro-sidebar.collapsed .pro-sub-menu": {
                    padding: "0 !important",
                    margin: "0 !important",
                },
                "& .pro-sidebar.collapsed .pro-sub-menu .pro-inner-item": {
                    width: "50px !important",
                    height: "50px !important",
                    justifyContent: "center !important",
                    padding: "0 !important",
                    margin: "10px auto !important",
                    borderRadius: "50% !important",
                },
                "& .pro-sidebar.collapsed .pro-sub-menu .pro-inner-item .MuiTypography-root": {
                    display: "none !important",
                },
                "& .pro-sidebar.collapsed .pro-sub-menu .pro-arrow-wrapper": {
                    display: "none !important",
                },
                "& .pro-sidebar.collapsed .pro-sub-menu .pro-menu-item": {
                    padding: "0 !important",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                },
                "& .pro-sub-menu .pro-menu-item": {
                    paddingLeft: "3px !important",
                },
                "& .pro-sidebar": {
                    transition: "all 0.3s ease-in-out",
                    "&::-webkit-scrollbar": { width: "10px" },
                    "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
                    "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
                    "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" },
                },
                "& .pro-sidebar, & .pro-sidebar-inner": {
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.3) transparent",
                },
            }}
        >
            <ProSidebar 
                collapsed={isCollapsed} 
                style={{
                    transition: "all 0.3s ease-in-out",
                    width: isCollapsed ? "80px" : "300px",
                    height: "calc(100vh - 40px)",
                    borderRadius: "20px",
                    margin: "20px 8px 0px 20px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    background: "linear-gradient(0deg, rgba(34, 22, 164, 0.15), rgba(34, 22, 164, 0.15)), url(image.png)",
                    display: "flex", 
                    flexDirection: "column"
                }}
            >
                <Box style={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden" }}>
                    <Menu iconShape="square">
                        <MenuItem
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
                            style={{ margin: "10px 0 20px 0", color: colors.grey[100] }}
                        >
                            {!isCollapsed && (
                                <Box display="flex" justifyContent="space-between" alignItems="center" ml="15px">
                                    <Typography variant="h1" style={{ fontWeight: "Bold", fontSize: "50px" }} color={colors.grey[100]}>
                                        Publimatch
                                    </Typography>
                                    <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                                        <MenuOutlinedIcon />
                                    </IconButton>
                                </Box>
                            )}
                        </MenuItem>

                        {/* --- PERFIL DO USUÁRIO NA SIDEBAR --- */}
                        {!isCollapsed && user && (
                            <Box mb="25px">
                                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                                    <img
                                        alt="profile-user"
                                        width="150px" // Ajustei levemente o tamanho para caber melhor
                                        height="150px"
                                        // ✅ AQUI: Usa a imagem do banco, ou a padrão se não tiver
                                        src={user.profileImageUrl || userDefault}
                                        style={{ cursor: "pointer", borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.2)" }}
                                    />
                                </Box>
                                <Box textAlign="center">
                                    <Typography variant="h4" color={colors.grey[100]} fontWeight="bold" sx={{ m: "10px 0 0 0" }}>
                                        {/* ✅ O nome deve vir do contexto atualizado */}
                                        {user.name}
                                    </Typography>
                                
                                    <Typography variant="h6"  sx={{ mt: "5px"}}>
                                       {user.email}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                            <Item
                                title="Dashboard"
                                to="/"
                                icon={<HomeOutlinedIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />

                            {user.isCompanyAdmin && (
                                <Item title="Gerenciar Equipe" to="/equipe" icon={<SupervisorAccountIcon />} />
                            )}

                            {user.role === ROLES.ADMIN && (
                                <Item 
                                    title="Solicitações" 
                                    to="/solicitacoes" 
                                    icon={<PendingActionsIcon />} 
                                    selected={selected}
                                    setSelected={setSelected}
                                />
                            )}
    
                            <SubMenu
                                active={isInfluenciadoresActive}
                                title={!isCollapsed ? "Influenciadores" : ""}
                                icon={<ThreePIcon />}
                                style={{ color: colors.grey[100] }}
                            >
                                <MenuItem onClick={() => setSelected("Pesquisa")} icon={<SearchIcon />}>
                                    <Typography>Pesquisa</Typography>
                                    <Link to="/influenciador/pesquisa" />
                                </MenuItem>
                                <MenuItem onClick={() => setSelected("Ranking")} icon={<HotelClassIcon />}>
                                    <Typography>Ranking</Typography>
                                    <Link to="/influenciadores/ranking" />
                                </MenuItem>

                                {user?.role === ROLES.INFLUENCER_AGENT && (
                                    <MenuItem onClick={() => setSelected("Lista")} icon={<PeopleOutlinedIcon />}>
                                        <Typography>Influenciadores</Typography>
                                        <Link to="/influenciador/lista" />
                                    </MenuItem>
                                )}
                            </SubMenu>

                            {user?.role === ROLES.AD_AGENT && (
                                <Item
                                    title="Campanhas"
                                    to="/campanha"
                                    icon={<CampaignIcon />}
                                    selected={selected}
                                    setSelected={setSelected}
                                />
                            )}

                            {user && [ROLES.INFLUENCER_AGENT, ROLES.INFLUENCER].includes(user.role) && (
                                <Item
                                    title="Campanhas"
                                    to="/PesquisaCampanha"
                                    icon={<SearchIcon />}
                                    selected={selected}
                                    setSelected={setSelected}
                                />
                            )}
        
                            {user && [ROLES.AD_AGENT, ROLES.INFLUENCER_AGENT, ROLES.INFLUENCER].includes(user.role) && (
                                <Item
                                    title="Conversas"
                                    to="/conversas"
                                    icon={<ChatIcon />}
                                    selected={selected}
                                    setSelected={setSelected}
                                />
                            )}
                        </Box>
                    </Menu>
                </Box>

                {/* RODAPÉ COM INDICADOR DE CARGO */}
                {user && (
                    <SidebarFooter style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Tooltip title={isCollapsed ? roleDisplayNames[user.role] : ""} placement="right">
                            <Box 
                                display="flex" 
                                flexDirection={isCollapsed ? "column" : "row"} 
                                alignItems="center" 
                                justifyContent="center" 
                                gap={1}
                                sx={{ color: colors.grey[100] }}
                            >
                                {/* Ícone do Cargo */}
                                {roleIcons[user.role]}

                                {/* Texto do Cargo (Some se sidebar fechada) */}
                                {!isCollapsed && (
                                    <Box textAlign="left">
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#ccc' }}>
                                            Acesso:
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {roleDisplayNames[user.role]}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Tooltip>
                    </SidebarFooter>
                )}

            </ProSidebar>
        </Box>
    );
};

export default Sidebar;