import React, { useState, useEffect } from "react";
import { 
  Box, CircularProgress, Button, TextField, Typography, Avatar, 
  IconButton, Dialog, DialogTitle, DialogContent, 
  DialogContentText, DialogActions, FormControlLabel, Switch, Grid 
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { styled } from "@mui/material/styles";
import { AiFillCloseCircle, AiFillEdit } from "react-icons/ai";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBack from "@mui/icons-material/ArrowBack";
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Importe seus componentes
import Header from "../../components/Header";
import TiptapEditor from "../../components/TipTapEditor";
import { useAuth } from "../../auth/AuthContext"; // Supondo que você tenha um contexto

const glassDialogStyle = {
  sx: {
    borderRadius: "15px",
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: "blur(10px)",
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
    border: "1px solid rgba(255, 255, 255, 0.18)",
    width: '100%',
    maxWidth: '500px'
  }
};

const initialValues = {
  name: "",
  email: "", // Read-only
  telefone: "",
  bio: null, // Tiptap content
  privacySettings: {
    showEmail: false,
    showPhone: false,
    isProfilePublic: true
  }
};

// --- ESTILOS CUSTOMIZADOS (Idênticos ao Influencer) ---
const CustomTextField = styled(TextField)({
  "& .MuiFilledInput-root": {
    borderRadius: "15px",
    backgroundColor: "#f5f5f51f",
    transition: "all 0.3s ease",
    "&:hover": { backgroundColor: "#eaeaea" },
    "&:before, &:after": { display: "none" },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: "0px 0px 1px 2px #db1db5ff",
      borderRadius: "5px",
      color: "#db1db5ff",
    },
    "&.Mui-error": { boxShadow: "0px 0px 1px 2px #ff0077ff" },
  },
  "& .MuiInputLabel-root": {
    color: "#d2d2d2ff",
    "&.Mui-focused": { color: "#BF28B0", fontWeight: "normal" },
  },
});

const userSchema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  telefone: yup.string().nullable(),
  bio: yup.mixed().nullable(), // Opcional para usuário comum
});

const EditarPerfilUsuario = () => {
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth(); // Pega dados do contexto para saber o ID
  const IsNonMobile = useMediaQuery("(min-width:600px)");

  // Estados do Formulário
  const [formData, setFormData] = useState(initialValues);
  const [formValuesToSubmit, setFormValuesToSubmit] = useState(null);

  // Estados de Imagem
  const [imagemFundo, setImagemFundo] = useState(null);
  const [imagemPerfil, setImagemPerfil] = useState(null);
  const [arquivoImagemFundo, setArquivoImagemFundo] = useState(null);
  const [arquivoImagemPerfil, setArquivoImagemPerfil] = useState(null);

  // Estados de Controle
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- BUSCAR DADOS DO USUÁRIO ---
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
        const token = userInfo ? userInfo.token : null;
        const userId = userInfo ? userInfo._id : null;

        if (!token || !userId) throw new Error('Usuário não autenticado.');

        // Usa a rota pública ou uma rota específica "me" se tiver
        const { data } = await axios.get(`http://localhost:5001/api/users/public/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Parse do Tiptap Bio se existir
        let bioContent = null;
        if (data.bio) {
             try {
                 // Tenta parsear JSON
                 bioContent = JSON.parse(data.bio); 
             } catch (e) {
                 // Fallback se for texto simples
                 bioContent = {
                     type: 'doc',
                     content: [{ type: 'paragraph', content: [{ type: 'text', text: data.bio }] }],
                 };
             }
        }

        setFormData({
          name: data.name || "",
          email: data.email || "",
          telefone: data.telefone || "",
          bio: bioContent,
          privacySettings: data.privacySettings || initialValues.privacySettings
        });

        setImagemPerfil(data.profileImageUrl || null);
        setImagemFundo(data.backgroundImageUrl || null);

      } catch (error) {
        setErrorMessage("Falha ao carregar seu perfil.");
        setShowErrorDialog(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // --- HANDLERS ---
  const handleFormSubmit = (values) => {
    setFormValuesToSubmit(values);
    setIsConfirmDialogOpen(true);
  };

  const executeSubmit = async () => {
    if (!formValuesToSubmit) return;
    setIsConfirmDialogOpen(false);
    setIsSubmitting(true);

    // Usa FormData para enviar arquivos + textos
    const dataToSubmit = new FormData();
    dataToSubmit.append('name', formValuesToSubmit.name);
    dataToSubmit.append('telefone', formValuesToSubmit.telefone);
    
    // Envia o JSON do Tiptap como string (ou o texto simples se preferir lógica diferente no back)
    dataToSubmit.append('bio', JSON.stringify(formValuesToSubmit.bio));
    
    // Privacy Settings como JSON string para ser parseado no backend
    dataToSubmit.append('privacySettings', JSON.stringify(formValuesToSubmit.privacySettings));

    if (arquivoImagemPerfil) dataToSubmit.append('profileImageUrl', arquivoImagemPerfil); // Note: backend espera profileImageUrl ou ajusta no multer
    if (arquivoImagemFundo) dataToSubmit.append('backgroundImageUrl', arquivoImagemFundo);

    // NOTA: Se o seu backend 'updateUserProfile' (userController.js) não suportar upload direto via multer,
    // você precisará ajustar o backend para aceitar FormData ou fazer upload das imagens primeiro
    // e enviar apenas as URLs no JSON. 
    // *Assumindo aqui que você vai adaptar o userController para usar o mesmo padrão do influencerController.*

    try {
      const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
      const token = userInfo ? userInfo.token : null;

      // Chama a rota de update de perfil
      const { data } = await axios.put(`http://localhost:5001/api/users/profile`, dataToSubmit, {
         headers: { 
             Authorization: `Bearer ${token}`,
             // 'Content-Type': 'multipart/form-data' // Axios detecta auto
         }
      });
      
      // Atualiza o contexto se necessário
      if(updateUser) updateUser(data);

      setShowSuccessDialog(true);
    } catch (error) {
      const message = error.response?.data?.message || "Erro ao salvar perfil.";
      setErrorMessage(message);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
       <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 'calc(100vh - 120px)' }}>
         <CircularProgress color="primary" />
       </Box>
    );
  }

  return (
    <Box 
      height="calc(100vh - 120px)" 
      overflow="auto"
      sx={{
        transition:"all 0.3s ease-in-out",
        willChange: "width",
        "&::-webkit-scrollbar": { width: "10px", marginRight:"10px" },
        "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
        "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" },
        
        // Estilos do Tiptap (Copiados)
        '.tiptap-wrapper .ProseMirror': {
            backgroundColor: "#0000003e",
            padding: "16.5px 14px",
            color: "white",
            minHeight: '120px',
            borderRadius: "15px",
            transition: "background-color 0.3s ease",
            '&:hover': { backgroundColor: "#0000007a" },
            '& p.is-editor-empty:first-child::before': {
                content: 'attr(data-placeholder)',
                float: 'left',
                color: '#d2d2d2ff',
                pointerEvents: 'none',
                height: 0,
            },
        },
        '.tiptap-wrapper.is-focused .ProseMirror': {
            backgroundColor: "#0000007c",
            boxShadow: "0px 0px 1px 2px #ffeafbff",
        },
        '.tiptap-wrapper .tiptap-toolbar': {
            backgroundColor: 'transparent',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        },
      }}
    >
      <Box m="20px">
        {/* Botão Voltar */}
        <Button
          startIcon={<MenuIcon sx={{ mr: 1 }} />}
          onClick={() => navigate(-1)}
          sx={{
            backgroundColor: "rgba(22, 0, 61, 0.38)",
            color: "white",
            px: 2, py: 1,
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
            textTransform: "none",
            fontSize: "15px",
            fontWeight: "500",
            mb: 4,
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.23)" },
          }}
        >
          <ArrowBack sx={{ width: "10%", mr: 1 }} />
          <Typography variant="overline" fontWeight={700} sx={{ letterSpacing: 1.4, opacity: 0.8 }}>
            Voltar
          </Typography>
        </Button>

        <Header title="Editar Meu Perfil" subtitle="Gerencie suas informações pessoais e privacidade" />

        <Formik
          initialValues={formData}
          validationSchema={userSchema}
          enableReinitialize
          onSubmit={handleFormSubmit}
        >
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="20px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{ "& > div": { gridColumn: IsNonMobile ? undefined : "span 4" } }}
              >
                
                {/* --- SEÇÃO DE IMAGENS --- */}
                
                {/* Upload Fundo */}
                <Box
                  gridColumn="span 4"
                  border="1px dashed #ffffff79"
                  borderRadius="10px"
                  sx={{
                    width: "100%", height: 200,
                    backgroundColor: "#ffffff34",
                    backgroundImage: imagemFundo ? `url(${imagemFundo})` : "none",
                    backgroundSize: "cover", backgroundPosition: "center",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    position: "relative",
                  }}
                >
                  {!imagemFundo && (
                    <Box textAlign="center">
                      <IconButton component="label">
                        <AddPhotoAlternateIcon fontSize="large" sx={{ width: 70, height: 70 }} />
                        <input hidden accept="image/*" type="file" onChange={(e) => {
                             const file = e.target.files[0];
                             if (file) {
                                 setImagemFundo(URL.createObjectURL(file));
                                 setArquivoImagemFundo(file);
                             }
                        }} />
                      </IconButton>
                      <Typography variant="body2">Capa do Perfil</Typography>
                    </Box>
                  )}
                  {imagemFundo && (
                     <>
                        <IconButton 
                            onClick={() => { setImagemFundo(null); setArquivoImagemFundo(null); }}
                            sx={{ position: "absolute", top: 5, right: 5, color: "white", "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" } }}
                        >
                            <AiFillCloseCircle size={24} />
                        </IconButton>
                        <IconButton component="label" sx={{ position: "absolute", top: 5, right: 40, color: "white", "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" } }}>
                             <AiFillEdit size={24} />
                             <input hidden accept="image/*" type="file" onChange={(e) => {
                                 const file = e.target.files[0];
                                 if (file) {
                                    setImagemFundo(URL.createObjectURL(file));
                                    setArquivoImagemFundo(file);
                                 }
                             }} />
                        </IconButton>
                     </>
                  )}
                  
                  {/* Foto de Perfil (Sobreposta) */}
                  <Box
                    sx={{
                        position: 'absolute', bottom: -50, left: 30,
                        border: '4px solid rgba(255,255,255,0.2)', borderRadius: '50%',
                        backgroundColor: '#1a1a1a'
                    }}
                  >
                     <Box position="relative">
                        <Avatar
                           src={imagemPerfil}
                           sx={{ width: 120, height: 120, cursor: 'pointer' }}
                        />
                        <IconButton component="label" 
                            sx={{ 
                                position: 'absolute', bottom: 0, right: 0, 
                                backgroundColor: '#db1db5', color: 'white',
                                '&:hover': { backgroundColor: '#b01691' }
                            }}
                        >
                             <AiFillEdit size={18} />
                             <input hidden accept="image/*" type="file" onChange={(e) => {
                                 const file = e.target.files[0];
                                 if (file) {
                                    setImagemPerfil(URL.createObjectURL(file));
                                    setArquivoImagemPerfil(file);
                                 }
                             }} />
                        </IconButton>
                     </Box>
                  </Box>
                </Box>
                
                {/* Espaçador para compensar a foto de perfil que sai do container */}
                <Box gridColumn="span 4" height="40px" />

                {/* --- CAMPOS DE TEXTO --- */}

                <CustomTextField
                  fullWidth variant="filled" label="Nome Completo"
                  onBlur={handleBlur} onChange={handleChange}
                  value={values.name} name="name"
                  error={!!touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  sx={{ gridColumn: "span 2" }}
                />

                <CustomTextField
                  fullWidth variant="filled" label="Telefone / WhatsApp"
                  onBlur={handleBlur} onChange={handleChange}
                  value={values.telefone} name="telefone"
                  InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.5)' }} /> }}
                  error={!!touched.telefone && !!errors.telefone}
                  helperText={touched.telefone && errors.telefone}
                  sx={{ gridColumn: "span 2" }}
                />

                <CustomTextField
                  fullWidth variant="filled" label="E-mail (Não editável)"
                  value={values.email} disabled
                  InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.3)' }} /> }}
                  sx={{ gridColumn: "span 4", opacity: 0.7 }}
                />

                {/* Bio (Rich Text) */}
                <Box gridColumn="span 4">
                   <Typography variant="body1" sx={{ color: '#d2d2d2ff', mb: 1, ml: 0.5 }}>Biografia Profissional</Typography>
                   <Box className="tiptap-wrapper">
                      <TiptapEditor
                         content={values.bio}
                         onContentChange={(jsonContent) => setFieldValue('bio', jsonContent)}
                         placeholder="Descreva sua experiência profissional..."
                      />
                   </Box>
                </Box>

                {/* --- PRIVACIDADE --- */}
                <Box gridColumn="span 4" mt={2} p={3} sx={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Typography variant="h6" color="white" mb={2} display="flex" alignItems="center" gap={1}>
                        <SecurityIcon sx={{ color: "#db1db5" }} /> Configurações de Privacidade
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={values.privacySettings.showEmail} 
                                        onChange={(e) => setFieldValue('privacySettings.showEmail', e.target.checked)} 
                                        color="secondary" 
                                    />
                                }
                                label={<Typography color="rgba(255,255,255,0.8)">Mostrar E-mail no Perfil</Typography>}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={values.privacySettings.showPhone} 
                                        onChange={(e) => setFieldValue('privacySettings.showPhone', e.target.checked)} 
                                        color="secondary" 
                                    />
                                }
                                label={<Typography color="rgba(255,255,255,0.8)">Mostrar Telefone no Perfil</Typography>}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={values.privacySettings.isProfilePublic} 
                                        onChange={(e) => setFieldValue('privacySettings.isProfilePublic', e.target.checked)} 
                                        color="success" 
                                    />
                                }
                                label={<Typography color="rgba(255,255,255,0.8)">Perfil Público (Visível)</Typography>}
                            />
                        </Grid>
                    </Grid>
                </Box>

              </Box>

              <Box display="flex" justifyContent="center" mt="40px" mb="20px">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  sx={{
                    borderRadius: "30px",
                    transition: "all 0.2s ease-in-out",
                    background: "#FFFFFF",
                    boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)",
                    color: "#BF28B0",
                    fontWeight: "900",
                    fontSize: "18px",
                    px: 6, py: 1.5,
                    textTransform: "none",
                    "&:hover": {
                      borderRadius: "10px",
                      background: "#ffffff46",
                      color: "white",
                      boxShadow: "none",
                    },
                  }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : "Salvar Alterações"}
                </Button>
              </Box>
            </form>
          )}
        </Formik>

        {/* --- DIÁLOGOS --- */}
        
        {/* Confirmar */}
        <Dialog
          open={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          PaperProps={glassDialogStyle}
        >
          <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>Confirmar Alterações</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#555555' }}>Deseja salvar as alterações no seu perfil?</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={() => setIsConfirmDialogOpen(false)} color="primary">Cancelar</Button>
            <Button onClick={executeSubmit} autoFocus variant="contained" color="primary">Confirmar</Button>
          </DialogActions>
        </Dialog>

        {/* Sucesso */}
        <Dialog
          open={showSuccessDialog}
          onClose={() => { setShowSuccessDialog(false); navigate(-1); }}
          PaperProps={glassDialogStyle}
        >
          <DialogTitle sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>Sucesso!</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#555555' }}>Seu perfil foi atualizado com sucesso.</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={() => { setShowSuccessDialog(false); navigate(-1); }} variant="contained" color="success">OK</Button>
          </DialogActions>
        </Dialog>

        {/* Erro */}
        <Dialog
          open={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          PaperProps={glassDialogStyle}
        >
          <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold' }}>Erro</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#555555' }}>{errorMessage}</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={() => setShowErrorDialog(false)} color="error">Fechar</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
};

export default EditarPerfilUsuario;