import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Rating,
  TextField,
} from "@mui/material";
import {
  Check,
  Close,
  KeyboardArrowDown,
  Flag,
} from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";

const CampanhasInfluSpec = () => {
  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    convites: true,
    participando: true,
    historico: true,
  });

  // State for the confirmation dialog (accept/reject)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', text: '', onConfirm: () => {} });
  const [acceptFollowUpOpen, setAcceptFollowUpOpen] = useState(false);

  // State for the finalize contract dialog
  const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showFinalizeSuccess, setShowFinalizeSuccess] = useState(false); // You might want to move the Snackbar here too or handle it via props

  const handleToggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCloseDialogs = () => {
    setConfirmationDialogOpen(false);
    setAcceptFollowUpOpen(false);
  };

  const handleConfirmReject = () => {
    console.log("Campanha Rejeitada");
    handleCloseDialogs();
  };

  const handleConfirmAccept = () => {
    console.log("Campanha Aceita");
    handleCloseDialogs();
    setAcceptFollowUpOpen(true);
  };

  const handleRejectClick = () => {
    setDialogContent({
      title: "Rejeitar Convite",
      text: "Certeza que deseja rejeitar essa campanha?",
      onConfirm: handleConfirmReject,
    });
    setConfirmationDialogOpen(true);
  };
  
  const handleAcceptClick = () => {
    setDialogContent({
      title: "Aceitar Convite",
      text: "Certeza que deseja participar dessa campanha?",
      onConfirm: handleConfirmAccept,
    });
    setConfirmationDialogOpen(true);
  };

  const handleOpenFinalizeDialog = () => {
    setOpenFinalizeDialog(true);
  };

  const handleCloseFinalizeDialog = () => {
    setOpenFinalizeDialog(false);
    setPassword('');
  };

  const handleConfirmFinalize = () => {
    console.log("Solicitação de finalização enviada");
    handleCloseFinalizeDialog();
    setShowFinalizeSuccess(true); // This state would trigger a Snackbar, which should also be moved here if desired.
  };

  // Mock data for campaigns
  const participandoCampanhas = [
    { logo: "https://www.insiderstore.com.br/cdn/shop/files/insider-logo-horizontal-branco.png?v=1646765790", nome: "Divulgação - Insider", data: "07/10/2024", avaliacao: 4.8, conversao: "83% - Bom", conversaoColor: "#2196f3", visualizacoes: "1.425.095", engajamento: "450.250", tempo: "34 Dias", bgColor: "#1c1c1e", showButtons: true },
  ];
  const campanhasFinalizadas = [
    { logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/2560px-Nintendo.svg.png", nome: "Nintendo Switch 2", data: "02/06/2025", avaliacao: 5.0, conversao: "93% - Excelente", conversaoColor: "#4caf50", visualizacoes: "18.234.910", engajamento: "450.250", tempo: "92 Dias", bgColor: "#e60012" },
    { logo: "https://play-lh.googleusercontent.com/nO6_gaqx-ZMCL5qhHIk1If5UAe2VDDJpb8jh0KSUwQYYGZgJuJaltsOfwaLKOOrEq49l", nome: "Divulgação - LOCO", data: "01/02/2025", avaliacao: 4.0, conversao: "62% - Aceitável", conversaoColor: "#ff9800", visualizacoes: "123.420", engajamento: "450.250", tempo: "227 Dias", bgColor: "#ff6600" },
    { logo: "https://support.apple.com/library/APPLE/APPLECARE_ALLGEOS/SP852/sp852-iphone13-pro-max-colors-2x.png", nome: "iPhone 17 - Lançamento", data: "16/06/2025", avaliacao: 5.0, conversao: "100% - Excelente", conversaoColor: "#4caf50", visualizacoes: "44.124.750", engajamento: "450.250", tempo: "72 Dias", bgColor: "#f5f5f7", showButtons: false },
  ];

  return (
    <Box pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.17)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
      {/* Convites Section */}
      <Box mb={2}>
        <Box onClick={() => handleToggleSection('convites')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <Typography variant="h4" fontWeight="bold" color="white"> Convites </Typography>
          <KeyboardArrowDown sx={{ color: 'white', transform: openSections.convites ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
        </Box>
        <Collapse in={openSections.convites}>
          <Box mt={2}>
            <Box display="flex" alignItems="center" p={2} sx={{ background: "linear-gradient(1deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.27))", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Avatar variant="rounded" src="https://seeklogo.com/images/N/nintendo-switch-logo-304535BE43-seeklogo.com.png" sx={{ width: 56, height: 56, mr: 2, p: 0.5, backgroundColor: "#E60012", borderRadius:"10px" }} />
              <Box flexGrow={1}>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">Campanha</Typography>
                <Typography variant="h6" color="white" fontWeight="bold">Nintendo Switch 3</Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">Prazo: 13/06/2025</Typography>
                <Typography variant="caption" display="block" mt={0.5} color="rgba(255,255,255,0.7)">
                  Enviado por: <strong>AmigosPubli.org</strong>
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <IconButton onClick={handleRejectClick} sx={{ backgroundColor: "rgba(255, 82, 82, 0.2)", "&:hover": { backgroundColor: "rgba(255, 82, 82, 0.4)" } }}>
                  <Close sx={{ color: "#ff5252" }} />
                </IconButton>
                <IconButton onClick={handleAcceptClick} sx={{ backgroundColor: "rgba(105, 240, 174, 0.2)", "&:hover": { backgroundColor: "rgba(105, 240, 174, 0.4)" } }}>
                  <Check sx={{ color: "#69f0ae" }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Participando de Section */}
      <Box mb={2}>
        <Box onClick={() => handleToggleSection('participando')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <Typography variant="h4" fontWeight="bold" color="white"> Participando de </Typography>
          <KeyboardArrowDown sx={{ color: 'white', transform: openSections.participando ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
        </Box>
        <Collapse in={openSections.participando}>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {participandoCampanhas.map((campanha, index) => (
              <Box key={index} p={2.5} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" flex={2.5} gap={2}>
                    <Box sx={{ width: 60, height: 60, borderRadius: "12px", backgroundColor: campanha.bgColor, flexShrink: 0, backgroundImage: `url(${campanha.logo})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                    <Box>
                      <Typography variant="h6" color="white" fontWeight="bold" noWrap>{campanha.nome}</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.6)">{campanha.data}</Typography>
                    </Box>
                  </Box>
                  <Box flex={5} display="flex" justifyContent="space-around" alignItems="center">
                      <Box textAlign="center">
                          <Typography variant="caption" color="rgba(255,255,255,0.6)">Avaliação média</Typography>
                          <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                            <Rating name="read-only" value={campanha.avaliacao} precision={0.1} readOnly size="small" emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />} />
                            <Typography variant="body2" color="white" fontWeight="bold">{campanha.avaliacao.toFixed(1)}</Typography>
                          </Box>
                      </Box>
                      <Box textAlign="center">
                          <Typography variant="caption" color="rgba(255,255,255,0.6)">Conversão</Typography>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: campanha.conversaoColor }}>{campanha.conversao}</Typography>
                      </Box>
                      <Box textAlign="center">
                          <Typography variant="caption" color="rgba(255,255,255,0.6)">Visualizações Atingidas</Typography>
                          <Typography variant="h6" color="white" fontWeight="bold">{campanha.visualizacoes}</Typography>
                      </Box>
                       <Box textAlign="center">
                          <Typography variant="caption" color="rgba(255,255,255,0.6)">Engajamento</Typography>
                          <Typography variant="h6" color="white" fontWeight="bold">{campanha.engajamento}</Typography>
                      </Box>
                       <Box textAlign="center">
                          <Typography variant="caption" color="rgba(255,255,255,0.6)">Tempo desde a publicação</Typography>
                          <Typography variant="body1" color="white" fontWeight="bold">{campanha.tempo}</Typography>
                      </Box>
                  </Box>
                </Box>
                {campanha.showButtons && (
                  <Box mt={2} pt={2} borderTop="1px solid rgba(255,255,255,0.1)" display="flex" justifyContent="center" gap={1}>
                      <Button onClick={handleOpenFinalizeDialog} size="medium" variant="outlined" startIcon={<Flag />} sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", textTransform: "none", borderRadius: "10px", "&:hover": { borderColor: "white" } }}>Finalizar Contrato</Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Histórico de Campanhas Section */}
      <Box>
        <Box onClick={() => handleToggleSection('historico')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <Typography variant="h4" fontWeight="bold" color="white"> Histórico de Campanhas </Typography>
          <KeyboardArrowDown sx={{ color: 'white', transform: openSections.historico ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
        </Box>
        <Collapse in={openSections.historico}>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {campanhasFinalizadas.map((campanha, index) => (
              <Box key={index} display="flex" alignItems="center" p={3} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s ease", "&:hover": { backgroundColor: "rgba(255,255,255,0.12)", transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(0,0,0,0.3)" } }}>
                <Box sx={{ width: 60, height: 60, borderRadius: "12px", backgroundColor: campanha.bgColor, mr: 3, flexShrink: 0, backgroundImage: `url(${campanha.logo})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
                <Box flex={1} display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="white" fontWeight="bold" mb={0.5}>Campanha</Typography>
                    <Typography variant="h5" color="white" fontWeight="bold" mb={0.5}>{campanha.nome}</Typography>
                    <Typography variant="h6" color="rgba(255,255,255,0.6)">{campanha.data}</Typography>
                  </Box>
                  <Box textAlign="center" mx={3}>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Avaliação média</Typography>
                    <Box display="flex" gap={0.3} justifyContent="center" mb={0.5}>
                      {[...Array(5)].map((_, i) => (<StarIcon key={i} sx={{ color: i < Math.floor(campanha.avaliacao) ? "#FFD700" : "rgba(255,255,255,0.3)", fontSize: 20 }}/>))}
                    </Box>
                    <Typography variant="body2" color="white" fontWeight="bold">{campanha.avaliacao.toFixed(1)}</Typography>
                  </Box>
                  <Box textAlign="center" mx={3}>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Conversão</Typography>
                    <Typography variant="body1" fontWeight="bold" sx={{ color: campanha.conversaoColor }}>{campanha.conversao}</Typography>
                  </Box>
                  <Box textAlign="center" mx={3}>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Visualizações Atingidas</Typography>
                    <Typography variant="h6" color="white" fontWeight="bold">{campanha.visualizacoes}</Typography>
                  </Box>
                  <Box textAlign="center" mx={3}>
                    <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Engajamento</Typography>
                    <Typography variant="h6" color="white" fontWeight="bold">{campanha.engajamento}</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Tempo desde a publicação</Typography>
                    <Typography variant="body1" color="white" fontWeight="bold">{campanha.tempo}</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>

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

//  const participandoCampanhas = [
//           { logo: "https://www.insiderstore.com.br/cdn/shop/files/insider-logo-horizontal-branco.png?v=1646765790", nome: "Divulgação - Insider", data: "07/10/2024", avaliacao: 4.8, conversao: "83% - Bom", conversaoColor: "#2196f3", visualizacoes: "1.425.095", engajamento: "450.250", tempo: "34 Dias", bgColor: "#1c1c1e", showButtons: true },
//         ];
//         const campanhasFinalizadas = [
//           { logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/2560px-Nintendo.svg.png", nome: "Nintendo Switch 2", data: "02/06/2025", avaliacao: 5.0, conversao: "93% - Excelente", conversaoColor: "#4caf50", visualizacoes: "18.234.910", engajamento: "450.250", tempo: "92 Dias", bgColor: "#e60012" },
//           { logo: "https://play-lh.googleusercontent.com/nO6_gaqx-ZMCL5qhHIk1If5UAe2VDDJpb8jh0KSUwQYYGZgJuJaltsOfwaLKOOrEq49l", nome: "Divulgação - LOCO", data: "01/02/2025", avaliacao: 4.0, conversao: "62% - Aceitável", conversaoColor: "#ff9800", visualizacoes: "123.420", engajamento: "450.250", tempo: "227 Dias", bgColor: "#ff6600" },
//           { logo: "https://support.apple.com/library/APPLE/APPLECARE_ALLGEOS/SP852/sp852-iphone13-pro-max-colors-2x.png", nome: "iPhone 17 - Lançamento", data: "16/06/2025", avaliacao: 5.0, conversao: "100% - Excelente", conversaoColor: "#4caf50", visualizacoes: "44.124.750", engajamento: "450.250", tempo: "72 Dias", bgColor: "#f5f5f7", showButtons: false },
//         ];
//         return (
//           <Box pl={5} pr={5} sx={{backgroundColor: "rgba(27, 27, 27, 0.17)", borderRadius:"20px", p:3, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)"}}>
//             <Box mb={2}>
//               <Box onClick={() => handleToggleSection('convites')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
//                 <Typography variant="h4" fontWeight="bold" color="white"> Convites </Typography>
//                 <KeyboardArrowDown sx={{ color: 'white', transform: openSections.convites ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
//               </Box>
//               <Collapse in={openSections.convites}>
//                 <Box mt={2}>
//                   <Box display="flex" alignItems="center" p={2} sx={{ background: "linear-gradient(1deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.27))", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
//                     <Avatar variant="rounded" src="https://seeklogo.com/images/N/nintendo-switch-logo-304535BE43-seeklogo.com.png" sx={{ width: 56, height: 56, mr: 2, p: 0.5, backgroundColor: "#E60012", borderRadius:"10px" }} />
//                     <Box flexGrow={1}>
//                       <Typography variant="body2" color="rgba(255,255,255,0.7)">Campanha</Typography>
//                       <Typography variant="h6" color="white" fontWeight="bold">Nintendo Switch 3</Typography>
//                       <Typography variant="caption" color="rgba(255,255,255,0.7)">Prazo: 13/06/2025</Typography>
//                       <Typography variant="caption" display="block" mt={0.5} color="rgba(255,255,255,0.7)">
//                         Enviado por: <strong>AmigosPubli.org</strong>
//                       </Typography>
//                     </Box>
//                     <Box display="flex" gap={1}>
//                       <IconButton onClick={handleRejectClick} sx={{ backgroundColor: "rgba(255, 82, 82, 0.2)", "&:hover": { backgroundColor: "rgba(255, 82, 82, 0.4)" } }}>
//                         <Close sx={{ color: "#ff5252" }} />
//                       </IconButton>
//                       <IconButton onClick={handleAcceptClick} sx={{ backgroundColor: "rgba(105, 240, 174, 0.2)", "&:hover": { backgroundColor: "rgba(105, 240, 174, 0.4)" } }}>
//                         <Check sx={{ color: "#69f0ae" }} />
//                       </IconButton>
//                     </Box>
//                   </Box>
//                 </Box>
//               </Collapse>
//             </Box>
//             <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />
//             <Box mb={2}>
//               <Box onClick={() => handleToggleSection('participando')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
//                 <Typography variant="h4" fontWeight="bold" color="white"> Participando de </Typography>
//                 <KeyboardArrowDown sx={{ color: 'white', transform: openSections.participando ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
//               </Box>
//               <Collapse in={openSections.participando}>
//                 <Box display="flex" flexDirection="column" gap={2} mt={2}>
//                   {participandoCampanhas.map((campanha, index) => (
//                     <Box key={index} p={2.5} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
//                       <Box display="flex" alignItems="center" justifyContent="space-between">
//                         <Box display="flex" alignItems="center" flex={2.5} gap={2}>
//                           <Box sx={{ width: 60, height: 60, borderRadius: "12px", backgroundColor: campanha.bgColor, flexShrink: 0, backgroundImage: `url(${campanha.logo})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
//                           <Box>
//                             <Typography variant="h6" color="white" fontWeight="bold" noWrap>{campanha.nome}</Typography>
//                             <Typography variant="body2" color="rgba(255,255,255,0.6)">{campanha.data}</Typography>
//                           </Box>
//                         </Box>
//                         <Box flex={5} display="flex" justifyContent="space-around" alignItems="center">
//                             <Box textAlign="center">
//                                 <Typography variant="caption" color="rgba(255,255,255,0.6)">Avaliação média</Typography>
//                                 <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
//                                   <Rating name="read-only" value={campanha.avaliacao} precision={0.1} readOnly size="small" emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />} />
//                                   <Typography variant="body2" color="white" fontWeight="bold">{campanha.avaliacao.toFixed(1)}</Typography>
//                                 </Box>
//                             </Box>
//                             <Box textAlign="center">
//                                 <Typography variant="caption" color="rgba(255,255,255,0.6)">Conversão</Typography>
//                                 <Typography variant="body1" fontWeight="bold" sx={{ color: campanha.conversaoColor }}>{campanha.conversao}</Typography>
//                             </Box>
//                             <Box textAlign="center">
//                                 <Typography variant="caption" color="rgba(255,255,255,0.6)">Visualizações Atingidas</Typography>
//                                 <Typography variant="h6" color="white" fontWeight="bold">{campanha.visualizacoes}</Typography>
//                             </Box>
//                              <Box textAlign="center">
//                                 <Typography variant="caption" color="rgba(255,255,255,0.6)">Engajamento</Typography>
//                                 <Typography variant="h6" color="white" fontWeight="bold">{campanha.engajamento}</Typography>
//                             </Box>
//                              <Box textAlign="center">
//                                 <Typography variant="caption" color="rgba(255,255,255,0.6)">Tempo desde a publicação</Typography>
//                                 <Typography variant="body1" color="white" fontWeight="bold">{campanha.tempo}</Typography>
//                             </Box>
//                         </Box>
//                       </Box>
//                        {campanha.showButtons && (
//                           <Box mt={2} pt={2} borderTop="1px solid rgba(255,255,255,0.1)" display="flex" justifyContent="center" gap={1}>
//                               <Button onClick={handleOpenFinalizeDialog} size="medium" variant="outlined" startIcon={<Flag />} sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", textTransform: "none", borderRadius: "10px", "&:hover": { borderColor: "white" } }}>Finalizar Contrato</Button>
//                           </Box>
//                       )}
//                     </Box>
//                   ))}
//                 </Box>
//               </Collapse>
//             </Box>
//             <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />
//              <Box>
//                 <Box onClick={() => handleToggleSection('historico')} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
//                   <Typography variant="h4" fontWeight="bold" color="white"> Histórico de Campanhas </Typography>
//                   <KeyboardArrowDown sx={{ color: 'white', transform: openSections.historico ? 'rotate(0deg)' : 'rotate(-180deg)', transition: 'transform 0.3s' }} />
//                 </Box>
//                 <Collapse in={openSections.historico}>
//                   <Box display="flex" flexDirection="column" gap={2} mt={2}>
//                     {campanhasFinalizadas.map((campanha, index) => (
//                       <Box key={index} display="flex" alignItems="center" p={3} sx={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s ease", "&:hover": { backgroundColor: "rgba(255,255,255,0.12)", transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(0,0,0,0.3)" } }}>
//                         <Box sx={{ width: 60, height: 60, borderRadius: "12px", backgroundColor: campanha.bgColor, mr: 3, flexShrink: 0, backgroundImage: `url(${campanha.logo})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
//                         <Box flex={1} display="flex" justifyContent="space-between" alignItems="center">
//                           <Box>
//                             <Typography variant="h6" color="white" fontWeight="bold" mb={0.5}>Campanha</Typography>
//                             <Typography variant="h5" color="white" fontWeight="bold" mb={0.5}>{campanha.nome}</Typography>
//                             <Typography variant="h6" color="rgba(255,255,255,0.6)">{campanha.data}</Typography>
//                           </Box>
//                           <Box textAlign="center" mx={3}>
//                             <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Avaliação média</Typography>
//                             <Box display="flex" gap={0.3} justifyContent="center" mb={0.5}>
//                               {[...Array(5)].map((_, i) => (<StarIcon key={i} sx={{ color: i < Math.floor(campanha.avaliacao) ? "#FFD700" : "rgba(255,255,255,0.3)", fontSize: 20 }}/>))}
//                             </Box>
//                             <Typography variant="body2" color="white" fontWeight="bold">{campanha.avaliacao.toFixed(1)}</Typography>
//                           </Box>
//                           <Box textAlign="center" mx={3}>
//                             <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Conversão</Typography>
//                             <Typography variant="body1" fontWeight="bold" sx={{ color: campanha.conversaoColor }}>{campanha.conversao}</Typography>
//                           </Box>
//                           <Box textAlign="center" mx={3}>
//                             <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Visualizações Atingidas</Typography>
//                             <Typography variant="h6" color="white" fontWeight="bold">{campanha.visualizacoes}</Typography>
//                           </Box>
//                           <Box textAlign="center" mx={3}>
//                             <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Engajamento</Typography>
//                             <Typography variant="h6" color="white" fontWeight="bold">{campanha.engajamento}</Typography>
//                           </Box>
//                           <Box textAlign="center">
//                             <Typography variant="caption" color="rgba(255,255,255,0.6)" mb={0.5} display="block">Tempo desde a publicação</Typography>
//                             <Typography variant="body1" color="white" fontWeight="bold">{campanha.tempo}</Typography>
//                           </Box>
//                         </Box>
//                       </Box>
//                     ))}
//                   </Box>
//                 </Collapse>
//              </Box>
//           </Box>