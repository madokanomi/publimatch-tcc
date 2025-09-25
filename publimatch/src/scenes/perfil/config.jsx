import React, { useState, forwardRef } from "react";
import { Box, Typography, Paper, Divider, Button, List, ListItemButton, ListItemIcon, ListItemText, Avatar, IconButton, ListItem, ListItemAvatar, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import Header from "../../components/Header";
import { styled } from "@mui/material/styles";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LogoutIcon from '@mui/icons-material/Logout';
import PasswordIcon from '@mui/icons-material/Password';
import PinIcon from '@mui/icons-material/Pin';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import userPhoto from "../../assets/user.png";
import { motion, AnimatePresence } from 'framer-motion';

// ALTERAÇÃO 1: Importar o hook useAuth para acessar o contexto de autenticação
import { useAuth } from "../../auth/AuthContext";

// ======================================================================
// ... (Seus componentes estilizados e variantes de animação permanecem os mesmos) ...
const MotionPaper = motion(Paper);
const CustomPaper = styled(MotionPaper) (({ theme }) => ({ borderRadius: "20px", background: "linear-gradient(180deg, rgba(219, 29, 181, 0.08) 0%, rgba(34, 22, 164, 0.08) 100%)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff", minHeight: "65vh", overflow: "hidden" }));
const MenuPaper = styled(CustomPaper)({ display: 'flex', flexDirection: 'column' });
const ContentPaper = styled(CustomPaper)({ overflowY: 'auto', "&::-webkit-scrollbar": { width: "8px" }, "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.05)" }, "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.2)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.3)" }, });
const MenuItemStyled = styled(ListItemButton)(({ theme, selected }) => ({ borderRadius: "10px", margin: "8px 12px", transition: "all 0.2s ease-in-out", borderLeft: selected ? "4px solid #db1db5ff" : "4px solid transparent", backgroundColor: selected ? "rgba(219, 29, 181, 0.15)" : "transparent", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)", transform: "translateX(5px)" }, "& .MuiListItemIcon-root": { color: selected ? "#fff" : "rgba(255, 255, 255, 0.7)" }, "& .MuiListItemText-primary": { color: "#fff", fontWeight: selected ? "bold" : "normal" }, }));
const CustomTextField = styled(TextField)({ "& .MuiInputBase-root": { backgroundColor: "rgba(0, 0, 0, 0.2)", borderRadius: "8px", color: 'white', '&.Mui-disabled': { backgroundColor: "rgba(0, 0, 0, 0.1)", } }, "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" }, "&:hover fieldset": { borderColor: "#db1db5ff" }, "&.Mui-focused fieldset": { borderColor: "#db1db5ff" }, }, });
const contentVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }, exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeIn' } }, };
const listContainerVariants = { visible: { transition: { staggerChildren: 0.1 } }, hidden: {}, };
const listItemVariants = { visible: { opacity: 1, x: 0 }, hidden: { opacity: 0, x: -20 }, exit: { opacity: 0, x: 50, transition: { duration: 0.3 } }, };
const dialogStepVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }, exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }, };

// ======================================================================

const SegurancaComponent = () => {
  // ALTERAÇÃO 2: Acessar os dados do usuário logado
  const { user } = useAuth();

  const [formValues, setFormValues] = useState({ novaSenha: '', confirmarSenha: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [codigoVerificacao, setCodigoVerificacao] = useState('');

  const handleInputChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });
  const handleSaveChanges = () => {
    if (formValues.novaSenha && formValues.novaSenha === formValues.confirmarSenha) {
      setDialogOpen(true);
      setDialogStep(1);
    } else {
      alert("As senhas não coincidem ou estão em branco!");
    }
  };
  const handleCloseDialog = () => { setDialogOpen(false); setTimeout(() => { setDialogStep(1); setSenhaAntiga(''); setCodigoVerificacao(''); }, 300); };
  const handleConfirmOldPassword = () => setDialogStep(2);
  const handleConfirmVerificationCode = () => setDialogStep(3);

  return (
    <Box component={motion.div} key="seguranca" variants={contentVariants} initial="hidden" animate="visible" exit="exit" p={4}>
      <Typography variant="h4" fontWeight="bold" mb={1}>Segurança e Login</Typography>
      <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={4}>
        Atualize sua senha e gerencie as configurações de segurança da sua conta.
      </Typography>
      <Box component="form" display="flex" flexDirection="column" gap={3}>
        {/* ALTERAÇÃO 3: Usar o e-mail do usuário do contexto */}
        <CustomTextField label="E-mail Atual" value={user?.email || ''} disabled />
        <CustomTextField label="Nova Senha" name="novaSenha" type="password" value={formValues.novaSenha} onChange={handleInputChange} />
        <CustomTextField label="Confirmar Nova Senha" name="confirmarSenha" type="password" value={formValues.confirmarSenha} onChange={handleInputChange} />
        <Button onClick={handleSaveChanges} sx={{ mt: 2, p: 1.5, fontWeight: 'bold', borderRadius: '10px', color: 'white', background: 'linear-gradient(90deg, #ffffff56 0%, #ffffff48 100%)', transition: 'all 0.3s ease', border: "1px solid #ffffff", '&:hover': { boxShadow: '0px 0px 15px #ffffff4b', transform: 'translateY(-2px)' } }}>
          Salvar Alterações
        </Button>
      </Box>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: "20px", backgroundColor: "#ffffff55", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", minWidth: '400px' }}}>
        <IconButton onClick={handleCloseDialog} sx={{ position: 'absolute', right: 8, top: 8, color: 'rgba(255,255,255,0.7)' }}><CloseIcon /></IconButton>
        <AnimatePresence mode="wait">
            {/* ... (lógica do diálogo passo 1) ... */}
            {dialogStep === 1 && ( <motion.div key="step1" variants={dialogStepVariants} initial="hidden" animate="visible" exit="exit"> <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Confirmar Alteração</DialogTitle> <DialogContent sx={{ textAlign: 'center' }}> <DialogContentText color="rgba(255,255,255,0.7)" mb={2}>Para sua segurança, por favor, insira sua senha atual.</DialogContentText> <CustomTextField autoFocus margin="dense" label="Senha Atual" type="password" fullWidth variant="outlined" value={senhaAntiga} onChange={(e) => setSenhaAntiga(e.target.value)} InputProps={{ startAdornment: <PasswordIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.5)' }} /> }} /> </DialogContent> <DialogActions sx={{ p: 2, justifyContent: 'center' }}><Button onClick={handleCloseDialog} sx={{color: 'white'}}>Cancelar</Button><Button onClick={handleConfirmOldPassword} variant="contained" sx={{backgroundColor:"#480044ff"}}>Confirmar</Button></DialogActions> </motion.div> )}
            {dialogStep === 2 && (
                 <motion.div key="step2" variants={dialogStepVariants} initial="hidden" animate="visible" exit="exit">
                    <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Verificação de Segurança</DialogTitle>
                    <DialogContent sx={{ textAlign: 'center' }}>
                        {/* ALTERAÇÃO 4: Usar o e-mail do usuário dinamicamente aqui também */}
                        <DialogContentText color="rgba(255,255,255,0.7)" mb={2}>Enviamos um código de verificação para <strong>{user?.email}</strong>. Por favor, insira o código abaixo.</DialogContentText>
                        <CustomTextField autoFocus margin="dense" label="Código de Verificação" type="text" fullWidth variant="outlined" value={codigoVerificacao} onChange={(e) => setCodigoVerificacao(e.target.value)} InputProps={{ startAdornment: <PinIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.5)' }} /> }}/>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, justifyContent: 'center' }}><Button onClick={handleCloseDialog} sx={{color: 'white'}}>Cancelar</Button><Button onClick={handleConfirmVerificationCode} variant="contained" sx={{backgroundColor:"#480044ff"}}>Verificar e Salvar</Button></DialogActions>
                </motion.div>
            )}
            {/* ... (lógica do diálogo passo 3) ... */}
             {dialogStep === 3 && ( <motion.div key="step3" variants={dialogStepVariants} initial="hidden" animate="visible" exit="exit"> <DialogTitle sx={{ textAlign: 'center' }}><CheckCircleIcon sx={{ fontSize: 60, mb: 1, color: '#4caf50' }} /><Typography variant="h5" fontWeight="bold">Sucesso!</Typography></DialogTitle> <DialogContent sx={{ textAlign: 'center' }}><DialogContentText color="rgba(255,255,255,0.9)">Sua senha foi alterada com sucesso.</DialogContentText></DialogContent> <DialogActions sx={{ p: 2, justifyContent: 'center' }}><Button onClick={handleCloseDialog} variant="contained" sx={{backgroundColor:"#51004dff"}}>Fechar</Button></DialogActions> </motion.div> )}
        </AnimatePresence>
      </Dialog>
    </Box>
  );
};

const PerfisOcultosComponent = () => {
    // ... (este componente não precisa de dados do usuário, então permanece igual)
    const [perfisOcultos, setPerfisOcultos] = useState([ { id: 1, nome: "GamerPro", imagem: "https://i.pravatar.cc/150?img=1" }, { id: 2, nome: "Fashionista", imagem: "https://i.pravatar.cc/150?img=2" }, { id: 3, nome: "ChefCozinha", imagem: "https://i.pravatar.cc/150?img=3" }, ]);
    const handleReexibir = (perfilId) => setPerfisOcultos(perfisAtuais => perfisAtuais.filter(p => p.id !== perfilId));
    return ( <Box component={motion.div} key="perfis" variants={contentVariants} initial="hidden" animate="visible" exit="exit" p={4}> <Typography variant="h4" fontWeight="bold" mb={1}>Perfis Ocultos</Typography> <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={3}> Gerencie os perfis de influenciadores que você não deseja ver nos resultados de busca. </Typography> <List component={motion.ul} variants={listContainerVariants} initial="hidden" animate="visible"> <AnimatePresence> {perfisOcultos.map((perfil) => ( <MotionPaper component={motion.li} layout variants={listItemVariants} initial="hidden" animate="visible" exit="exit" key={perfil.id} sx={{ mb: 1.5, borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}> <ListItem secondaryAction={ <Button onClick={() => handleReexibir(perfil.id)} variant="outlined" startIcon={<VisibilityOffIcon />} sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", textTransform: 'none', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}>Reexibir</Button> }> <ListItemAvatar><Avatar src={perfil.imagem} /></ListItemAvatar> <ListItemText primary={perfil.nome} primaryTypographyProps={{fontWeight: 'bold'}}/> </ListItem> </MotionPaper> ))} </AnimatePresence> {perfisOcultos.length === 0 && ( <Typography variant="body2" color="rgba(255,255,255,0.7)" textAlign="center" mt={4} p={2}>Nenhum perfil oculto no momento.</Typography> )} </List> </Box> );
};

const SairDaContaComponent = () => {
    // ALTERAÇÃO 5: Acessar a função de logout do contexto
    const { logout } = useAuth();
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const handleOpenDialog = () => setDialogOpen(true);
    const handleCloseDialog = () => setDialogOpen(false);
    
    const handleConfirmLogout = () => {
        // ALTERAÇÃO 6: Chamar a função de logout do contexto
        // Ela já cuida de limpar o storage e redirecionar o usuário
        logout();
        // Não precisamos mais do alert() ou de fechar o diálogo manualmente,
        // pois a página será redirecionada.
    };

    return (
    <>
        <Box component={motion.div} key="sair" variants={contentVariants} initial="hidden" animate="visible" exit="exit" p={4} textAlign="center">
          <LogoutIcon sx={{ fontSize: 60, color: 'rgba(255, 82, 82, 1)', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" mb={1}>Sair da Conta</Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={4}>
            Tem certeza que deseja encerrar sua sessão? Você precisará fazer login novamente.
          </Typography>
          <Button variant="contained" color="error" size="large" sx={{ p: "12px 30px", borderRadius: '10px', fontWeight: 'bold' }} onClick={handleOpenDialog}>
            Sair da Conta
          </Button>
        </Box>
        <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: "20px", backgroundColor: "#ffffff55", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", }}}>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}><WarningAmberIcon sx={{ color: '#ffc107', mb: -0.5, mr: 1 }} />Confirmar Saída</DialogTitle>
            <DialogContent><DialogContentText color="rgba(255,255,255,0.8)">Tem certeza que deseja encerrar a sua sessão?</DialogContentText></DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 1 }}><Button onClick={handleCloseDialog} sx={{color: 'white', borderColor: 'white', '&:hover': {backgroundColor: 'rgba(255,255,255,0.1)'}}} variant="outlined">Cancelar</Button><Button onClick={handleConfirmLogout} variant="contained" color="error" autoFocus>Sair</Button></DialogActions>
        </Dialog>
    </>
  );
};

// ======================================================================

const Configuracoes = () => {
    // ALTERAÇÃO 7: Acessar os dados do usuário para o menu lateral
    const { user } = useAuth();

    const [selectedItem, setSelectedItem] = useState("Segurança");

    const renderContent = () => {
        switch (selectedItem) {
        case "Segurança": return <SegurancaComponent />;
        case "Perfis Ocultos": return <PerfisOcultosComponent />;
        case "Sair": return <SairDaContaComponent />;
        default: return <SegurancaComponent />;
        }
    };

    return (
        <Box m="20px">
        <Header title="Configurações" subtitle="Gerencie as preferências da sua conta" />
        <Box component={motion.div} variants={listContainerVariants} initial="hidden" animate="visible" display="grid" gridTemplateColumns={{ xs: "1fr", md: "280px 1fr" }} gap="20px">
            <MenuPaper component={motion.div} variants={listItemVariants}>
                <Box p={2} textAlign="center">
                    <Avatar src={userPhoto} sx={{ width: 100, height: 100, margin: '10px auto' }} />
                    {/* ALTERAÇÃO 8: Usar o nome e o cargo do usuário do contexto */}
                    <Typography variant="h4" fontWeight="bold" mt={1}>{user?.username || 'Usuário'}</Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">{user?.role || 'Cargo não definido'}</Typography>
                </Box>
                <Divider sx={{ backgroundColor: "rgba(255,255,255,0.2)", mx: 2 }} />
                <List component="nav" sx={{ p: 0, mt: 1 }}>
                    <MenuItemStyled selected={selectedItem === "Segurança"} onClick={() => setSelectedItem("Segurança")}><ListItemIcon><LockResetIcon /></ListItemIcon><ListItemText primary="Segurança e Login" /></MenuItemStyled>
                    <MenuItemStyled selected={selectedItem === "Perfis Ocultos"} onClick={() => setSelectedItem("Perfis Ocultos")}><ListItemIcon><VisibilityOffIcon /></ListItemIcon><ListItemText primary="Perfis Ocultos" /></MenuItemStyled>
                </List>
                <Box flexGrow={1} />
                <List component="nav" sx={{ p: 0 }}>
                <MenuItemStyled selected={selectedItem === "Sair"} onClick={() => setSelectedItem("Sair")}><ListItemIcon sx={{ color: 'rgba(255, 82, 82, 0.8) !important' }}><LogoutIcon /></ListItemIcon><ListItemText primary="Sair da Conta" /></MenuItemStyled>
                </List>
            </MenuPaper>
            <ContentPaper component={motion.div} variants={listItemVariants}>
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </ContentPaper>
        </Box>
        </Box>
    );
};

export default Configuracoes;