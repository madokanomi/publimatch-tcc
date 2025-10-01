import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import CampaignRow from './CampaignRow';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const CampaignsTable = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    // ALTERAÇÃO 1: Reescrito como uma declaração de função async
    async function handleRemove(id) {
        if (window.confirm('Tem certeza que deseja deletar esta campanha?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`http://localhost:5001/api/campaigns/${id}`, config);
                setCampaigns(campaigns.filter(campaign => campaign._id !== id));
            } catch (err) {
                alert('Falha ao deletar a campanha.');
                console.error(err);
            }
        }
    }

    useEffect(() => {
        // ALTERAÇÃO 2: Reescrito também como uma declaração de função async
        async function fetchCampaigns() {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5001/api/campaigns', config);
                setCampaigns(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao buscar campanhas.');
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchCampaigns();
        } else {
            setLoading(false);
        }
    }, [user]);


    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Typography color="error" sx={{ p: 4, textAlign: 'center' }}>{error}</Typography>;
    }
    
    const gridTemplate = '2fr 1fr 1.5fr 1.5fr 1fr 1fr 1fr';

    return (
        <React.Fragment>
            {/* Cabeçalho da tabela */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: gridTemplate,
                    gap: 2,
                    p: 2,
                    pr: '96px',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    fontWeight: 'bold',
                    fontSize: '0.9em',
                    textTransform: 'uppercase',
                }}
            >
                <Typography>Campanha</Typography>
                <Typography sx={{ textAlign: 'center' }}>Status</Typography>
                <Typography sx={{ textAlign: 'center' }}>Duração</Typography>
                <Typography sx={{ textAlign: 'center' }}>Pagamento</Typography>
                <Typography sx={{ textAlign: 'center' }}>Inscrições</Typography>
                <Typography sx={{ textAlign: 'center' }}>Privacidade</Typography>
                <Typography sx={{ textAlign: 'center' }}>Influencers</Typography>
            </Box>

            {/* Corpo da tabela */}
            <Box sx={{ mt: 2 }}>
                {campaigns.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', mt: 4 }}>
                        Nenhuma campanha encontrada.
                    </Typography>
                ) : (
                    campaigns.map((campaign) => (
                        <CampaignRow 
                            key={campaign._id}
                            campaign={campaign} 
                            gridTemplate={gridTemplate}
                            showActions={true} 
                            onRemove={handleRemove}
                        />
                    ))
                )}
            </Box>
        </React.Fragment>
    );
};

export default CampaignsTable;