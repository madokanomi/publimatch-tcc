import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  CircularProgress,
  Collapse,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import logoUrl from "../../assets/logolegal.png";
import backgroundUrl from "../../assets/background.png";
import userIconUrl from "../../assets/user.png";
import { useAuth } from '../../auth/AuthContext'; 
import axios from 'axios';
// --- Configuração do EmailJS ---
const EMAILJS_SERVICE_ID = 'service_bvlaftb';
const EMAILJS_TEMPLATE_ID = 'template_qohls7b';
const EMAILJS_USER_ID = 'wUa2UiFGiCL2rKUJP';


// --- Recursos de Imagem ---



const AnimatedLogin = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
   const { login } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Estados para a nova senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [suggestedPassword, setSuggestedPassword] = useState('');
  const [copied, setCopied] = useState(false);
const [rememberMe, setRememberMe] = useState(false); 

  // Efeito para carregar dinamicamente o script do EmailJS
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);


  // Animação inicial
  useEffect(() => {
    const timer = setTimeout(() => { setShowLogin(true); }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();
  
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownConfirmPassword = (event) => event.preventDefault();

 
const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setEmailError('');
    setPasswordError('');
    let formIsValid = true;

    if (!loginEmail) {
        setEmailError('Por favor, preencha o campo de e-mail.');
        formIsValid = false;
    }
    if (!loginPassword) {
        setPasswordError('Por favor, preencha o campo de senha.');
        formIsValid = false;
    }
    if (!formIsValid) return;

    setLoading(true);

    // 👇 A MUDANÇA ESTÁ AQUI 👇
    // Nós não usamos mais o axios aqui. Nós chamamos diretamente a função 'login' do context.
    
    const result = await login(loginEmail, loginPassword, rememberMe);

    // A função 'login' do context vai retornar um objeto com o resultado.
    // Se não for bem-sucedido, usamos a mensagem de erro que ela nos retorna.
    if (!result.success) {
        setPasswordError(result.message);
    }
    
    // O setLoading(false) agora é controlado aqui, após o resultado.
    setLoading(false);

    // Se o login for bem-sucedido, o próprio AuthContext já cuidará do redirecionamento.
    // Não precisamos fazer mais nada aqui!
};
 const handleForgotPasswordSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (!email) {
            setError('Por favor, insira um endereço de e-mail.');
            return;
        }
        setLoading(true);
        try {
            // Chama a API do backend para enviar o código
            await axios.post('http://localhost:5001/api/auth/forgot-password', { email });
            setLoading(false);
            setView('enterCode'); // Muda para a tela de inserir código
        } catch (err) {
            setError(err.response?.data?.message || 'Falha ao iniciar o processo. Tente novamente.');
            setLoading(false);
        }
    };


 const handleVerifyCodeSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const enteredCode = event.target.elements.code.value;

    if (!enteredCode || enteredCode.length !== 6) {
        setError('Por favor, insira um código de 6 dígitos.');
        return;
    }

    setLoading(true); // Ativa o loading

    try {
        // CHAMA A NOVA ROTA DO BACKEND PARA VERIFICAR
        await axios.post('http://localhost:5001/api/auth/verify-code', {
            email: email, // O e-mail que o usuário inseriu na tela anterior
            code: enteredCode,
        });

        // Se a chamada acima funcionou (não deu erro), o código é válido!
        setVerificationCode(enteredCode); // Guarda o código para o próximo passo
        setView('resetPassword');       // AGORA SIM, avança para a próxima tela

    } catch (err) {
        // Se o backend retornou um erro (400, 500, etc.), o código é inválido
        setError(err.response?.data?.message || 'Falha ao verificar o código. Tente novamente.');
    } finally {
        setLoading(false); // Desativa o loading
    }
};

  const validatePassword = (password) => {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
    };
    return checks;
  };
  const handleResetPasswordSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (newPassword !== confirmNewPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        const passwordChecks = validatePassword(newPassword);
        if (Object.values(passwordChecks).some(check => !check)) {
            setError('A senha não cumpre todos os requisitos.');
            return;
        }

        setLoading(true);
        try {
            // Envia e-mail, o código que o usuário digitou e a nova senha para a API
            await axios.put('http://localhost:5001/api/auth/reset-password', {
                email: email,
                code: verificationCode, // O código que guardamos no estado
                password: newPassword,
            });
            setLoading(false);
            setView('resetSuccess');
        } catch (err) {
            setError(err.response?.data?.message || 'Falha ao redefinir a senha.');
            setLoading(false);
        }
    };

  
  const generateStrongPassword = () => {
    const length = 12;
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";
    const all = lower + upper + numbers + symbols;

    let password = "";
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }
    
    const shuffledPassword = password.split('').sort(() => 0.5 - Math.random()).join('');
    setSuggestedPassword(shuffledPassword);
    setNewPassword(shuffledPassword);
    setConfirmNewPassword(shuffledPassword);
  };


  const handleViewChange = (newView) => {
      setError('');
      setView(newView);
  }

  const PasswordStrengthIndicator = ({ password }) => {
    const requirements = [
        { label: '8+ Caracteres', valid: password.length >= 8 },
        { label: 'Maiúscula', valid: /[A-Z]/.test(password) },
        { label: 'Minúscula', valid: /[a-z]/.test(password) },
        { label: 'Número', valid: /\d/.test(password) },
    ];
  
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1.5, width: '100%' }}>
        {requirements.map((req) => (
          <Typography
            key={req.label}
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: req.valid ? 'success.light' : 'rgba(255, 255, 255, 0.5)',
              transition: 'color 0.3s ease',
            }}
          >
            {req.valid ? <CheckIcon sx={{ fontSize: '1rem', mr: 0.5 }}/> : <CloseIcon sx={{ fontSize: '1rem', mr: 0.5 }}/>}
            {req.label}
          </Typography>
        ))}
      </Box>
    );
  };

  
  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: `url(${backgroundUrl}) no-repeat center center / cover`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', '@keyframes fadeIn': {'0%': { opacity: 0, transform: 'scale(0.97)' }, '100%': { opacity: 1, transform: 'scale(1)' }}, '@keyframes slideAndFadeIn': {'0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' }}, '@keyframes inputFocusGlow': {'from': { borderBottomColor: 'rgba(255, 255, 255, 0.7)', boxShadow: '0 1px 0 0 rgba(191, 40, 176, 0)'}, 'to': { borderBottomColor: '#BF28B0', boxShadow: '0 2px 15px -2px rgba(191, 40, 176, 0.6)'}}, '@keyframes iconFadeIn': {'0%': { opacity: 0, transform: 'scale(0.7)' }, '100%': { opacity: 1, transform: 'scale(1)' }}, '@keyframes check-pop': {'0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3) rotate(10deg)' }, '100%': { transform: 'scale(1) rotate(0deg)' }}}}>
      <Box sx={{ position: 'relative', width: showLogin ? '950px' : '400px', height: '600px', maxWidth: '95vw', maxHeight: '95vh', boxShadow: '0px 10px 40px -10px rgba(0, 0, 0, 0.4)', borderRadius: '20px', display: 'flex', overflow: 'hidden', transition: 'width 0.9s cubic-bezier(0.68, -0.55, 0.27, 1.55)', animation: !showLogin ? 'fadeIn 1.2s ease-in-out' : 'none'}}>
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(30, 10, 50, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '20px'}} />
        <Box sx={{ position: 'absolute', top: '50%', left: showLogin ? '25%' : '50%', transform: 'translate(-50%, -50%)', transition: 'left 0.9s cubic-bezier(0.68, -0.55, 0.27, 1.55)', width: '380px', textAlign: 'center'}}>
            <img src={logoUrl} alt="Publi Match Logo" style={{ maxWidth: '380px', height: 'auto' }} />
        </Box>
        <Box sx={{ position: 'absolute', top: '50%', left: '75%', transform: 'translate(-50%, -50%)', width: 'calc(50% - 96px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: showLogin ? 1 : 0, transition: 'opacity 0.6s ease-in-out 0.5s'}}>
           
           {/* Vista de Login */}
           {view === 'login' && (
            <Box sx={{width: '100%'}} component="form" onSubmit={handleLoginSubmit}>
              <Box sx={{ width: '100%', animation: 'slideAndFadeIn 0.7s ease-out 0.5s both', textAlign: 'center' }}>
                 <img src={userIconUrl} alt="User Icon" style={{ width: '130px', height: '130px', marginBottom: '1.5rem', opacity: 0.9 }} />
              </Box>
              <TextField placeholder="Insira o seu e-mail" fullWidth variant="standard" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} error={!!emailError} helperText={emailError} InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutlineIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /></InputAdornment>)}} sx={{ mb: 2.5, animation: 'slideAndFadeIn 0.7s ease-out 0.6s both', '& .MuiInput-underline:before': { borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: '1px solid #BF28B0' }, '& .MuiInput-underline.Mui-focused:after': { animation: 'inputFocusGlow 0.5s forwards' }, '& .MuiInputBase-input': { color: 'white', '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 100px #1e0a32 inset', WebkitTextFillColor: '#FFF'}}, '& .MuiFormHelperText-root': { color: '#ff8a80' }}} />
              <TextField type={showPassword ? 'text' : 'password'} placeholder="Insira a sua senha" fullWidth variant="standard" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} error={!!passwordError} helperText={passwordError} InputProps={{ startAdornment: (<InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#FFFFFF' } }}>{showPassword ? <VisibilityOff sx={{ animation: 'iconFadeIn 0.3s ease-in-out' }}/> : <Visibility sx={{ animation: 'iconFadeIn 0.3s ease-in-out' }}/>}</IconButton></InputAdornment>)}} sx={{ mb: 2.5, animation: 'slideAndFadeIn 0.7s ease-out 0.7s both', '& .MuiInput-underline:before': { borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: '1px solid #BF28B0' }, '& .MuiInput-underline.Mui-focused:after': { animation: 'inputFocusGlow 0.5s forwards' }, '& .MuiInputBase-input': { color: 'white' }, '& .MuiFormHelperText-root': { color: '#ff8a80' }}} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 3.5, animation: 'slideAndFadeIn 0.7s ease-out 0.8s both' }}>
               <FormControlLabel 
  control={
    <Checkbox 
      size="small"
      checked={rememberMe} // <--- ADICIONE checked
      onChange={(e) => setRememberMe(e.target.checked)} // <--- ADICIONE onChange
      sx={{ 
        color: 'rgba(255, 255, 255, 0.7)', 
        '&.Mui-checked': { 
          color: '#E635B6', 
          '& .MuiSvgIcon-root': { animation: 'check-pop 0.4s ease-out' }
        }
      }} 
    />
  } 
  label={<Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', transition: 'color 0.2s ease-out' }}>Lembrar da conta</Typography>} 
  sx={{ '&:hover': { '& .MuiCheckbox-root': { transform: 'scale(1.2)' }, '& .MuiTypography-root': { color: '#FFFFFF' }}}} 
/>
                <MuiLink component="button" onClick={() => handleViewChange('forgot')} underline="none" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', '&:hover': { color: '#FFFFFF' } }}>Esqueci a senha</MuiLink>
              </Box>
              <Button type="submit" variant="contained" disabled={loading} sx={{ py: 1.2, width: '60%', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', color: 'white', textTransform: 'none', background: 'linear-gradient(45deg, #BF28B0 30%, #E635B6 90%)', boxShadow: '0 4px 15px -5px rgba(191, 40, 176, .7)', animation: 'slideAndFadeIn 0.7s ease-out 0.9s both', '&:hover': { transform: 'scale(1.05) translateY(-3px)', boxShadow: '0 8px 25px -8px rgba(191, 40, 176, 1)', background: 'linear-gradient(45deg, #d82ec9 30%, #ff3cc9 90%)'}}}>{loading ? <CircularProgress size={24} color="inherit" /> : 'Confirmar'}</Button>
            </Box>
           )}

           {/* Vista de Recuperar Senha */}
           {view === 'forgot' && (
            <Box component="form" onSubmit={handleForgotPasswordSubmit} sx={{width: '100%', textAlign: 'left', animation: 'fadeIn 0.5s ease-in-out', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold', color: '#E635B6' }}>Recuperar Senha</Typography>
                <Typography sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Insira seu e-mail para receber um código de verificação.</Typography>
                <TextField placeholder="Insira o seu e-mail" fullWidth variant="standard" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} error={!!error} helperText={error} InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutlineIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /></InputAdornment>)}} sx={{ mb: 4, width: '100%', '& .MuiInput-underline:before': { borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: '1px solid #BF28B0' }, '& .MuiInput-underline.Mui-focused:after': { animation: 'inputFocusGlow 0.5s forwards' }, '& .MuiInputBase-input': { color: 'white', '&:-webkit-autofill': { WebkitBoxShadow: '0 0 0 100px #1e0a32 inset', WebkitTextFillColor: '#FFF'}}, '& .MuiFormHelperText-root': { color: '#ff8a80' }}} />
                <Button type="submit" variant="contained" disabled={loading} sx={{ py: 1.2, px: 5, borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', color: 'white', textTransform: 'none', background: 'linear-gradient(45deg, #BF28B0 30%, #E635B6 90%)', boxShadow: '0 4px 15px -5px rgba(191, 40, 176, .7)', '&:hover': { transform: 'scale(1.05) translateY(-3px)', boxShadow: '0 8px 25px -8px rgba(191, 40, 176, 1)'}}}>{loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Código'}</Button>
                <MuiLink component="button" onClick={() => handleViewChange('login')} sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', mt: 3, display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', '&:hover': { color: '#FFFFFF' }}}><ArrowBackIcon sx={{ fontSize: '1rem', mr: 0.5 }}/>Voltar para o Login</MuiLink>
            </Box>
           )}
           
           {/* Vista para Inserir Código */}
           {view === 'enterCode' && (
             <Box component="form" onSubmit={handleVerifyCodeSubmit} sx={{width: '100%', textAlign: 'left', animation: 'fadeIn 0.5s ease-in-out', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold', color: '#E635B6' }}>Verifique seu E-mail</Typography>
                <Typography sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Enviámos um código de 6 dígitos para <strong>{email}</strong>.</Typography>
                <TextField name="code" placeholder="Insira o código" fullWidth variant="standard" error={!!error} helperText={error} InputProps={{ startAdornment: (<InputAdornment position="start"><VpnKeyIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /></InputAdornment>)}} sx={{ mb: 4, width: '100%', '& .MuiInput-underline:before': { borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }, '& .MuiInputBase-input': { color: 'white', letterSpacing: '5px', fontSize: '1.2rem' }, '& .MuiFormHelperText-root': { color: '#ff8a80' }}} />
                <Button type="submit" variant="contained" sx={{ py: 1.2, px: 5, borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', color: 'white', textTransform: 'none', background: 'linear-gradient(45deg, #BF28B0 30%, #E635B6 90%)'}}>Verificar</Button>
                <MuiLink component="button" onClick={() => handleViewChange('forgot')} sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', mt: 3, display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', '&:hover': { color: '#FFFFFF' }}}><ArrowBackIcon sx={{ fontSize: '1rem', mr: 0.5 }}/>Voltar</MuiLink>
            </Box>
           )}

           {/* Vista de Redefinição de Senha */}
           {view === 'resetPassword' && (
             <Box component="form" onSubmit={handleResetPasswordSubmit} sx={{width: '100%', textAlign: 'left', animation: 'fadeIn 0.5s ease-in-out', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold', color: '#E635B6' }}>Crie uma Nova Senha</Typography>
                <TextField name="newPassword" type={showPassword ? 'text' : 'password'} placeholder="Nova Senha" fullWidth variant="standard" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>)}} sx={{ mb: 0, width: '100%', '& .MuiInputBase-input': { color: 'white' }, '& .MuiInput-underline:before': { borderBottom: '1px solid rgba(255, 255, 255, 0.4)' } }} />
                <PasswordStrengthIndicator password={newPassword} />
                <TextField name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirmar Nova Senha" fullWidth variant="standard" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} error={!!error} helperText={error} InputProps={{ startAdornment: (<InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownConfirmPassword} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>)}} sx={{ mb: 2, width: '100%', '& .MuiInputBase-input': { color: 'white' }, '& .MuiInput-underline:before': { borderBottom: '1px solid rgba(255, 255, 255, 0.4)' }, '& .MuiFormHelperText-root': { color: '#ff8a80' } }} />
                
                <Button onClick={generateStrongPassword} variant="text" sx={{textTransform: 'none', color: '#E635B6', mb:2}}>Sugerir Senha Forte</Button>
                <Collapse in={!!suggestedPassword}>
                    <Box sx={{ p: 1, mb: 2, borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2" sx={{color: 'white', letterSpacing: '1px'}}>{suggestedPassword}</Typography>
                        <IconButton size="small" onClick={() => { navigator.clipboard.writeText(suggestedPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                            {copied ? <CheckIcon sx={{color: 'success.light', fontSize: '1rem'}}/> : <ContentCopyIcon sx={{color: 'white', fontSize: '1rem'}}/>}
                        </IconButton>
                    </Box>
                </Collapse>

                <Button type="submit" variant="contained" disabled={loading} sx={{ py: 1.2, px: 5, borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', color: 'white', textTransform: 'none', background: 'linear-gradient(45deg, #BF28B0 30%, #E635B6 90%)'}}>{loading ? <CircularProgress size={24} color="inherit" /> : 'Salvar Nova Senha'}</Button>
            </Box>
           )}

           {/* Vista de Sucesso na Redefinição */}
           {view === 'resetSuccess' && (
            <Box sx={{ width: '100%', textAlign: 'center', animation: 'fadeIn 0.5s ease-in-out' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#4caf50', mb: 2}}/>
                <Typography variant="h5" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>Senha Redefinida!</Typography>
                <Typography sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.8)' }}>A sua senha foi atualizada com sucesso.</Typography>
                <MuiLink component="button" onClick={() => handleViewChange('login')} sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', '&:hover': { color: '#FFFFFF' }}}><ArrowBackIcon sx={{ fontSize: '1rem', mr: 0.5 }}/>Voltar para o Login</MuiLink>
            </Box>
           )}

        </Box>
      </Box>
    </Box>
  );
};

export default AnimatedLogin;

