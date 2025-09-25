import Header from "../../components/Header.jsx";
import {useTheme, Box, Typography, Slide, Fade, CircularProgress, Skeleton} from "@mui/material";
import {tokens} from "../../theme.js";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";  
import LineChart from "../../components/LineChart.jsx";
import BarCharts from "../../components/BarCharts.jsx";
import StatBox from "../../components/StatBox.jsx";
import { DataGrid } from "@mui/x-data-grid";
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CampaignIcon from '@mui/icons-material/Campaign';
import axios from "axios";
import { useState, useEffect } from "react";
import '../../index.css'; 
import { useAuth } from '../../auth/AuthContext.jsx'; // Certifique-se que o caminho está correto

// ... (ROLES, mockUsers, e dashboardTexts continuam os mesmos) ...

export const ROLES = {
  AD_AGENT: 'AGENTE_PUBLICIDADE',
  INFLUENCER_AGENT: 'AGENTE_INFLUENCIADOR',
  INFLUENCER: 'INFLUENCIADOR',
};

export const mockUsers = [
  { id: 1, email: 'publicidade@email.com', password: 'password123', username: 'Agente de Publicidade', role: ROLES.AD_AGENT },
  { id: 2, email: 'agenteinflu@email.com', password: 'password123', username: 'Agente do Influenciador', role: ROLES.INFLUENCER_AGENT },
  { id: 3, email: 'influenciador@email.com', password: 'password123', username: 'O Influenciador', role: ROLES.INFLUENCER },
];

const dashboardTexts = {
  [ROLES.AD_AGENT]: {
    stat1_subtitle: "Campanhas Ativas", stat1_increase: "+14% que o mês passado", stat2_subtitle: "Vendas Totais", stat3_subtitle: "Candidatura de influenciadores", stat4_subtitle: "Conversão de cliques", table_title: "Campanhas"
  },
  [ROLES.INFLUENCER_AGENT]: {
    stat1_subtitle: "Colaborações Gerenciadas", stat1_increase: "+14% que o último mês", stat2_subtitle: "Receita Total Gerada", stat3_subtitle: "Oportunidades de Parceria", stat4_subtitle: "Performance de Engajamento", table_title: "Projetos dos Influenciadores"
  },
  [ROLES.INFLUENCER]: {
    stat1_subtitle: "Meus Projetos Atuais", stat1_increase: "+14% em relação ao mês passado", stat2_subtitle: "Meus Ganhos Totais", stat3_subtitle: "Novos Convites e Propostas", stat4_subtitle: "Desempenho dos Meus Links", table_title: "Minhas Colaborações"
  }
};


const Dashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { user } = useAuth();
    
    // Seus estados para armazenar os dados da API
    const [stats, setStats] = useState({});
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect busca os dados assim que o componente é montado
    useEffect(() => {
        const fetchData = async () => {
            if (user && user.token) {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${user.token}` },
                    };
                    
                    // Busca estatísticas e campanhas em paralelo para mais eficiência
                    const [statsResponse, campaignsResponse] = await Promise.all([
                        axios.get('http://localhost:5001/api/dashboard/stats', config),
                        axios.get('http://localhost:5001/api/campaigns', config)
                    ]);

                    setStats(statsResponse.data);
                    setCampaigns(campaignsResponse.data);
                } catch (error) {
                    console.error("Erro ao buscar dados do dashboard:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                // Caso não haja usuário, para de carregar
                setLoading(false);
            }
        };
        fetchData();
    }, [user]); // A dependência [user] garante que a busca ocorra quando o usuário logar

    // Mostra uma mensagem de "Carregando..." enquanto a API não responde
    if (loading) {
           <Box ml="25px" p={2}>
            {/* Esqueleto do Header */}
            <Skeleton variant="text" width="40%" height={60} />
            <Skeleton variant="text" width="20%" height={30} />

            {/* Esqueleto dos StatBoxes */}
            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px" mt={3}>
                <Skeleton variant="rectangular" gridColumn="span 3" height={140} sx={{ borderRadius: "15px" }} />
                <Skeleton variant="rectangular" gridColumn="span 3" height={140} sx={{ borderRadius: "15px" }} />
                <Skeleton variant="rectangular" gridColumn="span 3" height={140} sx={{ borderRadius: "15px" }} />
                <Skeleton variant="rectangular" gridColumn="span 3" height={140} sx={{ borderRadius: "15px" }} />
            </Box>

            {/* Esqueleto da Tabela */}
            <Box mt={5}>
                <Skeleton variant="text" width="25%" height={50} />
                <Skeleton variant="rectangular" width="99%" height={400} sx={{ borderRadius: "15px", mt: 2 }} />
            </Box>
        </Box>
    }
    
    // Se não houver usuário após o carregamento, pode mostrar uma mensagem ou redirecionar
    if (!user) {
        return <Typography sx={{ padding: "20px" }}>Faça login para ver o dashboard.</Typography>;
    }
    
    const texts = dashboardTexts[user.role] || dashboardTexts[ROLES.AD_AGENT];

    const columns = [
        { field: "title", headerName: "Nome", flex: 1 },
        { 
            field: "status", 
            headerName: "Status", 
            flex: 1,
            renderCell: ({ value }) => {
                let color = "white";
                if(value === "Aberta" || value === "Ativa") color = "#61E5AC";
                else if(value === "Privada") color = "#ea099fff";
                else if(value === "Finalizada" || value === "Cancelada") color = "red";
                return <span style={{ color, fontWeight:"bold" }}>{value}</span>;
            }
        },
        { 
            field: "startDate", 
            headerName: "Data de Início", 
            flex: 1, 
            renderCell: ({ value }) => value ? new Date(value).toLocaleDateString('pt-BR') : "N/A"
        },
        { field: "brandName", headerName: "Marca", flex: 1 },
    ];

  
    return (
       <Fade in={true} timeout={1000}>
        <Box ml="25px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                {/* CORREÇÃO 3: Usar user.username */}
                <Header title={`Bem Vindo, ${user.name}!`} subtitle="Dashboard" />
            </Box>

            {/* O restante do código não precisa de alterações */}
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
                {/* ... (todo o seu JSX de grid e charts) ... */}
                 { /* GRID & CHARTS */}
        <Box display="grid" transition="all 0.3s ease-in-out" gridTemplateColumns="repeat(12, 1fr)" gap="20px"
            gridTemplateRows="140px 2% 500px auto" sx={{  willChange: "width",}}>
            
            { /* ROW 1 - StatBoxes com textos dinâmicos */ }
             <Slide direction="up" in={true} timeout={600}>
                            <Box gridColumn="span 3" borderRadius="15px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
                                <StatBox
                                    title={stats.stat1 || "0"}
                                    subtitle={texts.stat1_subtitle}
                                    increase={texts.stat1_increase}
                                    icon={<CampaignIcon sx={{color:"white", fontSize: "26px"}} />}
                                />
                            </Box>
                        </Slide>
                        <Slide direction="up" in={true} timeout={700}>
                            <Box gridColumn="span 3" borderRadius="15px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
                                <StatBox
                                    title={stats.stat2 || "R$ 0,00"}
                                    subtitle={texts.stat2_subtitle}
                                    increase="+21%"
                                    icon={<PointOfSaleIcon sx={{color:"white", fontSize: "26px"}} />} 
                                />
                            </Box>
                        </Slide>
                        <Slide direction="up" in={true} timeout={800}>
                            <Box gridColumn="span 3" borderRadius="15px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
                                <StatBox
                                    title={stats.stat3 || "0"}
                                    subtitle={texts.stat3_subtitle}
                                    increase="+5%"
                                    icon={<PersonAddIcon sx={{color:"white", fontSize: "26px"}} />}
                                />
                            </Box>
                        </Slide>
                        <Slide direction="up" in={true} timeout={900}>
                            <Box gridColumn="span 3" borderRadius="15px" marginRight="20px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
                                <StatBox
                                    title={stats.stat4 || "0"}
                                    subtitle={texts.stat4_subtitle}
                                    increase="+43%"
                                    icon={<AdsClickIcon sx={{color:"white", fontSize: "26px"}} />}
                                />
                            </Box> 
                        </Slide>
            
            { /* ROW 2 - Gráficos com animação */ }
            <Slide direction="up" in={true} timeout={1000} mountOnEnter unmountOnExit>
                <Box gridColumn="span 7"  transition="all 0.3s ease-in-out" height={500} gridRow="span 2">
                    <Box   sx={{ willChange: 'transform, width, height' }} mt="20px">
                        <LineChart  willChange="width"  isDashboard={true}/>
                    </Box>
                </Box>
            </Slide>

            <Slide direction="up" in={true} timeout={1000} mountOnEnter unmountOnExit>
                <Box gridColumn="span 5" height="50vh" gridRow="span 10" mr="40px" mt="2px" >
                    <Box  transition="all 0.3s ease-in-out"  sx={{ willChange: 'transform, width, height' }} width="100%">
                        <BarCharts  willChange="width"  isDashboard={true}/>
                    </Box>
                </Box>
            </Slide>

            {/* Tabela de Campanhas com animação */}
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
                    {texts.table_title}
                </Typography>
                <Box sx={{ 
                    height: 400, 
                    width: '100%', 
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                <DataGrid
                    rows={campaigns}
                    columns={columns}
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
                      // Firefox
                      "& .MuiDataGrid-virtualScroller": { scrollbarWidth: "thin", marginLeft:"10px", scrollbarColor: "rgba(255,255,255,0.3) transparent" },
                    }}
                />
                </Box>
                </Box>
            </Slide>

        </Box>
            </Box>
        </Box>
      </Fade>
    );
};

export default Dashboard;