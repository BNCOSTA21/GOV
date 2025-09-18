import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Páginas novas
import CheckoutPixAutomatic from './pages/CheckoutPixAutomatic.tsx';
import Obrigado from './pages/Obrigado.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Página inicial existente */}
        <Route path="/" element={<App />} />

        {/* NOVAS rotas */}
        <Route path="/checkout" element={<CheckoutPixAutomatic />} />
        <Route path="/obrigado" element={<Obrigado />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
