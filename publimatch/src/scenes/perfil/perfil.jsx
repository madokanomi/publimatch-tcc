import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Avatar, Divider, Button, Chip, Rating
  // Removi os imports que eram apenas para o seletor se não forem mais usados
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Header from "../../components/Header";
import { useAuth } from '../../auth/AuthContext'; // 👈 PASSO 1: Importa o hook de autenticação
import { ROLES } from '../../data/mockUsers'; // Importa ROLES para a verificação

// Ícones (sem alterações)
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

// =================================================================
// OBS: O array mockUsers foi movido para 'src/data/mockUsers.js'
// =================================================================


// =================================================================
// As Views (PerfilAgenteView e PerfilInfluenciadorView)
// não precisam de nenhuma alteração.
// Cole-as aqui exatamente como estavam.
// =================================================================

// ... (componente PerfilAgenteView aqui)
const ProfilePaper = styled(Paper)(({ theme }) => ({
  borderRadius: "20px",
  padding: theme.spacing(4),
  background: "linear-gradient(180deg, rgba(219, 29, 181, 0.08) 0%, rgba(34, 22, 164, 0.08) 100%)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  color: "#fff",
  textAlign: 'center',
}));

const KpiCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    textAlign: 'center',
    borderRadius: '15px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: 'white',
    border: "1px solid rgba(255, 255, 255, 0.1)",
    width: '100%', 
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: `0px 10px 20px rgba(219, 29, 181, 0.2)`,
    }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    color: theme.palette.primary.light,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(3),
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
}));

const PerfilAgenteView = ({ user }) => {
    return (
        <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
                <ProfilePaper>
                    <Avatar
                        src={user.avatar}
                        sx={{ width: 150, height: 150, margin: '0 auto 20px', border: '4px solid #db1db5ff' }}
                    />
                    <Typography variant="h3" fontWeight="bold">{user.username}</Typography>
                    <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ mb: 1 }}>{user.cargo}</Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} color="rgba(255,255,255,0.7)">
                       <BusinessIcon fontSize="small"/>
                       <Typography variant="body1">{user.empresa}</Typography>
                    </Box>
                    <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ mt: 3, maxWidth: '600px', mx: 'auto' }}>
                       "{user.bio}"
                    </Typography>
                    <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)", my: 4 }} />
                    <Box width="100%">
                        <SectionTitle variant="h6" sx={{color:"white"}}>Performance</SectionTitle>
                        {user.kpis ? (
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}><KpiCard><BusinessCenterIcon sx={{ fontSize: 32, mb: 1 }}/><Typography variant="h4" fontWeight="bold">{user.kpis.campanhasAtivas}</Typography><Typography variant="body2">Campanhas Ativas</Typography></KpiCard></Grid>
                                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}><KpiCard><MonetizationOnIcon sx={{ fontSize: 32, mb: 1 }}/><Typography variant="h4" fontWeight="bold">{user.kpis.orcamentoGerenciado}</Typography><Typography variant="body2">Orçamento</Typography></KpiCard></Grid>
                                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}><KpiCard><TrendingUpIcon sx={{ fontSize: 32, mb: 1 }}/><Typography variant="h4" fontWeight="bold">{user.kpis.taxaSucesso}</Typography><Typography variant="body2">Taxa de Sucesso</Typography></KpiCard></Grid>
                                <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}><KpiCard><GroupsIcon sx={{ fontSize: 32, mb: 1 }}/><Typography variant="h4" fontWeight="bold">{user.kpis.influencersGerenciados}</Typography><Typography variant="body2">Influencers</Typography></KpiCard></Grid>
                            </Grid>
                        ) : (
                            <Typography>Dados de performance não disponíveis.</Typography>
                        )}
                    </Box>
                    <Box width="100%" mt={4}>
                         <SectionTitle variant="h6" sx={{color:"white"}}>Contato</SectionTitle>
                         <Box display="flex" justifyContent="center" alignItems="center" gap={4} flexWrap="wrap">
                             <Box display="flex" alignItems="center" gap={1}>
                                <EmailIcon sx={{color: '#db1db5ff'}}/>
                                <Typography variant="body1">{user.email}</Typography>
                             </Box>
                             <Box display="flex" alignItems="center" gap={1}>
                                <PhoneIcon sx={{color: '#db1db5ff'}}/>
                                <Typography variant="body1">{user.telefone}</Typography>
                             </Box>
                         </Box>
                    </Box>
                </ProfilePaper>
            </Grid>
        </Grid>
    );
};
// ... (componente PerfilInfluenciadorView aqui)
const PerfilInfluenciadorView = ({ user }) => {
    const [activeTab, setActiveTab] = useState("Sobre");
    const renderTabContent = () => <Typography sx={{color: 'white', textAlign:'center', p:3}}>Conteúdo da aba: {activeTab}</Typography>; 
    const tabs = ["Sobre", "Estatisticas", "Campanhas"];

    return (
      <Box height="calc(100vh - 120px)" overflow="auto" sx={{ "&::-webkit-scrollbar": { width: "10px" }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)" } }}>
        <Box sx={{ position: "relative", borderRadius: 3, background: `linear-gradient(135deg, rgba(67, 4, 66, 0.7) 0%, rgba(34, 1, 58, 0.85) 50%, rgba(42, 1, 35, 0.68) 100%), url(${user.imagemFundo})`, backgroundSize: "cover", p:4, color: 'white' }}>
          <Box display="flex" gap={2} flexDirection={{xs: 'column', md: 'row'}} alignItems="center">
            <Avatar src={user.avatar} sx={{ width: 120, height: 120, border: "4px solid white" }}/>
            <Box textAlign={{xs: 'center', md: 'left'}}>
              <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.9 }}>"{user.descricao}"</Typography>
              <Typography variant="h3" fontWeight="bold">{user.username}</Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}><PersonOutlinedIcon sx={{verticalAlign: 'middle'}}/> {user.nomeReal}, 25 anos</Typography>
              <Rating name="read-only" value={user.avaliacao} precision={0.1} readOnly />
              <Box display="flex" gap={1} mt={1} justifyContent={{xs: 'center', md: 'flex-start'}}>
                {user.categorias.map((cat, i) => (<Chip key={i} label={cat} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }} />))}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent="center" gap={2} my={2} sx={{borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)'}}>
            {tabs.map((tab) => (
                <Button key={tab} onClick={() => setActiveTab(tab)} sx={{ color: activeTab === tab ? 'primary.main' : 'white', fontWeight: 'bold' }}>{tab}</Button>
            ))}
        </Box>
        <Box>
            {renderTabContent()}
        </Box>
      </Box>
    );
};

// =================================================================
// COMPONENTE PRINCIPAL ATUALIZADO
// =================================================================
const Perfil = () => {
    // PASSO 2: Obter o usuário logado a partir do contexto.
    const { user } = useAuth();

    // Enquanto o usuário não é carregado do contexto, exibe uma mensagem.
    if (!user) {
        return (
            <Box m="20px">
                <Header title="Perfil" subtitle="Informações profissionais" />
                <Typography>Carregando perfil...</Typography>
            </Box>
        );
    }
    
    return(
        <Box m="20px">
            <Header title="Perfil" subtitle="Informações profissionais" />
            
            {/* PASSO 3: O seletor foi removido.
              A lógica de renderização condicional agora funciona
              diretamente com o 'user' vindo do useAuth().
            */}
            {(user.role === ROLES.AD_AGENT || user.role === ROLES.INFLUENCER_AGENT) && (
                <PerfilAgenteView user={user} />
            )}

            {user.role === ROLES.INFLUENCER && (
                <PerfilInfluenciadorView user={user} />
            )}
        </Box>
    );
};

export default Perfil;