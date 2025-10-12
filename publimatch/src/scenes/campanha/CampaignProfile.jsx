// src/scenes/campanha/CampaignProfile.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, Button, Menu, MenuItem, IconButton, CircularProgress } from "@mui/material";
import { ArrowBack, InfoOutlined, People, GroupAdd, BarChart, ExpandMore, Visibility, GroupWork, TrendingUp } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { useAuth } from "../../auth/AuthContext";
import CampaignAbout from "../../components/CampaignAbout";
import CampaignInfluencers from "../../components/CampaignInfluencers";
import CampaignCandidates from "../../components/CampaignCandidates";
import CampaignStats from "../../components/CampaignStats";
    
const defaultBackgroundImageUrl = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1740&q=80";

const CampaignProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isAboutOnlyView = searchParams.get('view') === 'about';
    const { user } = useAuth();

    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [activeTab, setActiveTab] = useState(isAboutOnlyView ? "Detalhes" : "Candidatos");
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        if (!user) return;

        const fetchCampaign = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`http://localhost:5001/api/campaigns/${id}`, config);
                setCampaign(data);
            } catch (err) {
                setError("Campanha não encontrada ou você não tem permissão para vê-la.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [id, user]);

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
    const tabContentVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -15 } };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" sx={{ p: 4, textAlign: 'center' }}>{error}</Typography>;
    if (!campaign) return null;

    const tabs = [
        { name: "Detalhes", icon: InfoOutlined },
        { name: "Candidatos", icon: GroupAdd },
        { name: "Influenciadores", icon: People },
        { name: "Estatísticas", icon: BarChart },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "Detalhes": return <motion.div key="detalhes" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit"><CampaignAbout campaign={campaign} isAboutOnlyView={isAboutOnlyView} /></motion.div>;
            case "Candidatos": return <motion.div key="candidatos" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit"><CampaignCandidates campaign={campaign} /></motion.div>;
            case "Influenciadores": return <motion.div key="influenciadores" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit"><CampaignInfluencers campaign={campaign} /></motion.div>;
            case "Estatísticas": return <motion.div key="estatisticas" variants={tabContentVariants} initial="hidden" animate="visible" exit="exit"><CampaignStats campaign={campaign} /></motion.div>;
            default: return null;
        }
    };
    
    return (
        <Box p={3} sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 110px)',
            overflowY: 'auto',
            paddingRight: '15px',
            willChange: "width",
            "&::-webkit-scrollbar": { width: "10px" },
            "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" },
        }}>
            <Box sx={{ alignSelf: 'flex-start', mb: 2, flexShrink: 0 }}>
                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                        color: "white",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                        },
                    }}
                >
                    <ArrowBack />
                </IconButton>
            </Box>

            <Box sx={{ flexShrink: 0 }}>
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants}>
                        <Box
                            sx={{
                                position: "relative",
                                borderRadius: 3,
                                p: 4,
                                color: "white",
                                background: `linear-gradient(135deg, rgba(40, 2, 39, 0.85) 0%, rgba(24, 1, 38, 0.9) 100%), url(${campaign.logo || defaultBackgroundImageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backdropFilter: "blur(20px)",
                                overflow: "hidden",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                        >
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h3" fontWeight="bold" mb={1}>{campaign.name || campaign.title}</Typography>
                                    <Button
                                        variant="contained"
                                        disabled={isAboutOnlyView}
                                        onClick={!isAboutOnlyView ? (e) => setAnchorEl(e.currentTarget) : null}
                                        endIcon={<ExpandMore />}
                                        sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: "20px", fontWeight: "bold", textTransform: "none", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.3)" } }}
                                    >
                                        Status: {campaign.status}
                                    </Button>
                                    {!isAboutOnlyView && (
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl)}
                                            onClose={() => setAnchorEl(null)}
                                            MenuListProps={{ sx: { backgroundColor: "#333", color: "white" } }}
                                        >
                                            {['Aberta', 'Planejamento', 'Finalizada', 'Cancelada'].map((s) => (
                                                <MenuItem key={s} onClick={() => { setAnchorEl(null); }}>{s}</MenuItem>
                                            ))}
                                        </Menu>
                                    )}
                                </Box>
                                <Box display="flex" gap={5} alignItems="center">
                                    <motion.div variants={itemVariants}>
                                        <Box textAlign="center"><Visibility sx={{ fontSize: 32, color: "#2196f3" }} /><Typography variant="h5" fontWeight="bold">{campaign.views}</Typography><Typography variant="caption" sx={{ opacity: 0.8 }}>Visualizações</Typography></Box>
                                    </motion.div>
                                    <motion.div variants={itemVariants}>
                                        <Box textAlign="center"><GroupWork sx={{ fontSize: 32, color: "#9c27b0" }} /><Typography variant="h5" fontWeight="bold">{campaign.influencers}</Typography><Typography variant="caption" sx={{ opacity: 0.8 }}>Influenciadores</Typography></Box>
                                    </motion.div>
                                    <motion.div variants={itemVariants}>
                                        <Box textAlign="center"><TrendingUp sx={{ fontSize: 32, color: "#ff1493" }} /><Typography variant="h5" fontWeight="bold">{campaign.engagement}</Typography><Typography variant="caption" sx={{ opacity: 0.8 }}>Engajamento</Typography></Box>
                                    </motion.div>
                                </Box>
                            </Box>
                        </Box>
                    </motion.div>

                    {!isAboutOnlyView && (
                        <motion.div variants={itemVariants}>
                            <Box
                                display="flex"
                                justifyContent="center"
                                gap={2}
                                my={3}
                                p={1}
                                sx={{
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    borderRadius: "20px",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    flexShrink: 0,
                                }}
                            >
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <Button
                                            key={tab.name}
                                            startIcon={<Icon />}
                                            onClick={() => setActiveTab(tab.name)}
                                            sx={{
                                                color: activeTab === tab.name ? "white" : "rgba(255,255,255,0.7)",
                                                backgroundColor: activeTab === tab.name ? "rgba(255, 255, 255, 0.15)" : "transparent",
                                                borderRadius: "15px",
                                                px: 3,
                                                py: 1.5,
                                                fontWeight: "bold",
                                                textTransform: "none",
                                                transition: "all 0.3s ease",
                                                border: activeTab === tab.name ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid transparent",
                                                "&:hover": {
                                                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                                                }
                                            }}
                                        >
                                            {tab.name}
                                        </Button>
                                    );
                                })}
                            </Box>
                        </motion.div>
                    )}

                    <Box sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        mt:"10px",
                        willChange: "width",
                        "&::-webkit-scrollbar": { width: "10px" },
                        "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.1)", borderRadius: "10px" },
                        "&::-webkit-scrollbar-thumb": { background: "rgba(255, 255, 255, 0.3)", borderRadius: "10px" },
                        "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.6)" },
                    }}>
                        <AnimatePresence mode="wait">
                            {renderTabContent()}
                        </AnimatePresence>
                    </Box>
                </motion.div>
            </Box>
        </Box>
    );
};

export default CampaignProfile;