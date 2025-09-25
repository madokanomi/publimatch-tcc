import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Verifique se o nome do seu arquivo é userModel.js

// Middleware para verificar se o token é válido
export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Adiciona o usuário (sem a senha) ao objeto `req`
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'Usuário não encontrado.' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Não autorizado, token inválido.' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, sem token.' });
    }
};

// Middleware para verificar a role do usuário
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Acesso negado. A role '${req.user.role}' não tem permissão.` });
        }
        next();
    };
};

// Middleware para verificar se o usuário é admin da empresa
export const isCompanyAdmin = (req, res, next) => {
    if (req.user && req.user.isCompanyAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Apenas administradores da empresa podem realizar esta ação.' });
    }
};