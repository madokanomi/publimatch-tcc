// src/scenes/equipe/index.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, Select, MenuItem, FormControl, InputLabel, DialogActions } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import Header from '../../components/Header';
import AddIcon from '@mui/icons-material/Add';

const Equipe = () => {
    const { user } = useAuth();
    const [membros, setMembros] = useState([]);
    const [open, setOpen] = useState(false); // Controla o modal de convite
    const [novoMembro, setNovoMembro] = useState({ name: '', email: '', role: 'AD_AGENT' });

    const fetchMembros = async () => {
        // Lógica para buscar os membros da equipe com axios em GET /api/users/equipe
    };

    useEffect(() => {
        fetchMembros();
    }, []);

    const handleInvite = async () => {
        // Lógica para enviar o convite com axios em POST /api/users/convidar
        // Após o sucesso, fechar o modal e recarregar a lista.
        console.log("Convidando:", novoMembro);
        // ... Lógica da API aqui ...
        setOpen(false); // Fecha o modal
        fetchMembros(); // Atualiza a lista
    };
    
    const columns = [
        { field: "name", headerName: "Nome", flex: 1 },
        { field: "email", headerName: "Email", flex: 1.5 },
        { field: "role", headerName: "Função", flex: 1 },
        { field: "status", headerName: "Status", flex: 0.5 },
    ];

    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Gerenciar Equipe" subtitle="Convide e gerencie os membros da sua equipe." />
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    Convidar Usuário
                </Button>
            </Box>

            <Box m="40px 0" height="60vh">
                <DataGrid
                    rows={membros}
                    columns={columns}
                    getRowId={(row) => row._id}
                />
            </Box>

            {/* Modal de Convite */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Convidar Novo Membro</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Nome Completo" type="text" fullWidth onChange={(e) => setNovoMembro({...novoMembro, name: e.target.value})} />
                    <TextField margin="dense" label="Endereço de E-mail" type="email" fullWidth onChange={(e) => setNovoMembro({...novoMembro, email: e.target.value})} />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Função</InputLabel>
                        <Select
                            value={novoMembro.role}
                            label="Função"
                            onChange={(e) => setNovoMembro({...novoMembro, role: e.target.value})}
                        >
                            <MenuItem value={'AD_AGENT'}>Agente de Publicidade</MenuItem>
                            <MenuItem value={'INFLUENCER_AGENT'}>Agente de Influenciador</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleInvite} variant="contained">Enviar Convite</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Equipe;