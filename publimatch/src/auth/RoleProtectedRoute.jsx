import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RoleProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. O usuário está logado? Se não, vai para a página de login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. O usuário tem a permissão necessária?
  // Verificamos se a 'role' do usuário está na lista de 'allowedRoles'
  const isAuthorized = allowedRoles.includes(user?.role);

  // 3. Se tiver permissão, renderiza a página. Se não, volta para o Dashboard.
  return isAuthorized ? <Outlet /> : <Navigate to="/" replace />;
};

export default RoleProtectedRoute;