import {Box, IconButton, useTheme} from "@mui/material";
import {useContext} from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";


const Topbar = () =>{
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    return (
    
    <Box display ="flex" justifyContent="space-between" p={8}>

        
        {/*barra de busca*/}
        <Box display="flex" 
        backgroundColor="#E1E0E7"
        borderRadius= "3px"
        alignContent= "center"
   margin= "0 auto" 
        >

            <InputBase sx={{ml: 2, mr:30, flex:1, color:"black", "& input::placeholder": {
                color:"black",
                opacity:1,
            }, "& InputBase:hover":{
                backgroundColor: "#E1E0E7",
            }
            
            
            }} placeholder="Pesquisar" />
            <IconButton type ="button" sx={{p:1}}>
                <SearchIcon sx={{color:"#2B0031"}}/>
            </IconButton>
        </Box>
        
        {/*Icones*/}

        <Box display ="flex">
         
            <IconButton>
                <NotificationsOutlinedIcon/>
            </IconButton>

            <IconButton>
                   <SettingsOutlinedIcon/>
            </IconButton>

            <IconButton>
                   <PersonOutlinedIcon/>
            </IconButton>
        </Box>
    </Box>)
}

export default Topbar;