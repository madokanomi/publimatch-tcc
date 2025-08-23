import { Box } from "@mui/material";
import Header from "../../components/Header.jsx";

const Dashboard = () =>{
    return (
    
    <Box ml="25px">
        <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Bem Vindo!" subtitle="Dashboard" />
</Box>
    </Box>
    );
};

export default Dashboard;