import Header from "../../components/Header.jsx";
import {useTheme, Box, Button, IconButton, Typography} from "@mui/material";
import {tokens} from "../../theme.js";
import {mockTransactions} from "../../data/mockData.js";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";  
import TrafficIcon from "@mui/icons-material/Traffic";  
import LineChart from "../../components/LineChart.jsx";
import BarCharts from "../../components/BarCharts.jsx";
import StatBox from "../../components/StatBox.jsx";
import ProgressCircle from "../../components/ProgressCircle.jsx";
import { DataGrid } from "@mui/x-data-grid";
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CampaignIcon from '@mui/icons-material/Campaign';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import '../../index.css'; 


const Dashboard = () =>{
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
const rows = [
  { id: 1, nome: "Lançamento - iPhone 17", status: "Aberta", inicio: "12/04/2025", fim: "Indefinida", views: "2.190.584", engajamento: "420.304", conversao: 19.14 },
  { id: 2, nome: "Divulgação - Meias LUPO", status: "Privada", inicio: "22/07/2025", fim: "27/09/2025", views: "171.122", engajamento: "420.304", conversao: 50.00 },
  { id: 3, nome: "Divulgação - Livro Enaldinho", status: "Finalizada", inicio: "11/03/2025", fim: "11/03/2025", views: "1.584", engajamento: "420.304", conversao: 75.00 },
  { id: 4, nome: "Vale por um bifinho - Danone", status: "Aberta", inicio: "16/06/2025", fim: "25/12/2025", views: "44.142.234", engajamento: "420.304", conversao: 80.00 },
  { id: 5, nome: "Amei, quero mais - KFC", status: "Privada", inicio: "01/02/2025", fim: "16/06/2025", views: "770.346", engajamento: "420.304", conversao: 25.00 },
  { id: 6, nome: "Promoção Natal - Coca", status: "Finalizada", inicio: "01/12/2024", fim: "25/12/2024", views: "1.200.000", engajamento: "320.000", conversao: 55.00 },
  { id: 7, nome: "Lançamento - Galaxy Z", status: "Aberta", inicio: "01/01/2025", fim: "Indefinida", views: "2.500.000", engajamento: "500.000", conversao: 72.00 },
  { id: 8, nome: "Campanha Black Friday - Nike", status: "Privada", inicio: "20/11/2025", fim: "28/11/2025", views: "3.200.000", engajamento: "1.000.000", conversao: 68.00 },
];

const columns = [
  { field: "nome", headerName: "Nome", flex: 1 },
  { 
    field: "status", 
    headerName: "Status", 
    flex: 1,
    renderCell: (params) => {
      let color = "white";
      if(params.value === "Aberta") color = "#61E5AC";
      else if(params.value === "Privada") color = "#ea099fff";
      else if(params.value === "Finalizada") color = "red";
      return <span style={{ color, fontWeight:"bold" }}>{params.value}</span>;
    }
  },
  { field: "inicio", headerName: "Data de Início", flex: 1 },
  { field: "fim", headerName: "Data de Término", flex: 1 },
  { field: "views", headerName: "Visualizações", flex: 1 },
  { field: "engajamento", headerName: "Engajamento", flex: 1 },
  { 
    field: "conversao", 
    headerName: "Conversão (%)", 
    flex: 1,
    renderCell: (params) => {
      let color = "yellow";
      if(params.value < 30) color = "red";
      else if(params.value >= 70) color = "#61E5AC";
      return <span style={{ color, fontWeight:"bold" }}>{params.value.toFixed(2)}%</span>;
    }
  },
];

  // Mock da lista de conversas
  const conversas = [
    { id: 1, nome: "Paulo Gostavo", msg: "Quando será a entrega da publi?", hora: "09:10 PM", img: "https://i.pravatar.cc/40?img=1" },
    { id: 2, nome: "Adelaide Bonds", msg: "Foi um ótimo projeto!", hora: "03:25 AM", img: "https://i.pravatar.cc/40?img=2" },
    { id: 3, nome: "Leonardo Bigods", msg: "Podemos conversar?", hora: "Ontem", img: "https://i.pravatar.cc/40?img=3" },
    { id: 4, nome: "Franklin", msg: "Alright!", hora: "Sábado", img: "https://i.pravatar.cc/40?img=4" },
  ];

  
    return (
    
    <Box ml="25px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Bem Vindo!" subtitle="Dashboard" />
</Box>

 <Box 
    height="calc(100vh - 120px)"  // ajusta para altura da tela menos header/topbar
    overflow="auto"               // ativa o scroll vertical
    transition="all 0.3s ease-in-out"                // evita que a barra sobreponha conteúdo
 sx={{
  transition:"all 0.3s ease-in-out",
    willChange: "width",
    /* Custom scrollbar */
    "&::-webkit-scrollbar": {
      width: "10px",
      marginRight:"10px",               // largura da scrollbar
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(255, 255, 255, 0.1)", // cor do fundo da scrollbar
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(255, 255, 255, 0.3)", // cor da parte que você arrasta
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "rgba(255, 255, 255, 0.6)", // muda a cor ao passar o mouse
    },
  }}
>

{ /* GRID & CHARTS */}
<Box display="grid" transition="all 0.3s ease-in-out" gridTemplateColumns="repeat(12, 1fr)" gap="20px"
     gridTemplateRows="140px 2% 500px auto" sx={{  willChange: "width",}}>
    
    { /* ROW 1 */ }
    <Box gridColumn="span 3" borderRadius="15px"  backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
        <StatBox
        sx={{color: "white"}}
        title="12"
        subtitle="Campanhas Ativas"
        progress="0.75" 
        increase="+14% que o mês passado"
        icon={<CampaignIcon sx={{color:"white", fontSize: "26px"}} />}
        />
        
    </Box>
    <Box gridColumn="span 3" borderRadius="15px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
        <StatBox
        title="431,225"
        subtitle="Vendas Totais"
        progress="0.50"
        increase="+21%"
        icon={<PointOfSaleIcon sx={{color:"white", fontSize: "26px"}} />}  
        />
        
    </Box>
    <Box gridColumn="span 3" borderRadius="15px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
        <StatBox
        title="32,441"
        subtitle="Candidatura de influenciadores"
        progress="0.30"
        increase="+5%"
        icon={<PersonAddIcon sx={{color:"white", fontSize: "26px"}} />}
        />
    </Box>
    <Box gridColumn="span 3" borderRadius="15px" marginRight="20px" backgroundColor="#ffffff2f" display="flex" alignItems="center" justifyContent="center">
        <StatBox
        title="1,325,134"
        subtitle="Conversão de cliques"
        progress="0.80"
        increase="+43%"
        icon={<AdsClickIcon sx={{color:"white", fontSize: "26px"}} />}
        />
    </Box>  

    
    { /* ROW 2 */ }
    <Box gridColumn="span 7"  transition="all 0.3s ease-in-out" height={500} gridRow="span 2">
        <Box   sx={{ willChange: 'transform, width, height' }} mt="20px">
            <LineChart  willChange="width"  isDashboard={true}/>
        </Box>
    </Box>
   <Box gridColumn="span 5" height="50vh" gridRow="span 10" mr="40px" mt="2px" >
       <Box  transition="all 0.3s ease-in-out"  sx={{ willChange: 'transform, width, height' }} width="100%">
            <BarCharts  willChange="width"  isDashboard={true}/>
        </Box>
            </Box>
<Box
  width="99%"
  gridColumn="span 12"
  gridRow="span 8"
  p="20px"
  borderRadius="15px"
  bgcolor="#00000054"
  mb="20vh"
  sx={{ height: "500px" }} // altura fixa + scroll
>
  <Typography
    variant="h3"
    fontWeight="bold"
    color="white"
    mb="10px"
    padding="10px"
  >
    Campanhas
  </Typography>
  <Box sx={{ 
  height: 400, 
  width: '100%', 
  overflow: 'hidden',
  position: 'relative'
}}>
  <DataGrid
    rows={rows}
    columns={columns}
    disableRowSelectionOnClick
    hideFooter={true}
    autoHeight={false}
    sx={{
      height: "100%",
      paddingLeft: "10px",
      paddingRight: "10px",
      border: "none",
      color: "white !important",
      backgroundColor: "transparent !important",
      
      // REMOVER TODOS OS SCROLLS INTERNOS
      "& .MuiDataGrid-main": {
        overflow: "hidden !important",
        position: "relative",
      },
      "& .MuiDataGrid-scrollArea": {
      display: "none !important",
      
    },

    "& .MuiDataGrid-root, & .MuiDataGrid-main, & .MuiDataGrid-window": {
      overflow: "hidden !important",
    },
        "& .MuiDataGrid-virtualScroller": {
      overflowY: "auto !important",
      scrollbarWidth: "thin",
      
      scrollbarColor: "rgba(255,255,255,0.3) transparent",
    },
       "& .MuiDataGrid-columnHeaders": {
        backgroundColor: "transparent !important",
        color: "white !important",
        borderBottom: "1px solid rgba(255, 255, 255, 1)",
        position: "sticky !important", // fixa o header
        top: 0,
        zIndex: 10, // fica acima das linhas
        backdropFilter: "blur(100px)", // opcional: efeito vidro
      },
      "& .MuiDataGrirgba(35, 26, 26, 0.33)eaderTitle": {
        color: "white !important",
        
      },
      "& .MuiDataGrid-columnHeader": {
        backgroundColor: "transparent !important",
        color: "white !important",
      },
      "& .MuiDataGrid-window": {
        position: "absolute !important",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden !important",
      },
      
      "& .MuiDataGrid-virtualScroller": {
        position: "relative !important",
        overflow: "auto !important",
        height: "calc(100% - 56px) !important", // Altura total menos header
        maxHeight: "none !important",
      },
      
      "& .MuiDataGrid-virtualScrollerRenderZone": {
        position: "relative !important",
      },
      
      // ESCONDER COMPLETAMENTE O SCROLL NATIVO
      "& .MuiDataGrid-scrollbar": {
        display: "none !important",
      },
      
      "& .MuiDataGrid-scrollArea": {
        display: "none !important",
      },
      
      // HEADER FIXO
      "& .MuiDataGrid-columnHeaders": {
        backgroundColor: "transparent !important",
        color: "white !important",
        borderBottom: "1px solid rgba(255, 255, 255, 1)",
        position: "sticky !important", // fixa o header
        top: 0,
        zIndex: 10, // fica acima das linhas
        backdropFilter: "blur(100px)", // opcional: efeito vidro
      },
      
      // SEUS OUTROS ESTILOS...
      "& .MuiDataGrid-row": {
        backgroundColor: "#ffffff3f",
        borderRadius: "10px",
        marginBottom: "5px",
        marginTop: "10px",
      },
      
      "& .MuiDataGrid-row:hover": {
        backgroundColor: "#ffffff18",
        borderRadius: "10px",
        marginBottom: "5px",
        marginTop: "10px",
      },
      
      // SCROLLBAR PERSONALIZADO
      "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
      },
      
      "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "10px",
      },
      
      "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
        background: "rgba(255, 255, 255, 0.3)",
        borderRadius: "10px",
      },
      
      "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover": {
        background: "rgba(255, 255, 255, 0.5)",
      },
      
      // Para Firefox
      "& .MuiDataGrid-virtualScroller": {
        scrollbarWidth: "thin",
        marginLeft:"10px",
        scrollbarColor: "rgba(255,255,255,0.3) transparent",
      },
    }}
  />
</Box>
</Box>

</Box>
    </Box>
  </Box>
    );
};

export default Dashboard;

   {/* Tabela
           <Box gridColumn="span 8" gridRow="span 2" p="20px" borderRadius="15px" bgcolor="#ffffff2f">
          <Typography variant="h5" color="white" mb="10px">Campanhas</Typography>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            sx={{
              color: "white",
              border: "none",
              "& .MuiDataGrid-cell": { borderBottom: "1px solid rgba(255,255,255,0.2)" },
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          />
        </Box>
        */}