// Em um novo arquivo, ex: /controllers/empresaController.js

import Empresa from '../models/empresaModel.js';
import User from '../models/userModel.js';

export const suspenderEmpresa = async (req, res) => {
    try {
        const empresaId = req.params.id;

        // 1. Suspende a conta da empresa
        await Empresa.findByIdAndUpdate(empresaId, { statusAssinatura: 'suspensa' });

        // 2. Suspende TODOS os usuários vinculados a essa empresa de uma só vez
        await User.updateMany({ empresaId: empresaId }, { status: 'suspenso' });

        res.status(200).json({ message: 'Empresa e todos os seus usuários foram suspensos.' });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao suspender empresa', error: error.message });
    }
};