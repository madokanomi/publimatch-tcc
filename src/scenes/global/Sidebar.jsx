import { useState } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';
import { Box, IconButton, Typography, useTheme} from '@mui/material';
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import ThreePIcon from '@mui/icons-material/ThreeP';
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimeLineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import SearchIcon from '@mui/icons-material/Search';
import HotelClassIcon from '@mui/icons-material/HotelClass';
import foto from "../../assets/user.png"
import CampaignIcon from '@mui/icons-material/Campaign';
import ChatIcon from '@mui/icons-material/Chat';

const Item = ({title, to, icon, selected, setSelected }) =>
{
const theme = useTheme();
const colors = tokens(theme.palette.mode);
return (
  <MenuItem active={selected == title} style={{ color: colors.grey[100]
  }}
  onClick={()=> setSelected(title)}
  icon={icon}>
  <Typography 
  sx={
    {
      fontWeight:"bold",
      fontsize:"40px",
    }
  }>{title}</Typography>
  <Link to={to}/>
  </MenuItem>
)
}


const Sidebar = () =>{
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selected, setSelected] = useState("Dashboard");

    return (
        <Box 
 sx={{
    "& .pro-sidebar-inner": {
      background: "linear-gradient(150deg, rgba(15, 28, 149, 0.5), rgba(233, 24, 118, 0.6)), url('../../assets/background.png')",
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
      padding: "12px 25px !important",
      margin: "10px 18px",
      borderRadius: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      fontSize: "1.25rem",
      fontWeight: "600",
      transition: "all 0.3s ease",
    },

    "& .pro-inner-item .MuiTypography-root": {
      fontSize: "1.25rem !important",
      fontWeight: "bold !important",
    },

    "& .pro-inner-item:hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
      color: "#fff !important",
    },

    "& .pro-menu-item.active > .pro-inner-item": {
      background: "linear-gradient(90deg, rgba(216, 128, 166, 0.4),rgba(172, 34, 206, 0.5))",
      color: "#fff !important",
      borderRadius: "10px",
     transition: "all 0.3s ease",
    },

    /* ----------- ESTADO COLAPSADO ----------- */
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
      fontSize: "1.25rem",
      fontWeight: "600",
    },

    "& .pro-sub-menu .pro-inner-item:hover": {
      backgroundColor: "rgba(255,255,255,0.08)",
    },

    /* ----------- SUBMENU COLAPSADO ----------- */
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
  display: "none !important", // esconde o texto do submenu
},

"& .pro-sidebar.collapsed .pro-sub-menu .pro-arrow-wrapper": {
  display: "none !important", // remove setinha
},

"& .pro-sidebar.collapsed .pro-sub-menu .pro-menu-item": {
  paddingLeft: "0 !important",
  justifyContent: "center !important",
},

    /* ----------- ITENS DENTRO DO SUBMENU ----------- */
    "& .pro-sub-menu .pro-menu-item": {
      paddingLeft: "3px !important",   // identação expandida
      
    },

    "& .pro-sidebar.collapsed .pro-sub-menu .pro-menu-item": {
      paddingLeft: " !important",      // remove identação colapsado
      justifyContent: "center !important",
      
       /* esconde o texto */
    },
    "& .pro-sidebar.collapsed .pro-sub-menu .pro-inner-item .MuiTypography-root": {
    display: "none !important", /* esconde o texto */
    },


      }}> 

      <ProSidebar collapsed={isCollapsed}   style={{
    transition: "all 0.3s ease-in-out",
    width: isCollapsed ? "80px" : "300px",
    height: "1200px",
    borderRadius: "20px",        // arredondado
    margin: "20px 8px 0px 20px",              // afastar do canto
    overflow: "hidden",          // evitar que itens "furem" a borda
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)", // sombra suave
    /* Rounded rectangle */
background: "linear-gradient(0deg, rgba(34, 22, 164, 0.15), rgba(34, 22, 164, 0.15)), url(image.png)",
boxShadow: "0px 0px 25.8px 4px rgba(0, 0, 0, 0.25)",


  }}
>
        <Menu iconShape="square">
            <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon = {isCollapsed ? <MenuOutlinedIcon/> : undefined}
            style={{
                margin: "10px 0 20px 0",
                color: colors.grey[100],
                            
            }}
            >
            {!isCollapsed && (
                <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
                transition ="10s"
                >
                    <Typography variant="h1" style={{fontWeight:"Bold", fontSize:"50px"}}color={colors.grey[100]}>
                        Publimatch
                    </Typography>
                    <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                        <MenuOutlinedIcon />
                    </IconButton>

                </Box>
            )}
            </MenuItem>

            {/* usuario */}
            {!isCollapsed && (
                <Box mb="25px">
                    <Box display ="flex" 
                    justifyContent = "center"
                    alignItems="center"
                      flexDirection="column"
                    >

                      <img 
                      alt="profile-user"
                      width="180px"
                      height="180px"
                      

                      src={foto}
                      style={{cursor: "pointer", borderRadius: "50%", objectFit:"cover"}} />
                    </Box>

                    <Box textAlign="center">
                      <Typography 
                      variant="h2" 
                      color ={colors.grey[100]}
                      fontWeight="bold"
                      sx={{m: "10px 0 0 0"}}
                      >Felipe</Typography>
                      <Typography variant="h5" fontWeight="bold" color={"#ffffff"}>
                        Agente de Publicidade
                      </Typography>
                        <Typography variant="h7" color={colors.grey[100]}>
                        agente@agencia.com
                      </Typography>
                    </Box>
                </Box>
            )}

            {/* itens do menu */}
            <Box paddingLeft={isCollapsed ? undefined: "10%"}>
              <Item 
              title ="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              />


    
             <SubMenu 
  title={!isCollapsed ? "Influenciadores" : ""} 
    icon={<ThreePIcon/>} 
    style={{ color: colors.grey[100]}}
>
    <MenuItem 
        active={selected === "Pesquisa"}
        onClick={() => setSelected("Pesquisa")}
        icon={<SearchIcon/>}
    >
        <Link to="/influenciadores/pesquisa" />
        
        <Typography>Pesquisa </Typography>
    </MenuItem>
    <MenuItem
        active={selected === "Ranking"}
        onClick={() => setSelected("Ranking")}
        icon={<HotelClassIcon/>}
    >
        <Link to="/influenciadores/ranking" />
  <Typography>Ranking </Typography>
    </MenuItem>
</SubMenu>


               <Item 
              title ="Campanha"
              to="/campanha"
              icon={<CampaignIcon />}
              selected={selected}
              setSelected={setSelected}
              />
               <Item 
              title ="Conversas"
              to="/"
              icon={<ChatIcon />}
              selected={selected}
              setSelected={setSelected}
              />
                         <Item 
              title ="Calendário"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              />
             


            </Box>
        </Menu>
      </ProSidebar>


        </Box>

    ) 

}

export default Sidebar;