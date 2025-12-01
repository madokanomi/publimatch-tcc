import React, { useState, useEffect } from 'react'; // ✅ Importar useEffect
import { useParams } from 'react-router-dom'; // ✅ Importar para pegar o ID da URL
import axios from 'axios'; // ✅ Importar axios para chamadas à API
import {
  Box, Typography, Avatar, Button, Collapse, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, IconButton,
  Rating, TextField, Snackbar, Alert, CircularProgress, // ✅ Adicionar CircularProgress
} from "@mui/material";
import { Check, Close, KeyboardArrowDown, Flag } from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";

// ✅ ATENÇÃO: Os props que vinham de 'Sobrespec' não são mais necessários aqui.
// O componente agora gerencia seu próprio estado e lógica de diálogos.
const CampanhasInfluSpec = () => {
  const { id: influencerId } = useParams(); // ✅ Pegar o ID do influenciador da URL

  // ✅ Estados para os dados, carregamento e erros
  const [campaigns, setCampaigns] = useState({ invites: [], participating: [], history: [] });
   
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para controle do componente (seções e diálogos)
  const [openSections, setOpenSections] = useState({
    convites: true,
    participando: true,
    historico: true,
  });
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', text: '', onConfirm: () => {} });
  const [acceptFollowUpOpen, setAcceptFollowUpOpen] = useState(false);
  const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showFinalizeSuccess, setShowFinalizeSuccess] = useState(false);
 const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // ✅ useEffect para buscar os dados da API quando o componente for montado
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
        const token = userInfo?.token;
        if (!token) throw new Error('Utilizador não autenticado.');

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Chamada para o novo endpoint
        const { data } = await axios.get(`http://localhost:5001/api/influencers/${influencerId}/campaigns`, config);
        setCampaigns(data);

      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar as campanhas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [influencerId]); // A dependência garante que a busca seja refeita se o ID mudar


  // --- Funções de manipulação de estado (sem grandes alterações) ---
  const handleToggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCloseDialogs = () => {
    setConfirmationDialogOpen(false);
    setAcceptFollowUpOpen(false);
  };
  
  // AQUI: A lógica de aceitar/rejeitar precisará chamar a API no futuro
   const handleUpdateInvite = async (inviteId, status) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Faz a chamada para o novo endpoint do backend
      await axios.patch(`http://localhost:5001/api/invites/${inviteId}/status`, { status }, config);

      // Atualiza o estado local para remover o convite da lista de pendentes
      const acceptedInvite = campaigns.invites.find(inv => inv._id === inviteId);
      setCampaigns(prev => {
        const updatedInvites = prev.invites.filter(inv => inv._id !== inviteId);
        
        // Se foi aceito, adiciona a campanha à lista de "Participando"
        if (status === 'ACCEPTED' && acceptedInvite) {
            return {
                ...prev,
                invites: updatedInvites,
                participating: [...prev.participating, acceptedInvite.campaign],
            };
        }

        return { ...prev, invites: updatedInvites };
      });
      
      handleCloseDialogs(); // Fecha o diálogo de confirmação
      
      // Abre o diálogo de follow-up se aceito
      if (status === 'ACCEPTED') {
          setAcceptFollowUpOpen(true);
      } else {
        // Mostra um snackbar de sucesso se rejeitado
        setSnackbar({ open: true, message: 'Convite rejeitado com sucesso!', severity: 'success' });
      }

    } catch (err) {
      console.error("Erro ao atualizar o convite:", err);
      setError('Falha ao atualizar o status do convite. Tente novamente.');
      setSnackbar({ open: true, message: 'Erro ao atualizar o convite.', severity: 'error' });
    }
  };


  // ✅ FUNÇÕES ATUALIZADAS para chamar o handler principal
  const handleConfirmReject = (inviteId) => {
    handleUpdateInvite(inviteId, 'REJECTED');
  };

  const handleConfirmAccept = (inviteId) => {
    handleUpdateInvite(inviteId, 'ACCEPTED');
  };

  // ✅ FUNÇÕES DE CLIQUE ATUALIZADAS para passar o ID corretamente para o diálogo
  const handleRejectClick = (inviteId) => {
    setDialogContent({
      title: "Rejeitar Convite",
      text: "Certeza que deseja rejeitar essa campanha?",
      onConfirm: () => handleConfirmReject(inviteId), // Passa o ID para a função de confirmação
    });
    setConfirmationDialogOpen(true);
  };

   const fetchCampaigns = async () => {
        setIsLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
            const token = userInfo?.token;
            if (!token) throw new Error('Utilizador não autenticado.');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`http://localhost:5001/api/influencers/${influencerId}/campaigns`, config);
            setCampaigns(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao carregar as campanhas.');
        } finally {
            setIsLoading(false);
        }
    };
  
  const handleAcceptClick = (inviteId) => {
    setDialogContent({
      title: "Aceitar Convite",
      text: "Certeza que deseja participar dessa campanha?",
      onConfirm: () => handleConfirmAccept(inviteId), // Passa o ID para a função de confirmação
    });
    setConfirmationDialogOpen(true);
  };

   const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

    useEffect(() => {
        fetchCampaigns();
    }, [influencerId]);

    // ✅ 3. ESTE useEffect APENAS ESCUTA PELO EVENTO GLOBAL
    useEffect(() => {
        window.addEventListener('campaignsUpdated', fetchCampaigns);
        return () => {
            window.removeEventListener('campaignsUpdated', fetchCampaigns);
        };
    }, []); // O array vazio é importante aqui

  const handleOpenFinalizeDialog = () => setOpenFinalizeDialog(true);
  const handleCloseFinalizeDialog = () => { setOpenFinalizeDialog(false); setPassword(''); };
   const handleFinalizeClick = (campaignId) => {
    setDialogContent({
        title: "Solicitar Finalização",
        text: "Tem certeza que deseja enviar a solicitação para finalizar o contrato desta campanha?",
        onConfirm: () => handleConfirmFinalize(campaignId),
    });
    setConfirmationDialogOpen(true);
  };
  
  // ✅ FUNÇÃO ATUALIZADA para confirmar a finalização (agora sem senha)
  const handleConfirmFinalize = async (campaignId) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // A requisição agora não envia mais o corpo { password }
        const { data } = await axios.post(
            `http://localhost:5001/api/campaigns/${campaignId}/request-finalization`,
            {}, // Corpo da requisição vazio
            config
        );
        
        setSnackbar({ open: true, message: data.message, severity: 'success' });

    } catch (err) {
        const message = err.response?.data?.message || 'Ocorreu um erro.';
        setSnackbar({ open: true, message, severity: 'error' });
    } finally {
        handleCloseDialogs(); // Fecha o diálogo de confirmação genérico
    }
  };
  
  // ✅ Lógica para exibir loading ou erro
  if (isLoading) {
    return <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" textAlign="center" my={5}>{error}</Typography>;
  }

  return (
    <Box pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.17)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
         <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Convites Section - AGORA DINÂMICA */}
      <Box mb={2}>
        <Box onClick={() => handleToggleSection('convites')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <Typography variant="h4" fontWeight="bold" color="white"> Convites </Typography>
          <KeyboardArrowDown sx={{ color: 'white', transform: openSections.convites ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
        </Box>
        <Collapse in={openSections.convites}>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            {/* ✅ Mapeando os convites recebidos da API */}
            {campaigns.invites.length > 0 ? (
              campaigns.invites.map(invite => (
                <Box key={invite._id} display="flex" alignItems="center" p={2} sx={{ background: "linear-gradient(1deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.27))", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                 <Avatar variant="rounded" src={invite.campaign?.logo} sx={{ width: 70, height: 70, mr: 2, p: 0.5, borderRadius:"20px", backgroundSize:'cover' }} />
                  <Box flexGrow={1}>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">Campanha</Typography>
                    {/* ✅ CORREÇÃO APLICADA */}
                    <Typography variant="h6" color="white" fontWeight="bold">{invite.campaign?.title || 'Campanha Indisponível'}</Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                      {/* ✅ CORREÇÃO APLICADA */}
                      Prazo: {invite.campaign?.endDate ? new Date(invite.campaign.endDate).toLocaleDateString('pt-BR') : 'N/D'}
                    </Typography>
                    <Typography variant="caption" display="block" mt={0.5} color="rgba(255,255,255,0.7)">
                      {/* ✅ CORREÇÃO PRINCIPAL APLICADA AQUI */}
                      Enviado por: <strong>{invite.adAgent?.name || 'Usuário Removido'}</strong>
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton onClick={() => handleRejectClick(invite._id)} sx={{ backgroundColor: "rgba(255, 82, 82, 0.2)", "&:hover": { backgroundColor: "rgba(255, 82, 82, 0.4)" } }}>
                      <Close sx={{ color: "#ff5252" }} />
                    </IconButton>
                    <IconButton onClick={() => handleAcceptClick(invite._id)} sx={{ backgroundColor: "rgba(105, 240, 174, 0.2)", "&:hover": { backgroundColor: "rgba(105, 240, 174, 0.4)" } }}>
                      <Check sx={{ color: "#69f0ae" }} />
                    </IconButton>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography color="rgba(255,255,255,0.7)" fontStyle="italic">Nenhum convite pendente.</Typography>
            )}
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Participando de Section - AGORA DINÂMICA */}
      <Box mb={2}>
        <Box onClick={() => handleToggleSection('participando')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <Typography variant="h4" fontWeight="bold" color="white"> Participando de </Typography>
          <KeyboardArrowDown sx={{ color: 'white', transform: openSections.participando ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
        </Box>
        <Collapse in={openSections.participando}>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {/* ✅ Removido mock 'participandoCampanhas' e usando 'campaigns.participating' */}
            {campaigns.participating.length > 0 ? (
              campaigns.participating.map((campanha) => (
                <Box key={campanha._id} p={2.5} sx={{ backgroundColor: "rgba(255,255,255,0.08)", 
                  backgroundImage: `linear-gradient(90deg, rgba(22, 7, 83, 0.88), rgba(81, 4, 61, 0.73)), url(${campanha.logo})`,
                  backgroundSize:'cover',backgroundPosition:"center",
                borderRadius: "15px", border: "1px solid rgba(255, 255, 255, 0.33)" }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" flex={2.5} gap={2}>
                          {/* NOTA: O 'bgColor' do mock não existe no model, removido por enquanto */} 
                          <Box sx={{ width: 60, height: 60, borderRadius: "12px", flexShrink: 0, backgroundImage: `url(${campanha.logo})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                          <Box>
                              <Typography variant="h6" color="white" fontWeight="bold" noWrap>{campanha.title}</Typography>
                              <Typography variant="body2" color="rgba(255,255,255,0.6)">{new Date(campanha.startDate).toLocaleDateString('pt-BR')}</Typography>
                          </Box>
                        </Box>
                        <Box flex={5} display="flex" justifyContent="space-around" alignItems="center">
                          {/* DADOS DE ESTATÍSTICAS - precisam ser mapeados para o que existe no seu model */}
                          <Box textAlign="center">
                            <Typography variant="caption" color="rgba(255,255,255,0.6)">Conversão</Typography>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: "#2196f3" }}>{campanha.conversion || 'N/A'}</Typography>
                          </Box>
                          <Box textAlign="center">
                            <Typography variant="caption" color="rgba(255,255,255,0.6)">Visualizações</Typography>
                            <Typography variant="h6" color="white" fontWeight="bold">{campanha.views?.toLocaleString('pt-BR') || 'N/A'}</Typography>
                          </Box>
                            <Box textAlign="center">
                            <Typography variant="caption" color="rgba(255,255,255,0.6)">Engajamento</Typography>
                            <Typography variant="h6" color="white" fontWeight="bold">{campanha.engagement?.toLocaleString('pt-BR') || 'N/A'}</Typography>
                          </Box>
                        </Box>
                    </Box>
                    {/* A lógica de showButtons pode ser baseada no status da campanha, se necessário */}
                    <Box mt={2} pt={2} borderTop="1px solid rgba(255,255,255,0.1)" display="flex" justifyContent="center" gap={1}>
                     <Button onClick={() => handleFinalizeClick(campanha._id)}  size="medium" variant="outlined" startIcon={<Flag />} sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", textTransform: "none", borderRadius: "10px", "&:hover": { borderColor: "white" } }}>Finalizar Contrato</Button>
                    </Box>
                </Box>
              ))
            ) : (
              <Typography color="rgba(255,255,255,0.7)" fontStyle="italic">Não está participando de nenhuma campanha no momento.</Typography>
            )}
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Histórico de Campanhas Section - AGORA DINÂMICA */}
      <Box>
        <Box onClick={() => handleToggleSection('historico')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <Typography variant="h4" fontWeight="bold" color="white"> Histórico de Campanhas </Typography>
          <KeyboardArrowDown sx={{ color: 'white', transform: openSections.historico ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
        </Box>
        <Collapse in={openSections.historico}>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {/* ✅ Removido mock 'campanhasFinalizadas' e usando 'campaigns.history' */}
            {campaigns.history.length > 0 ? (
              campaigns.history.map((campanha) => (
                <Box key={campanha._id} display="flex" alignItems="center" p={3} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s ease", "&:hover": { backgroundColor: "rgba(255,255,255,0.12)", transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(0,0,0,0.3)" } }}>
                  <Box sx={{ width: 60, height: 60, borderRadius: "12px", mr: 3, flexShrink: 0, backgroundImage: `url(${campanha.logo})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                  <Box flex={1} display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" color="white" fontWeight="bold" mb={0.5}>Campanha</Typography>
                      <Typography variant="h5" color="white" fontWeight="bold" mb={0.5}>{campanha.title}</Typography>
                      <Typography variant="h6" color="rgba(255,255,255,0.6)">{new Date(campanha.endDate).toLocaleDateString('pt-BR')}</Typography>
                    </Box>
                    <Box textAlign="center" mx={3}>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Conversão</Typography>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: "#4caf50" }}>{campanha.conversion || 'N/A'}</Typography>
                    </Box>
                    <Box textAlign="center" mx={3}>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Visualizações</Typography>
                      <Typography variant="h6" color="white" fontWeight="bold">{campanha.views?.toLocaleString('pt-BR') || 'N/A'}</Typography>
                    </Box>
                    <Box textAlign="center" mx={3}>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Engajamento</Typography>
                      <Typography variant="h6" color="white" fontWeight="bold">{campanha.engagement?.toLocaleString('pt-BR') || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography color="rgba(255,255,255,0.7)" fontStyle="italic">Nenhuma campanha no histórico.</Typography>
            )}
          </Box>
        </Collapse>
      </Box>
    <Dialog open={confirmationDialogOpen} onClose={handleCloseDialogs} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.06)", color: "#FFFFFF", backdropFilter: "blur(10px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{dialogContent.title}</DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>{dialogContent.text}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
            <Button onClick={handleCloseDialogs} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Cancelar</Button>
            <Button onClick={dialogContent.onConfirm} autoFocus sx={{ fontWeight: 'bold', color: "#d900c7", backgroundColor: '#ffffffff', "&:hover": { backgroundColor: '#e9e9e9ff' } }}> Confirmar </Button>
        </DialogActions>
      </Dialog>
      {/* Dialogs */}
      <Dialog open={confirmationDialogOpen} onClose={handleCloseDialogs} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.36)", color: "#FFFFFF", backdropFilter: "blur(10px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{dialogContent.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}>{dialogContent.text}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={handleCloseDialogs} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Cancelar</Button>
          <Button onClick={dialogContent.onConfirm} autoFocus sx={{ fontWeight: 'bold', color: "#d900c7", backgroundColor: '#ffffffff', "&:hover": { backgroundColor: '#e9e9e9ff' } }}> Confirmar </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={acceptFollowUpOpen} onClose={handleCloseDialogs} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.26)", color: "#FFFFFF", backdropFilter: "blur(20px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Convite Aceito!</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)" }}> Notificação enviada ao publicitário. Deseja enviar uma mensagem? </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={handleCloseDialogs} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Fechar</Button>
          <Button onClick={handleCloseDialogs} autoFocus sx={{ fontWeight: 'bold', color: "#d900c7", backgroundColor: '#ffffffff', "&:hover": { backgroundColor: '#e9e9e9ff' } }}> Enviar Mensagem </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openFinalizeDialog} onClose={handleCloseFinalizeDialog} sx={{ "& .MuiPaper-root": { backgroundColor: "rgba(255, 255, 255, 0.26)", color: "#FFFFFF", backdropFilter: "blur(20px)", borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Finalizar Contrato</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 2 }}>
            Para solicitar a finalização do contrato, por favor, confirme sua senha.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Senha"
            type="password"
            fullWidth
            variant="filled"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ 
              '& .MuiFilledInput-root': { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '10px' },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiFilledInput-input': { color: 'white' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 16px' }}>
          <Button onClick={handleCloseFinalizeDialog} sx={{ color: "rgba(255, 255, 255, 0.7)" }}>Cancelar</Button>
          <Button onClick={handleConfirmFinalize} disabled={!password} autoFocus sx={{ fontWeight: 'bold', color: "#d900c7", backgroundColor: '#ffffffff', "&:hover": { backgroundColor: '#e9e9e9ff' }, '&.Mui-disabled': { backgroundColor: 'rgba(255, 255, 255, 0.5)' } }}>
            Solicitar Finalização
          </Button>
        </DialogActions>
      </Dialog>
     

    </Box>
  );
};

export default CampanhasInfluSpec;

