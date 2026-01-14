import Header from "../../components/Header.jsx";
import { useTheme, Box, Typography, Slide, Fade, CircularProgress, Skeleton } from "@mui/material";
import { tokens } from "../../theme.js";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";  
import LineChart from "../../components/LineChart.jsx";
import BarCharts from "../../components/BarCharts.jsx";
import StatBox from "../../components/StatBox.jsx";
import { DataGrid } from "@mui/x-data-grid";
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import '../../index.css'; 
import { useAuth } from '../../auth/AuthContext.jsx'; 
import PublicIcon from '@mui/icons-material/Public'; // <--- Adicione este import lá em cima junto com os outros ícones

export const ROLES = {
  AD_AGENT: 'AD_AGENT',
  INFLUENCER_AGENT: 'INFLUENCER_AGENT',
  INFLUENCER: 'INFLUENCER',
};

// Configuração visual dos Cards baseada no Role
const dashboardConfig = {
  [ROLES.AD_AGENT]: {
    stat1: { subtitle: "Campanhas Ativas", icon: <CampaignIcon sx={{color:"white", fontSize: "26px"}} /> },
    stat2: { subtitle: "Investimento Previsto", icon: <AttachMoneyIcon sx={{color:"white", fontSize: "26px"}} /> },
    stat3: { subtitle: "Candidaturas Pendentes", icon: <PersonAddIcon sx={{color:"white", fontSize: "26px"}} /> },
    stat4: { subtitle: "Influenciadores Contratados", icon: <GroupIcon sx={{color:"white", fontSize: "26px"}} /> },
    table_title: "Gerenciamento de Campanhas",
    stat1_increase: "+5% este mês"
  },
[ROLES.INFLUENCER_AGENT]: {
    stat1: { subtitle: "Influenciadores Agenciados", icon: <GroupIcon sx={{color:"white", fontSize: "26px"}} /> },
    
    // 👇 AQUI A MUDANÇA
    stat2: { subtitle: "Alcance Total (Seguidores)", icon: <PublicIcon sx={{color:"white", fontSize: "26px"}} /> },
    
    stat3: { subtitle: "Convites Pendentes", icon: <AssignmentIndIcon sx={{color:"white", fontSize: "26px"}} /> },
    stat4: { subtitle: "Campanhas Concluídas", icon: <EmojiEventsIcon sx={{color:"white", fontSize: "26px"}} /> },
    table_title: "Performance dos Agenciados",
    stat1_increase: "+2 novos"
  },
  [ROLES.INFLUENCER]: {
    stat1: { subtitle: "Jobs em Andamento", icon: <AdsClickIcon sx={{color:"white", fontSize: "26px"}} /> },
    stat2: { subtitle: "Meus Ganhos", icon: <PointOfSaleIcon sx={{color:"white", fontSize: "26px"}} /> },
    stat3: { subtitle: "Propostas Recebidas", icon: <CampaignIcon sx={{color:"white", fontSize: "26px"}} /> },
    stat4: { subtitle: "Alcance Total", icon: <GroupIcon sx={{color:"white", fontSize: "26px"}} /> },
    table_title: "Minhas Candidaturas",
    stat1_increase: "+12% engajamento"
  }
};

const Dashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { user } = useAuth();
    
    const [stats, setStats] = useState({ stat1: 0, stat2: 0, stat3: 0, stat4: 0 });
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user && user.token) {
                // 1. Configuração do Header
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };

                // 2. Busca os DADOS DOS CARDS (Stats)
                // Fazemos essa busca separado para garantir que os cards carreguem mesmo se a tabela falhar
                try {
                    console.log("Buscando Stats...");
                    const statsResponse = await axios.get('http://localhost:5001/api/dashboard/stats', config);
                    console.log("Stats Recebidos no Front:", statsResponse.data);
                    setStats(statsResponse.data);
                } catch (error) {
                    console.error("❌ Erro ao buscar Stats:", error);
                }

                // 3. Busca os DADOS DA TABELA (Grid)
                try {
                    let listEndpoint = 'http://localhost:5001/api/campaigns'; // Default

                    if (user.role === ROLES.INFLUENCER) {
                        listEndpoint = 'http://localhost:5001/api/applications'; 
                    } else if (user.role === ROLES.INFLUENCER_AGENT) {
                        listEndpoint = 'http://localhost:5001/api/invites'; 
                    }

                    console.log("Buscando Tabela em:", listEndpoint);
                    const listResponse = await axios.get(listEndpoint, config);
                    console.log("Tabela Recebida:", listResponse.data);
                    
                    // Garante que seja um array
                    const rows = Array.isArray(listResponse.data) ? listResponse.data : [];
                    setTableData(rows);

                } catch (error) {
                    console.error("❌ Erro ao buscar Tabela:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);
    
    // Definição dinâmica das colunas baseada no Role
    const columns = useMemo(() => {
        const role = user?.role || ROLES.AD_AGENT;

        const renderStatus = (params) => {
            const value = params.value || "";
            let color = "white";
            const s = value.toString().toLowerCase();
            
            if(s === "aberta" || s === "ativa" || s === "aprovada" || s === "accepted") color = "#61E5AC"; 
            else if(s === "privada" || s === "pendente" || s === "pending") color = "#ea099fff"; 
            else if(s === "finalizada" || s === "cancelada" || s === "rejeitada" || s === "rejected") color = "#ff4d4d"; 
            else if(s === "planejamento") color = "orange";
            
            return <span style={{ color, fontWeight:"bold", textTransform: "capitalize" }}>{value}</span>;
        };

        const renderDate = (params) => params.value ? new Date(params.value).toLocaleDateString('pt-BR') : "-";

        // --- COLUNAS PARA AGÊNCIA (Model: Campaign) ---
        if (role === ROLES.AD_AGENT) {
            return [
                { field: "title", headerName: "Campanha", flex: 1 },
                { field: "status", headerName: "Status", flex: 0.8, renderCell: renderStatus },
                { field: "startDate", headerName: "Início", flex: 0.8, renderCell: renderDate },
                { field: "brandName", headerName: "Marca", flex: 1 },
                { 
                    field: "applications", 
                    headerName: "Candidatos", 
                    flex: 0.5, 
                    align: "center", 
                    headerAlign: "center",
                    valueGetter: (params) => {
                        // Tratamento defensivo para evitar crash
                        
                        return params.row?.applications?.length || 0;
                    }
                },
                { 
                    field: "paymentType", 
                    headerName: "Investimento", 
                    flex: 1,
                    renderCell: ({ row }) => row.paymentType === 'Exato' ? `R$ ${row.paymentValueExact}` : row.paymentType
                }
            ];
        }

        // --- COLUNAS PARA INFLUENCIADOR (Model: Application populates Campaign) ---
        if (role === ROLES.INFLUENCER) {
            return [
                { 
                    field: "campaignTitle", 
                    headerName: "Campanha", 
                    flex: 1,
                    valueGetter: (params) => params.row.campaign?.title || "Removida"
                },
                { 
                    field: "brandName", 
                    headerName: "Marca", 
                    flex: 1,
                    valueGetter: (params) => params.row.campaign?.brandName || "-"
                },
                { field: "status", headerName: "Status", flex: 0.8, renderCell: renderStatus },
                { 
                    field: "paymentValueExact", 
                    headerName: "Cachê", 
                    flex: 0.8,
                    renderCell: (params) => {
                        const camp = params.row.campaign;
                        if (!camp) return "-";
                        if (camp.paymentType === 'Permuta') return "Permuta";
                        return camp.paymentValueExact ? `R$ ${camp.paymentValueExact}` : "A negociar";
                    }
                },
                { field: "createdAt", headerName: "Data Candidatura", flex: 0.8, renderCell: renderDate }
            ];
        }

        // --- COLUNAS PARA AGENTE DE INFLUENCER (Model: Invite populates Campaign & Influencer) ---
        if (role === ROLES.INFLUENCER_AGENT) {
            return [
                { 
                    field: "campaignTitle", 
                    headerName: "Campanha", 
                    flex: 1,
                    valueGetter: (params) => params.row.campaign?.title || "-"
                },
                { 
                    field: "influencerName", 
                    headerName: "Influenciador", 
                    flex: 1,
                    valueGetter: (params) => params.row.influencer?.name || "-"
                },
                { field: "status", headerName: "Status Convite", flex: 0.8, renderCell: renderStatus },
                { 
                    field: "brandName", 
                    headerName: "Marca", 
                    flex: 1,
                    valueGetter: (params) => params.row.campaign?.brandName || "-"
                },
                { 
                    field: "commission", 
                    headerName: "Comissão (20%)", 
                    flex: 0.7,
                    renderCell: (params) => {
                        const val = params.row.campaign?.paymentValueExact;
                        return val ? `R$ ${(val * 0.2).toFixed(2)}` : "-";
                    }
                }
            ];
        }

        return [];
    }, [user]);

    if (loading) {
           return (
           <Box ml="25px" p={2}>
            <Skeleton variant="text" width="40%" height={60} />
            <Skeleton variant="text" width="20%" height={30} />
            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px" mt={3}>
                <Skeleton variant="rectangular" gridColumn="span 3" height={140} sx={{ borderRadius: "15px" }} />
                <Skeleton variant="rectangular" gridColumn="span 3" height={140} sx={{ borderRadius: "15px" }} />
                <Skeleton variant="rectangular" gridColumn="span 3" height={140} sx={{ borderRadius: "15px" }} />
                <Skeleton variant="rectangular" gridColumn="span 3" height={140} sx={{ borderRadius: "15px" }} />
            </Box>
            <Box mt={5}>
                <Skeleton variant="text" width="25%" height={50} />
                <Skeleton variant="rectangular" width="99%" height={400} sx={{ borderRadius: "15px", mt: 2 }} />
            </Box>
        </Box>
        )
    }
    
    if (!user) {
        return <Typography sx={{ padding: "20px" }}>Faça login para ver o dashboard.</Typography>;
    }
    
    const config = dashboardConfig[user.role] || dashboardConfig[ROLES.AD_AGENT];

    return (
       <Fade in={true} timeout={1000}>
        <Box ml="25px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title={`Bem-Vindo, ${user.name}!`} subtitle="Dashboard" />
            </Box>

            <Box 
                height="calc(100vh - 120px)"
                overflow="auto"
                sx={{ transition: "all 0.3s ease-in-out",
                willChange: "width",
                "&::-webkit-scrollbar": { width: "10px", marginRight: "10px" },
                "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" },}}
            >
                
                 { /* GRID & CHARTS */}
        <Box display="grid" transition="all 0.3s ease-in-out" gridTemplateColumns="repeat(12, 1fr)" gap="20px"
            gridTemplateRows="140px 2% 500px auto" sx={{  willChange: "width",}}>
            
            { /* ROW 1 - StatBoxes */ }
           { /* ROW 1 - StatBoxes */ }
<Slide direction="up" in={true} timeout={600}>
    <Box gridColumn="span 3" borderRadius="15px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
        <StatBox
            // O backend manda numbers (10) ou strings ("R$ 20.000"). 
            // A verificação abaixo garante que o valor 0 (número) seja exibido e não tratado como falso.
            title={stats.stat1 !== undefined ? stats.stat1 : "0"}
            subtitle={config.stat1.subtitle}
            increase={config.stat1_increase}
            icon={config.stat1.icon}
        />
    </Box>
</Slide>

<Slide direction="up" in={true} timeout={700}>
    <Box gridColumn="span 3" borderRadius="15px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
        <StatBox
            title={stats.stat2 !== undefined ? stats.stat2 : "0"}
            subtitle={config.stat2.subtitle}
            increase="+21%"
            icon={config.stat2.icon} 
        />
    </Box>
</Slide>

<Slide direction="up" in={true} timeout={800}>
    <Box gridColumn="span 3" borderRadius="15px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
        <StatBox
            title={stats.stat3 !== undefined ? stats.stat3 : "0"}
            subtitle={config.stat3.subtitle}
            increase="+5%"
            icon={config.stat3.icon}
        />
    </Box>
</Slide>

<Slide direction="up" in={true} timeout={900}>
    <Box gridColumn="span 3" borderRadius="15px" marginRight="20px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
        <StatBox
            title={stats.stat4 !== undefined ? stats.stat4 : "0"}
            subtitle={config.stat4.subtitle}
            increase="+43%"
            icon={config.stat4.icon}
        />
    </Box> 
</Slide>    
            
            { /* ROW 2 - Charts */ }
            <Slide direction="up" in={true} timeout={1000} mountOnEnter unmountOnExit>
                <Box gridColumn="span 6"  transition="all 0.3s ease-in-out" height={500} gridRow="span 2">
                    <Box   sx={{ willChange: 'transform, width, height' }} mt="20px">
                        <LineChart  willChange="width"  isDashboard={true}/>
                    </Box>
                </Box>
            </Slide>

            <Slide direction="up" in={true} timeout={1000} mountOnEnter unmountOnExit>
                <Box gridColumn="span 6" height="50vh" gridRow="span 10" mr="40px" mt="2px" >
                    <Box  transition="all 0.3s ease-in-out"  sx={{ willChange: 'transform, width, height' }} width="100%">
                        <BarCharts  willChange="width"  isDashboard={true}/>
                    </Box>
                </Box>
            </Slide>

            {/* Tabela de Dados */}
           {user?.role !== ROLES.INFLUENCER_AGENT && (
                <Slide direction="up" in={true} timeout={1500} mountOnEnter unmountOnExit>
                    <Box
                        width="99%"
                        gridColumn="span 12"
                        gridRow="span 8"
                        p="20px"
                        borderRadius="15px"
                        bgcolor="#00000054"
                        mb="20vh"
                        sx={{ height: "500px" }}
                    >
                        <Typography
                            variant="h3"
                            fontWeight="bold"
                            color="white"
                            mb="10px"
                            padding="10px"
                        >
                            {config.table_title}
                        </Typography>
                        <Box sx={{ 
                            height: 400, 
                            width: '100%', 
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <DataGrid
                                rows={tableData}
                                columns={columns}
                                getRowId={(row) => row._id} 
                                disableRowSelectionOnClick
                                hideFooter={true}
                                autoHeight={false}
                                sx={{
                                    height: "100%", paddingLeft: "10px", paddingRight: "10px", border: "none", color: "white !important", backgroundColor: "transparent !important",
                                    "& .MuiDataGrid-main": { overflow: "hidden !important", position: "relative" },
                                    "& .MuiDataGrid-scrollArea": { display: "none !important" },
                                    "& .M_uiDataGrid-root, & .MuiDataGrid-main, & .MuiDataGrid-window": { overflow: "hidden !important" },
                                    "& .MuiDataGrid-virtualScroller": { overflowY: "auto !important", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.3) transparent" },
                                    "& .MuiDataGrid-columnHeaders": { backgroundColor: "transparent !important", color: "white !important", borderBottom: "1px solid rgba(255, 255, 255, 1)", position: "sticky !important", top: 0, zIndex: 10, backdropFilter: "blur(100px)" },
                                    "& .MuiDataGrirgba(35, 26, 26, 0.33)eaderTitle": { color: "white !important" },
                                    "& .MuiDataGrid-columnHeader": { backgroundColor: "transparent !important", color: "white !important" },
                                    "& .MuiDataGrid-window": { position: "absolute !important", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden !important" },
                                    "& .MuiDataGrid-virtualScroller": { position: "relative !important", overflow: "auto !important", height: "calc(100% - 56px) !important", maxHeight: "none !important" },
                                    "& .MuiDataGrid-virtualScrollerRenderZone": { position: "relative !important" },
                                    "& .MuiDataGrid-scrollbar": { display: "none !important" },
                                    "& .MuiDataGrid-scrollArea": { display: "none !important" },
                                    "& .MuiDataGrid-row": { backgroundColor: "#ffffff3f", borderRadius: "10px", marginBottom: "5px", marginTop: "10px" },
                                    "& .MuiDataGrid-row:hover": { backgroundColor: "#ffffff18", borderRadius: "10px", marginBottom: "5px", marginTop: "10px" },
                                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": { width: "8px", height: "8px" },
                                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.05)", borderRadius: "10px" },
                                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
                                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.5)" },
                                    "& .MuiDataGrid-virtualScroller": { scrollbarWidth: "thin", marginLeft:"10px", scrollbarColor: "rgba(255,255,255,0.3) transparent" },
                                }}
                            />
                        </Box>
                    </Box>
                </Slide>
            )}

        </Box>

        <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
            </Box>
        </Box>
      </Fade>
    );
};

export default Dashboard;