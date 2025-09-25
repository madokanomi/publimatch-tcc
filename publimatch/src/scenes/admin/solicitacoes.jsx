import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, Avatar, Chip, IconButton, CircularProgress, Collapse, Link, Skeleton } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import Header from '../../components/Header';
import { CheckCircleOutline, CancelOutlined, MailOutline, Groups as GroupsIcon } from "@mui/icons-material";
import { motion } from "framer-motion";

// VARIANTS DE ANIMAÇÃO
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

// COMPONENTE PARA O "ESQUELETO" DE UM CARD DE SOLICITAÇÃO
const SolicitacaoCardSkeleton = () => (
    <Card sx={{
        background: "linear-gradient(90deg, rgba(30, 58, 138, 0.4), rgba(59, 130, 246, 0.2))",
        borderRadius: "12px",
        mb: 2,
        p: 2,
    }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', md: '2fr 1.5fr 1fr 1.5fr' }, gap: 2, alignItems: "center" }}>
            <Box display="flex" alignItems="center" gap={1.5}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="80%" height={18} />
                </Box>
            </Box>
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: '16px', display: {xs: 'none', md: 'block'} }} />
            <Skeleton variant="text" width={80} height={24} sx={{display: {xs: 'none', md: 'block'}}} />
            <Box display="flex" gap={1} justifyContent="flex-end">
                <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: '8px' }} />
            </Box>
        </Box>
    </Card>
);


// COMPONENTE DO CARD DE SOLICITAÇÃO
const SolicitacaoCard = ({ solicitacao, isExpanded, onToggleExpand, onApprove, onReject }) => {
    return (
        <motion.div variants={itemVariants} layout>
            <Card sx={{ 
                background: "linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(246, 59, 227, 0.1))",
                backdropFilter: "blur(8px)",
                borderRadius: "12px",
                border:"#ffffff44 solid 1px",
                mb: 2,
                cursor: 'pointer',
                transition: "all 0.2s ease",
                '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "10px 0px 15px rgba(21, 0, 24, 0.57)",
                },
             }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {xs: '1fr auto', md: '2fr 1.5fr 1fr 1.5fr'},
                        gap: 2,
                        alignItems: "center",
                        p: 2,
                    }}
                    onClick={onToggleExpand}
                >
                    {/* Contato (Nome e Avatar) */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                            {solicitacao.nomeContato.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" color="white" fontWeight={600} noWrap>{solicitacao.nomeContato}</Typography>
                            <Typography variant="caption" color="rgba(255,255,255,0.7)" noWrap>
                                {solicitacao.nomeAgenciaOuEmpresa || solicitacao.emailContato}
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Tipo, Data e Ações */}
                    <Chip label={solicitacao.tipoCadastro} sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", color: "#ffffffff", fontWeight: 'bold', display: {xs: 'none', md: 'flex'} }} />
                    <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{display: {xs: 'none', md: 'block'}}}>
                        {new Date(solicitacao.createdAt).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Box display="flex" gap={1} justifyContent="flex-end">
                        <IconButton onClick={(e) => { e.stopPropagation(); onApprove(solicitacao._id); }} sx={{ backgroundColor: 'rgba(0, 255, 98, 0.38)', '&:hover': { backgroundColor: 'rgba(42, 151, 71, 0.41)' }, borderRadius: '8px' }}>
                            <CheckCircleOutline sx={{ color: '#ffffff' }} />
                        </IconButton>
                        <IconButton onClick={(e) => { e.stopPropagation(); onReject(solicitacao._id); }} sx={{ backgroundColor: 'rgba(186, 30, 90, 0.64)', '&:hover': { backgroundColor: 'rgba(145, 45, 88, 0.58)' }, borderRadius: '8px' }}>
                            <CancelOutlined sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Conteúdo Expansível com as Novas Informações */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, pt: 0, borderTop: '1px solid rgba(255,255,255,0.1)', mt: 2 }}>
                        <Typography variant="h6" color="white" sx={{ mb: 1, mt: 2 }}>Detalhes da Solicitação:</Typography>
                        
                        {solicitacao.descricao && <Typography variant="body2" color="rgba(255,255,255,0.8)"><strong>Descrição:</strong> {solicitacao.descricao}</Typography>}
                        {solicitacao.redesSociais && <Typography variant="body2" color="rgba(255,255,255,0.8)"><strong>Redes Sociais:</strong> {solicitacao.redesSociais}</Typography>}
                        {solicitacao.website && <Typography variant="body2" color="rgba(255,255,255,0.8)"><strong>Website:</strong> <Link href={solicitacao.website} target="_blank" color="inherit">{solicitacao.website}</Link></Typography>}
                        {solicitacao.nicho && <Typography variant="body2" color="rgba(255,255,255,0.8)"><strong>Nicho:</strong> {solicitacao.nicho}</Typography>}
                        {solicitacao.seguidores != null && <Typography variant="body2" color="rgba(255,255,255,0.8)"><strong>Seguidores:</strong> {solicitacao.seguidores.toLocaleString('pt-BR')}</Typography>}

                        {solicitacao.detalhesEquipe && (
                            <Box mt={2} p={2} borderRadius="8px" bgcolor="rgba(0,0,0,0.2)">
                                <Typography variant="subtitle1" color="white" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                                    <GroupsIcon />
                                    Detalhes da Equipe Solicitada
                                </Typography>
                                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                                    <strong>Agentes de Publicidade:</strong> {solicitacao.detalhesEquipe.agentesPublicidade}
                                </Typography>
                                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                                    <strong>Agentes de Influenciadores:</strong> {solicitacao.detalhesEquipe.agentesInfluenciador}
                                </Typography>
                            </Box>
                        )}
                        
                        <Box mt={2} textAlign="center">
                            <Button
                                variant="outlined"
                                startIcon={<MailOutline />}
                                href={`mailto:${solicitacao.emailContato}?subject=Contato sobre sua solicitação na PubliMatch`}
                                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}
                            >
                                Enviar E-mail para Verificação
                            </Button>
                        </Box>
                    </Box>
                </Collapse>
            </Card>
        </motion.div>
    );
};


const Solicitacoes = () => {
    const { user } = useAuth();
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // MUDANÇA 1: Colocar a lógica de busca de dados em sua própria função
    const fetchSolicitacoes = async () => {
        // Não recarregar se já estiver carregando
        if (!loading) setLoading(true); 

        if (user && user.token) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5001/api/solicitacoes/pendentes', config);
                setSolicitacoes(data);
            } catch (error) {
                console.error("Erro ao buscar solicitações:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        // A função a ser chamada quando a janela ganhar foco
        const handleFocus = () => {
            console.log("Aba focada, atualizando dados...");
            fetchSolicitacoes();
        };

        // Adiciona o "ouvinte" de evento
        window.addEventListener('focus', handleFocus);

        // Função de limpeza: remove o "ouvinte" quando o componente for desmontado
        // Isso é MUITO importante para evitar vazamentos de memória
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [user]);

    useEffect(() => {
        fetchSolicitacoes();
    }, [user]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5001/api/solicitacoes/${id}`, { status }, config);
            setSolicitacoes(prev => prev.filter(s => s._id !== id));
            alert(`Solicitação marcada como '${status}' com sucesso!`);
        } catch (error) {
            console.error(`Erro ao processar solicitação:`, error);
            alert(`Falha ao processar a solicitação: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleApprove = (id) => handleUpdateStatus(id, 'aprovado');
    const handleReject = (id) => handleUpdateStatus(id, 'rejeitado');
    const handleToggleExpand = (id) => setExpandedId(currentId => (currentId === id ? null : id));

    if (loading) {
        return (
            <Box m="20px">
                <Header title="Solicitações de Cadastro" subtitle="Clique em um card para ver mais detalhes e entrar em contato." />
                <Box mt="40px">
                    <SolicitacaoCardSkeleton />
                    <SolicitacaoCardSkeleton />
                    <SolicitacaoCardSkeleton />
                </Box>
            </Box>
        );
    }

    return (
        <Box m="20px">
            <Header title="Solicitações de Cadastro" subtitle="Clique em um card para ver mais detalhes e entrar em contato." />
            
            <Box mt="40px" height="calc(100vh - 200px)" overflow="auto" pt='20px' pb='90px'
                sx={{ transition: "all 0.3s ease-in-out",
        willChange: "width",
        "&::-webkit-scrollbar": { width: "10px", marginRight: "10px" },
        "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
        "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
        "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" },}}
                >
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    {solicitacoes.length > 0 ? (
                        solicitacoes.map((solicitacao) => (
                            <SolicitacaoCard
                                key={solicitacao._id}
                                solicitacao={solicitacao}
                                isExpanded={expandedId === solicitacao._id}
                                onToggleExpand={() => handleToggleExpand(solicitacao._id)}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))
                    ) : (
                        <Typography variant="h3" fontWeight="bold" color="white" textAlign="center" mt={4}>
                            Nenhuma solicitação pendente no momento.
                        </Typography>
                    )}
                </motion.div>
            </Box>
        </Box>
    );
};

export default Solicitacoes;

