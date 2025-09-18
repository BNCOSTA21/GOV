import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Importar todas as páginas do funil
import LoginScreen from './pages/LoginScreen.tsx';
import ConsultaScreen from './pages/ConsultaScreen.tsx';
import ResultadoScreen from './pages/ResultadoScreen.tsx';
import PagamentoScreen from './pages/PagamentoScreen.tsx';
import DarfScreen from './pages/DarfScreen.tsx';
import PixScreen from './pages/PixScreen.tsx';
import CheckoutPixAutomatic from './pages/CheckoutPixAutomatic.tsx';
import Obrigado from './pages/Obrigado.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Funil completo com rotas separadas */}
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/consulta" element={<ConsultaScreen />} />
        <Route path="/resultado" element={<ResultadoScreen />} />
        <Route path="/pagamento" element={<PagamentoScreen />} />
        <Route path="/darf" element={<DarfScreen />} />
        <Route path="/pix" element={<PixScreen />} />

        {/* Rotas adicionais */}
        <Route path="/checkout" element={<CheckoutPixAutomatic />} />
        <Route path="/obrigado" element={<Obrigado />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
