import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import { AuthProvider } from './auth/AuthContext';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* 👈 Envolva o App com ele */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);