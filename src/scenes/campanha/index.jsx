import { Box, Typography , useTheme} from "@mui/material";
import { DataGrid} from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataTeam } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined"
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";

const Campanha = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const columns = [
        {
            field: "id", headerName: "ID"
        },
        {
            field: "name", 
            headerName: "Nome", 
            flex: 1, 
            cellClassName: "name-column--cell",
        },
        {
                field: "age", 
            headerName: "Idade", 
            type: "number",
            headerAlign: "left",
            align: "left",
          
        },
            {
                field: "phone", 
            headerName: "Telefone", 
            flex: 1,
          
        },
        {
                field: "email", 
            headerName: "Email", 
            flex: 1,
          
        },
          {
                field: "acess", 
            headerName: "Nível de acesso", 
            flex: 1,
            renderCell: ({row: {access}}) => {
                return( 
                    <Box
                    width="60%"
                    m="0 auto"
                    p="5px"
                    display="flex"
                    justifyContent="center"
                    backgroundColor={
                        access == "Admin"
                        ? colors.greenAccent[600]
                        : colors.greenAccent[700]
                    }
                    borderRadius="4px"
                    >
                    {access ==="admin" && <AdminPanelSettingsOutlinedIcon/>}
                       {access ==="manager" && <SecurityOutlinedIcon/>}
                          {access ==="user" && <LockOpenOutlinedIcon/>}
                          <Typography color={colors.grey[100]} sx={{ml:"5px"}}>
                          {access}
                          </Typography>
                    
                    </Box>
                );
            },
          
        },
    ];


    return(
        <Box ml="25px">
            <Header title="Campanha" subtitle="Gerencie e cadastre suas campanhas" />
            <Box
            m="40px 0 0 0"
            height="75vh"
            sx={{
                "& .MuiDataGrid-root":{
                    border: "none",
                },
                "& .MuiDataGrid-cell":{
                    borderBottom: "none",
                },
                "& .name-column-cell": {
                    color: colors.greenAccent[300]
                },
                "& .MuiDataGrid-columnHeaders":{
                    backgroundColor: colors.blueAccent[700],
                    borderBottom:"none"
                },
                "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.primary[400],
                },
                "& .MuiDataGrid-footerContainer": {
                    borderTop: "none", 
                    backgroundColor: colors.blueAccent[700],
                },
            }}
            
            
            >
                <DataGrid
                rows={mockDataTeam}
                columns={columns}
                />
                </Box>
        </Box>
    )
}

export default Campanha;