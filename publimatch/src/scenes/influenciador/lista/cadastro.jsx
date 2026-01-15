import { useState, useMemo } from "react";
import { Box, Button, TextField, Typography, CircularProgress, Avatar, Chip, Stack, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert, AlertTitle, Zoom } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TiktokIcon from "@mui/icons-material/MusicNote";
import { SiTwitch } from "react-icons/si";
import { styled } from "@mui/material/styles";
import { AiFillCloseCircle, AiFillEdit } from "react-icons/ai";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBack from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircle from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import TiptapEditor from "../../../components/TipTapEditor";
import { influencers } from "../../../data/mockInfluencer";

const initialValues = {
  exibitionName: "",
  realName: "",
  age: "",
  description: "",
  aboutMe: null,
  categories: [],
  social: {
    tiktok: "",
    instagram: "",
    youtube: "",
    twitch: "",
  },
};

const CustomTextField = styled(TextField)({
  "& .MuiFilledInput-root": {
    borderRadius: "15px",
    backgroundColor: "#f5f5f51f",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#eaeaea",
    },
    "&:before, &:after": { display: "none" },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      boxShadow: "0px 0px 1px 2px #db1db5ff",
      borderRadius: "5px",
      color: "#db1db5ff",
    },
    "&.Mui-error": {
      boxShadow: "0px 0px 1px 2px #ff0077ff",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#d2d2d2ff",
    "&.Mui-focused": { color: "#BF28B0", fontWeight: "normal" },
  },
});

const Descricao = styled(TextField)({
  "& .MuiFilledInput-root": {
    borderRadius: "15px",
    backgroundColor: "#0000003e",
    transition: "all 0.3s ease",
    "&:hover": { backgroundColor: "#0000007a" },
    "&:before, &:after": { display: "none" },
    "&.Mui-focused": {
      backgroundColor: "#0000007c",
      boxShadow: "0px 0px 1px 2px #ffeafbff",
      borderRadius: "5px",
      color: "#fff",
    },
    "&.Mui-error": { boxShadow: "0px 0px 1px 2px #ff0077ff" },
  },
  "& .MuiInputLabel-root": {
    color: "#d2d2d2ff",
    "&.Mui-focused": { color: "#ff82b4ff", fontWeight: "normal" },
  },
});

// Componente botão social interno
const SocialConnectButton = ({ icon: Icon, name, color, connected, onClick }) => (
    <Button
      onClick={onClick}
      variant={connected ? "contained" : "outlined"}
      sx={{
        flex: 1,
        minWidth: '130px',
        py: 1.5,
        borderRadius: "15px",
        textTransform: "none",
        border: connected ? "none" : "1px solid rgba(255,255,255,0.3)",
        backgroundColor: connected ? color : "rgba(255,255,255,0.05)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        transition: "all 0.3s ease",
        boxShadow: connected ? `0 4px 15px ${color}66` : "none",
        "&:hover": {
          backgroundColor: connected ? color : "rgba(255,255,255,0.15)",
          transform: "translateY(-2px)",
          borderColor: "white"
        }
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
          <Icon size={20} />
          {connected && <CheckCircle sx={{ fontSize: 16 }} />}
      </Box>
      <Typography variant="caption" fontWeight="bold">
        {connected ? "Conectado" : `Entrar com ${name}`}
      </Typography>
    </Button>
  );

const userSchema = yup.object().shape({
  exibitionName: yup.string().required("Campo Obrigatório"),
  realName: yup.string().required("Campo Obrigatório"),
  age: yup.number().required("Campo Obrigatório").positive().integer(),
  description: yup.string().required("Campo Obrigatório"),
  aboutMe: yup.mixed()
    .required("Campo Obrigatório")
    .test(
      "is-not-empty",
      "O campo 'Sobre mim' é obrigatório.",
      (value) => value && value.content && !(value.content.length === 1 && !value.content[0].content)
    ),
});

const CadastroInflu = () => {
  const navigate = useNavigate();
  const IsNonMobile = useMediaQuery("(min-width:600px)");

  const todasCategorias = useMemo(() => {
    const set = new Set();
    influencers.forEach((inf) =>
      inf.categorias.forEach((cat) => set.add(cat))
    );
    return Array.from(set).sort();
  }, []);

  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [novaTag, setNovaTag] = useState("");
  const [erroCategorias, setErroCategorias] = useState("");
  const [imagemFundo, setImagemFundo] = useState(null);
  const [imagemPerfil, setImagemPerfil] = useState(null);
  const [wantsAccount, setWantsAccount] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);
  const [influencerEmail, setInfluencerEmail] = useState("");
  const [formValues, setFormValues] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [arquivoImagemFundo, setArquivoImagemFundo] = useState(null);
  const [arquivoImagemPerfil, setArquivoImagemPerfil] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Estado para conexões sociais
  const [socialState, setSocialState] = useState({
    youtube: false,
    instagram: false,
    tiktok: false,
    twitch: false
  });

  const isAnyConnected = Object.values(socialState).some(s => s);

  const handleSocialLogin = (network) => {
      // Simulação de login - Integre com sua lógica de autenticação aqui
      setSocialState(prev => ({...prev, [network]: !prev[network]}));
  };

  const handleCloseDialog = () => {
        setOpenConfirmDialog(false);
        setTimeout(() => {
            setDialogStep(1);
            setWantsAccount(null);
        }, 300);
    };

    const handleCloseSuccessDialog = () => {
        setShowSuccessDialog(false);
        navigate(-1);
    };

    const handleCloseErrorDialog = () => {
        setShowErrorDialog(false);
        setErrorMessage("");
    };

   const handleFormikSubmit = (values) => {
        if (tagsSelecionadas.length === 0) {
            setErroCategorias("Selecione ao menos uma categoria.");
            return;
        }
        setErroCategorias("");
        setFormValues(values);
        setOpenConfirmDialog(true);
    };

  const handleAddCategoria = () => {
    if (novaTag.trim() && !todasCategorias.includes(novaTag)) {
      if (tagsSelecionadas.length >= 2) {
        setErroCategorias("Você só pode selecionar até 2 categorias.");
        return;
      }
      todasCategorias.push(novaTag);
      setTagsSelecionadas((prev) => [...prev, novaTag]);
      setNovaTag("");
      setErroCategorias("");
    }
  };
  
 const handleFinalSubmit = async () => {
  if (!formValues) return;
  setIsLoading(true);

  const formData = new FormData();

  formData.append('exibitionName', formValues.exibitionName);
  formData.append('realName', formValues.realName);
  formData.append('age', formValues.age);
  formData.append('description', formValues.description);
  formData.append('aboutMe', JSON.stringify(formValues.aboutMe));
  
  formData.append('categories', tagsSelecionadas.join(','));
  
  // Inclui o estado de verificação social no envio se desejar
  const socialData = {
      ...formValues.social,
      isVerified: isAnyConnected // Flag para o backend saber se houve verificação
  };
  formData.append('social', JSON.stringify(socialData));

  formData.append('wantsAccount', wantsAccount);
  if (wantsAccount) {
    formData.append('email', influencerEmail);
  }

  if (arquivoImagemPerfil) {
    formData.append('profileImage', arquivoImagemPerfil);
  }
  if (arquivoImagemFundo) {
    formData.append('backgroundImage', arquivoImagemFundo);
  }

  try {
  const userInfo = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    const token = userInfo ? userInfo.token : null;
    if (!token) throw new Error('Usuário não autenticado. Faça login novamente.');

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await axios.post('http://localhost:5001/api/influencers', formData, config);
    
    handleCloseDialog();
    setShowSuccessDialog(true);

  } catch (error) {
    const message = error.response?.data?.message || "Ocorreu um erro inesperado. Tente novamente.";
    setErrorMessage(message);
    handleCloseDialog();
    setShowErrorDialog(true);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Box
      height="calc(100vh - 120px)"
      overflow="auto"
      transition="all 0.3s ease-in-out"
        sx={{
                transition: "all 0.3s ease-in-out",
                willChange: "width",
                "&::-webkit-scrollbar": { width: "10px", marginRight: "10px" },
                "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
                "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" },
                '.tiptap-wrapper .ProseMirror': {
                    backgroundColor: "#0000003e",
                    padding: "16.5px 14px",
                    color: "white",
                    minHeight: '120px',
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
                '.tiptap-wrapper.is-focused': {
                    backgroundColor: "#0000007c",
                    boxShadow: "0px 0px 1px 2px #ffeafbff",
                },
                 '.tiptap-wrapper .tiptap-toolbar': {
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                }
            }}
    >
      <Box m="20px">
        <Button
          startIcon={<MenuIcon sx={{ mr: 1 }} />}
          onClick={() => navigate(-1)}
          sx={{
            backgroundColor: "rgba(22, 0, 61, 0.38)",
            color: "white",
            px: 2,
            py: 1,
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

        <Header title="Cadastro de Influenciador" subtitle="Insira as informações do influenciador" />

        <Formik onSubmit={handleFormikSubmit} initialValues={initialValues} validationSchema={userSchema}>
           {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="20px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{ "& > div": { gridColumn: IsNonMobile ? undefined : "span 4" } }}
              >
                {/* Nome de Exibição */}
                <CustomTextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Nome de Exibição"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.exibitionName}
                  name="exibitionName"
                  error={!!touched.exibitionName && !!errors.exibitionName}
                  helperText={touched.exibitionName && errors.exibitionName}
                  sx={{ gridColumn: "span 2" }}
                />

                {/* Nome Real */}
                <CustomTextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Nome Real"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.realName}
                  name="realName"
                  error={!!touched.realName && !!errors.realName}
                  helperText={touched.realName && errors.realName}
                  sx={{ gridColumn: "span 1" }}
                />

                {/* Idade */}
                <CustomTextField
                  fullWidth
                  variant="filled"
                  type="number"
                  label="Idade"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.age}
                  name="age"
                  error={!!touched.age && !!errors.age}
                  helperText={touched.age && errors.age}
                  sx={{ gridColumn: "span 1" }}
                />

                {/* Upload imagem de fundo */}
                <Box
                  gridColumn="span 3"
                  border="1px dashed #ffffff79"
                  borderRadius="10px"
                  sx={{
                    width: "100%",
                    height: 200,
                    backgroundColor: "#ffffff34",
                    backgroundImage: imagemFundo ? `url(${imagemFundo})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {!imagemFundo && (
                    <Box textAlign="center">
                      <IconButton component="label">
                        <AddPhotoAlternateIcon fontSize="large" sx={{ width: 70, height: 70 }} />
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setImagemFundo(URL.createObjectURL(file)); 
                                setArquivoImagemFundo(file);
                            }
                        }}
                        />
                      </IconButton>
                      <Typography variant="body2">Insira a imagem de fundo</Typography>
                    </Box>
                  )}

                  {imagemFundo && (
                    <>
                      <IconButton onClick={() => setImagemFundo(null)} sx={{ position: "absolute", top: 5, right: 5, color: "white", "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" } }}>
                        <AiFillCloseCircle size={24} />
                      </IconButton>
                      <IconButton component="label" sx={{ position: "absolute", top: 5, right: 40, color: "white", "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" } }}>
                        <AiFillEdit size={24} />
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setImagemFundo(URL.createObjectURL(file)); 
                                setArquivoImagemFundo(file);
                            }
                        }}
                        />
                      </IconButton>
                    </>
                  )}
                </Box>

                {/* Foto de perfil */}
                <Box
                  gridColumn="span 1"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                  border="1px dashed #ffffff79"
                  borderRadius="10px"
                  p="20px"
                  sx={{ backgroundColor: "#ffffff34", position: "relative" }}
                >
                  <IconButton component="label" sx={{ p: 0 }}>
                    <Avatar src={imagemPerfil || ""} sx={{ width: 120, height: 120, color: "white", backgroundColor: imagemPerfil ? "transparent" : "#ffffff2c", cursor: "pointer" }} />
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            setImagemPerfil(URL.createObjectURL(file)); 
                            setArquivoImagemPerfil(file);
                        }
                    }}
                    />
                  </IconButton>
                  {!imagemPerfil && <Typography variant="body2" mt={1}>Clique no avatar para adicionar a foto</Typography>}
                  {imagemPerfil && (
                    <IconButton onClick={() => setImagemPerfil(null)} sx={{ position: "absolute", top: 5, right: 5, color: "white", "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" } }}>
                      <AiFillCloseCircle size={24} />
                    </IconButton>
                  )}
                  {imagemPerfil && (
                    <IconButton component="label" sx={{ position: "absolute", top: 5, right: 40, color: "white", "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" } }}>
                      <AiFillEdit size={24} />
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setImagemPerfil(URL.createObjectURL(file)); 
                                setArquivoImagemPerfil(file);
                            }
                        }}
                      />
                    </IconButton>
                  )}
                </Box>

                {/* Categorias */}
                <Box gridColumn="span 2">
                  <Typography variant="body2" fontWeight="500" mb={1}>
                    Categorias
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar categoria..."
                    value={searchTag}
                    onChange={(e) => setSearchTag(e.target.value)}
                    sx={{ mb: 1, bgcolor: "rgba(255,255,255,0.1)", borderRadius: "10px", "& .MuiOutlinedInput-input": { color: "white", fontSize: "0.85rem" }, "& fieldset": { border: "none" } }}
                  />
                  <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
                    {(showAllTags ? todasCategorias : todasCategorias.slice(0, 5))
                      .filter((tag) => tag.toLowerCase().includes(searchTag.toLowerCase()))
                      .map((tag, idx) => (
                        <Chip
                          key={idx}
                          label={tag}
                          size="medium"
                          onClick={() => {
                            if (tagsSelecionadas.includes(tag)) {
                              setTagsSelecionadas((prev) => prev.filter((t) => t !== tag));
                              setErroCategorias("");
                            } else {
                              if (tagsSelecionadas.length >= 2) {
                                setErroCategorias("Você só pode selecionar até 2 categorias.");
                                return;
                              }
                              setTagsSelecionadas((prev) => [...prev, tag]);
                              setErroCategorias("");
                            }
                          }}
                          sx={{ bgcolor: tagsSelecionadas.includes(tag) ? "#ff00d4" : "rgba(255, 255, 255, 0.1)", color: "white", borderRadius: "10px", cursor: "pointer", "&:hover": { bgcolor: "rgba(125, 0, 149, 0.2)" } }}
                        />
                      ))}
                  </Box>
                  {todasCategorias.length > 5 && (
                    <Button
                      onClick={() => setShowAllTags(!showAllTags)}
                      size="small"
                      variant="contained"
                      fullWidth
                      sx={{ mb: 2, color: "white", textTransform: "none", backgroundColor: "rgba(255, 255, 255, 0.23)", borderRadius: "10px", fontSize: "0.8rem", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.28)" } }}
                    >
                      {showAllTags ? "Ver menos" : "Ver mais"}
                    </Button>
                  )}
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Adicionar nova categoria..."
                      value={novaTag}
                      onChange={(e) => setNovaTag(e.target.value)}
                      sx={{ bgcolor: "rgba(0, 0, 0, 0.21)", borderRadius: "10px", "& .MuiOutlinedInput-input": { color: "white", fontSize: "0.85rem" }, "& fieldset": { border: "none" } }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddCategoria}
                      sx={{ color: "#ffffffff", textTransform: "none", backgroundColor: "#0000006f", borderRadius: "10px", fontSize: "0.8rem", "&:hover": { bgcolor: "#00000080" } }}
                    >
                      Adicionar
                    </Button>
                  </Box>
                  {erroCategorias && <Typography variant="caption" sx={{ color: "#ff4d6d", display: "block", mt: 1, fontWeight: "bold" }}>{erroCategorias}</Typography>}
                </Box>

                {/* Redes sociais (Campos Manuais) */}
                <Box gridColumn="span 2">
                  <Typography variant="subtitle1">Links de Redes Sociais</Typography>
                  <Stack spacing={1} mt={1}>
                    <CustomTextField variant="filled" label="TikTok" name="social.tiktok" onChange={handleChange} value={values.social.tiktok} InputProps={{ startAdornment: <TiktokIcon sx={{ marginTop: "9px" }} /> }} />
                    <CustomTextField variant="filled" label="Instagram" name="social.instagram" onChange={handleChange} value={values.social.instagram} InputProps={{ startAdornment: <InstagramIcon sx={{ marginTop: "9px" }} /> }} />
                    <CustomTextField variant="filled" label="YouTube" name="social.youtube" onChange={handleChange} value={values.social.youtube} InputProps={{ startAdornment: <YouTubeIcon sx={{ marginTop: "9px" }} /> }} />
                    <CustomTextField variant="filled" label="Twitch" name="social.twitch" onChange={handleChange} value={values.social.twitch} InputProps={{ startAdornment: <SiTwitch size={20} style={{ marginRight: 8 }} /> }} />
                  </Stack>
                </Box>

                {/* Descrição */}
                <Descricao
                  fullWidth
                  variant="filled"
                  label="Breve descritivo"
                  multiline
                  rows={2}
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  error={!!touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                  sx={{ gridColumn: "span 4" }}
                />

                {/* Sobre mim */}
                <Box gridColumn="span 4">
                    <Typography variant="body1" sx={{ color: '#d2d2d2ff', mb: 1, ml: 0.5 }}>
                        Sobre mim
                    </Typography>
                    <Box
                        className={`tiptap-wrapper ${values.aboutMe?.isFocused ? 'is-focused' : ''}`}
                        sx={{
                            borderRadius: "15px",
                            overflow: 'hidden',
                            border: !!touched.aboutMe && !!errors.aboutMe ? '1px solid #ff0077ff' : 'none',
                            boxShadow: !!touched.aboutMe && !!errors.aboutMe ? '0px 0px 1px 2px #ff0077ff' : 'none',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <TiptapEditor
                            onContentChange={(jsonContent) => {
                                setFieldValue('aboutMe', jsonContent);
                            }}
                            placeholder="Fale um pouco sobre você, sua carreira, seus interesses..."
                        />
                    </Box>
                    {touched.aboutMe && errors.aboutMe && (
                        <Typography sx={{ ml: 2, mt: 1 }} variant="caption" color="error">
                            {errors.aboutMe}
                        </Typography>
                    )}
                </Box>
                
                {/* --- SEÇÃO DE VERIFICAÇÃO DE CONTA (NOVA) --- */}
                <Box gridColumn="span 4" sx={{ 
                    mt: 3, 
                    p: 3, 
                    borderRadius: "20px", 
                    backgroundColor: "rgba(20, 3, 41, 0.4)", 
                    border: "1px solid rgba(124, 77, 255, 0.2)" 
                }}>
                    <Typography variant="h6" color="white" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
                        <InfoIcon sx={{ color: "#c14ed8" }} /> Verificação e Conexão
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)" mb={3}>
                        Conecte as redes sociais para obter o selo de <strong>Verificado</strong> e permitir a análise automática de métricas.
                    </Typography>

                    {/* Botões de Login */}
                    <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
                        <SocialConnectButton 
                        icon={YouTubeIcon} name="YouTube" color="#FF0000" 
                        connected={socialState.youtube} onClick={() => handleSocialLogin('youtube')} 
                        />
                        <SocialConnectButton 
                        icon={InstagramIcon} name="Instagram" color="#E1306C" 
                        connected={socialState.instagram} onClick={() => handleSocialLogin('instagram')} 
                        />
                        <SocialConnectButton 
                        icon={TiktokIcon} name="TikTok" color="#000000" 
                        connected={socialState.tiktok} onClick={() => handleSocialLogin('tiktok')} 
                        />
                        <SocialConnectButton 
                        icon={SiTwitch} name="Twitch" color="#9146FF" 
                        connected={socialState.twitch} onClick={() => handleSocialLogin('twitch')} 
                        />
                    </Box>

                    {/* Avisos Inteligentes */}
                    {isAnyConnected ? (
                        <Zoom in={true}>
                        <Alert 
                            severity="success" 
                            variant="filled"
                            sx={{ borderRadius: "12px", backgroundColor: "rgba(46, 125, 50, 0.9)", color: "white" }}
                        >
                            <AlertTitle>Conta Verificada</AlertTitle>
                            As redes foram conectadas e a conta será criada com o selo de verificação.
                        </Alert>
                        </Zoom>
                    ) : (
                        <Zoom in={true}>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Alert 
                                    severity="warning" 
                                    variant="outlined"
                                    icon={<WarningAmberIcon fontSize="inherit" />}
                                    sx={{ 
                                        borderRadius: "12px", 
                                        color: "#ffab40", 
                                        borderColor: "#ffab40",
                                        "& .MuiAlert-icon": { color: "#ffab40" }
                                    }}
                                >
                                    <AlertTitle sx={{ fontWeight: "bold" }}>Atenção: Conta Não Verificada</AlertTitle>
                                    Ao cadastrar sem realizar o login nas redes sociais, a conta ficará como <strong>Não Verificada</strong>.
                                </Alert>

                                <Alert 
                                    severity="info" 
                                    sx={{ 
                                        borderRadius: "12px", 
                                        backgroundColor: "rgba(33, 150, 243, 0.15)", 
                                        color: "#90caf9",
                                        border: "1px solid rgba(33, 150, 243, 0.3)"
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            Está cadastrando para um influenciador?
                                        </Typography>
                                        <Typography variant="caption" display="block" mt={0.5}>
                                            Não se preocupe. O influenciador poderá realizar o login e vincular as redes posteriormente para obter a verificação, facilitando o processo de cadastro agora.
                                        </Typography>
                                    </Box>
                                </Alert>
                            </Box>
                        </Zoom>
                    )}
                </Box>
                {/* --- FIM DA SEÇÃO DE VERIFICAÇÃO --- */}

              </Box>

              <Box display="flex" justifyContent="center" mt="20px">
                <Button
                 type="submit"
            disabled={isLoading}
                  sx={{
                    mt: 2,
                    borderRadius: "30px",
                    transition: "all 0.2s ease-in-out",
                    background: "#FFFFFF",
                    boxShadow: "0px 0px 24.5px 4px rgba(255, 55, 235, 0.25)",
                    color: "#BF28B0",
                    fontWeight: "900",
                    fontSize: "18px",
                    px: 6,
                    textTransform: "none",
                    "&:hover": { borderRadius: "10px", background: "#ffffff46", color: "white", boxShadow: "none" },
                  }}
                  
                >
                  {isLoading ? <CircularProgress size={24} sx={{ color: "#BF28B0" }} /> : "Cadastrar Influenciador"}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
        <Dialog open={openConfirmDialog} onClose={handleCloseDialog} PaperProps={{ sx: { backgroundColor: "rgba(255, 255, 255, 0.9)", color: "#610069ff", backdropFilter: "blur(10px)", borderRadius: '20px', position: 'relative' } }}>
                    <IconButton onClick={handleCloseDialog} sx={{ position: "absolute", top: 8, right: 8 }}><CloseIcon /></IconButton>
                    
                    {dialogStep === 1 && (
                        <>
                            <DialogTitle>Acesso à Plataforma</DialogTitle>
                            <DialogContent><DialogContentText sx={{ color: "#2a2a2aff" }}>O influenciador deverá ter uma conta para acessar a plataforma?</DialogContentText></DialogContent>
                            <DialogActions>
                                <Button onClick={() => { setWantsAccount(false); setDialogStep(3); }}>Não, apenas cadastrar</Button>
                                <Button onClick={() => { setWantsAccount(true); setDialogStep(2); }} color="primary" autoFocus>Sim, criar conta</Button>
                            </DialogActions>
                        </>
                    )}

                    {dialogStep === 2 && ( // Passo para inserir o e-mail
                        <>
  <DialogTitle>Email do Influenciador</DialogTitle>
  <DialogContent>
    <DialogContentText sx={{ mb: 2, color: "#2a2a2aff" }}>
      Um link para criação de senha será enviado para este endereço.
    </DialogContentText>
    <TextField
      autoFocus
      fullWidth
      label="Email do influenciador"
      value={influencerEmail}
      onChange={(e) => setInfluencerEmail(e.target.value)}
      variant="outlined"
      InputProps={{
        startAdornment: <EmailIcon sx={{ mr: 1, color: "#000" }} />,
      }}
      sx={{
        '& .MuiInputBase-input': { color: 'black' },
        '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' },
        '& .MuiInputLabel-root.Mui-focused': { color: 'black' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.4)' },
          '&:hover fieldset': { borderColor: 'black' },
          '&.Mui-focused fieldset': { borderColor: 'black' },
        },
      }}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog}>Cancelar</Button>
    <Button
      onClick={handleFinalSubmit}
      disabled={!influencerEmail.includes('@') || isLoading}
      color="primary"
    >
      {isLoading ? <CircularProgress size={22} color="inherit" /> : "Confirmar e Enviar Convite"}
    </Button>
  </DialogActions>
</>
                    )}

                    {dialogStep === 3 && ( // Passo de confirmação para quem NÃO quer conta
                         <>
                            <DialogTitle>Confirmar Cadastro</DialogTitle>
                            <DialogContent><DialogContentText sx={{ color: "#2a2a2aff" }}>Deseja cadastrar este influenciador sem criar uma conta de acesso?</DialogContentText></DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog}>Cancelar</Button>
                                <Button onClick={handleFinalSubmit} color="primary" autoFocus disabled={isLoading}>
                                     {isLoading ? <CircularProgress size={22} color="inherit"/> : "Confirmar"}
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>

                <Dialog open={showSuccessDialog} onClose={handleCloseSuccessDialog} PaperProps={{ sx: { borderRadius: '20px', padding: '10px', backgroundColor:'white', color:'green'} }}>
                    <DialogTitle sx={{ textAlign: 'center' }}><CheckCircleIcon color="success" sx={{ fontSize: 40 }} /><br/>Sucesso!</DialogTitle>
                    <DialogContent><DialogContentText sx={{color:'green'}}>O influenciador foi cadastrado com sucesso.</DialogContentText></DialogContent>
                    <DialogActions sx={{ justifyContent: 'center' }}><Button onClick={handleCloseSuccessDialog} variant="contained" color="success">Ok</Button></DialogActions>
                </Dialog>

                <Dialog open={showErrorDialog} onClose={handleCloseErrorDialog} PaperProps={{ sx: { borderRadius: '20px', padding: '10px', backgroundColor:'white', color:'green' } }}>
                    <DialogTitle sx={{ textAlign: 'center' }}><ErrorIcon color="error" sx={{ fontSize: 40 }} /><br/>Erro ao Cadastrar</DialogTitle>
                    <DialogContent><DialogContentText sx={{ textAlign: 'center', color:'red' }}>{errorMessage}</DialogContentText></DialogContent>
                    <DialogActions sx={{ justifyContent: 'center' }}><Button onClick={handleCloseErrorDialog} variant="contained" color="error">Fechar</Button></DialogActions>
                </Dialog>
      </Box>
    </Box>
  );
};

export default CadastroInflu;
