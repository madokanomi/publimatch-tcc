import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const CompanyAdminProtectedRoute = () => {
    const { isAuthenticated, user } = useAuth();

    // 1. O usuário está logado? Se não, vai para a página de login.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. O usuário é o administrador da empresa dele?
    // Verificamos a flag 'isCompanyAdmin' que definimos no backend.
    const isAuthorized = user?.isCompanyAdmin === true;

    // 3. Se for autorizado, renderiza a página. Se não, volta para o Dashboard.
    return isAuthorized ? <Outlet /> : <Navigate to="/" replace />;
};

export default CompanyAdminProtectedRoute;