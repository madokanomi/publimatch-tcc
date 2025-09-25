import { useState } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import PendingActionsIcon from '@mui/icons-material/PendingActions';

// 1. Importar o hook de autenticação e as ROLES
import { useAuth } from '../../auth/AuthContext';

// ... (Seus outros imports de ícones)
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from '@mui/icons-material/Search';
import HotelClassIcon from '@mui/icons-material/HotelClass';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChatIcon from '@mui/icons-material/Chat';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ThreePIcon from '@mui/icons-material/ThreeP';
import foto from "../../assets/user.png"; // Usaremos como foto padrão
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';


export const ROLES = {
    AD_AGENT: 'AD_AGENT',
    INFLUENCER_AGENT: 'INFLUENCER_AGENT',
    INFLUENCER: 'INFLUENCER',
    ADMIN: 'ADMIN',
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

    // 2. Obter os dados do usuário logado
    const { user } = useAuth();

    // 3. (Opcional, mas recomendado) Mapear as roles para nomes amigáveis
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
                    overflow: "auto",
                }}
            >
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

                    {!isCollapsed && user && (
                        <Box mb="25px">
                            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                                <img
                                    alt="profile-user"
                                    width="180px"
                                    height="180px"
                                    src={foto}
                                    style={{ cursor: "pointer", borderRadius: "50%", objectFit: "cover" }}
                                />
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="h4" color={colors.grey[100]} fontWeight="bold" sx={{ m: "10px 0 0 0" }}>
                                    {user.name}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color={"#ffffff"}>
                                    {roleDisplayNames[user.role]}
                                </Typography>
                                <Typography variant="h7" color={colors.grey[100]}>
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

                        {/* == ITENS PARA AGENTE DE PUBLICIDADE == */}
                        {user?.role === ROLES.AD_AGENT && (
                            <>
                                <Item
                                    title="Campanhas"
                                    to="/campanha"
                                    icon={<CampaignIcon />}
                                    selected={selected}
                                    setSelected={setSelected}
                                />
                                {/* REMOVIDO: O item "Cadastrar Campanha" que estava aqui foi removido.
                                */}
                            </>
                        )}

                        {/* == ITENS APENAS PARA AGENTE DO INFLUENCIADOR == */}
                 {user && [ROLES.INFLUENCER_AGENT, ROLES.INFLUENCER].includes(user.role) && (
                            <Item
                                title="Campanhas"
                                to="/PesquisaCampanha"
                                icon={<SearchIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        )}
            

                        {/* Itens de menu visíveis para MÚLTIPLOS cargos */}
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
            </ProSidebar>
        </Box>
    );
};

export default Sidebar;