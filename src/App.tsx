import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoginScreen } from '@/components/LoginScreen';
import { ConsultaScreen } from '@/components/ConsultaScreen';
import { ResultadoScreen } from '@/components/ResultadoScreen';
import { PagamentoScreen } from '@/components/PagamentoScreen';
import { DarfScreen } from '@/components/DarfScreen';
import { PixScreen } from '@/components/PixScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

type ScreenType = 'login' | 'consulta' | 'resultado' | 'pagamento' | 'darf' | 'pix';

export interface UserData {
  name: string;
  cpf: string;
  birthDate: string;
  protocolo: string;
  status?: string;
  situation?: string;
  validationHtmlUrl?: string;
}
function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [userData, setUserData] = useState<UserData | null>(null);

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const handleLoginSuccess = (data: UserData) => {
    setUserData(data);
    navigateTo('consulta');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onNext={handleLoginSuccess} />;
      case 'consulta':
        return <ConsultaScreen onNext={() => navigateTo('resultado')} />;
      case 'resultado':
        return (
          <ResultadoScreen 
            userData={userData}
            onBack={() => navigateTo('login')}
            onNext={() => navigateTo('pagamento')}
          />
        );
      case 'pagamento':
        return <PagamentoScreen onNext={() => navigateTo('pix')} />;
      case 'darf':
        return (
          <DarfScreen 
            onBack={() => navigateTo('pix')}
            onNext={() => navigateTo('pix')}
          />
        );
      case 'pix':
        return (
          <PixScreen 
            onBack={() => navigateTo('pagamento')}
            onDarf={() => navigateTo('darf')}
          />
        );
      default:
        return <LoginScreen onNext={handleLoginSuccess} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;