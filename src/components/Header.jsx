import { Typography, Box, useTheme } from "@mui/material";
import {tokens} from "../theme";

const Header = ({title, subtitle}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
         <Box mb="10px" top="100px">
        <Typography variant="h1" color={colors.grey[100]}
        fontWeight="bold" 
        sx={{mb:"13px", lineHeight: "0.4", fontSize: "54px", 
            color: "#FFFFFF",
textShadow: "0px 0px 5.6px rgba(0, 0, 0, 0.25)",
}}>
            {title}
            </Typography>
        <Typography variant="h4" color={"#ff00d4ff"} fontWeight={"600"}>
            {subtitle}
            </Typography>
    </Box>
);
}

export default Header;