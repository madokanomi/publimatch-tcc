import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Se o usuário não estiver autenticado, redirecione para /login
    // O `state={{ from: location }}` é opcional, mas útil para redirecionar
    // de volta para a página que ele tentou acessar após o login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderize o componente filho (a página)
  return children;
};

export default ProtectedRoute;