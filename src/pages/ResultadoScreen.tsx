import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Timer } from '@/components/Timer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserData {
  name: string;
  cpf: string;
  birthDate: string;
  protocolo: string;
  status?: string;
  situation?: string;
  validationHtmlUrl?: string;
}

const ResultadoScreen: React.FC = () => {
  const navigate = useNavigate();
  
  // Recuperar dados do localStorage
  const userData: UserData | null = JSON.parse(localStorage.getItem('userData') || 'null');
  
  // Usar dados da API ou fallback para dados padrão
  const displayName = userData?.name || "João Silva Santos";
  const displayCpf = userData?.cpf || "123.456.789-00";
  const displayBirthDate = userData?.birthDate || "15/03/1985";
  const displayProtocolo = userData?.protocolo || "BF-2024-789456123";
  const displayInitials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  // Dados extras da API
  const displayStatus = userData?.status;
  const displaySituation = userData?.situation;
  const validationUrl = userData?.validationHtmlUrl;

  const handleBack = () => {
    navigate('/login');
  };

  const handleNext = () => {
    navigate('/pagamento');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Cabeçalho vermelho crítico */}
      <div className="bg-red-600 text-white p-4 shadow-lg mt-16">
        <div className="container mx-auto flex items-center justify-center space-x-3">
          <AlertTriangle size={24} />
          <span className="text-lg font-bold">STATUS: BENEFÍCIO NÃO ATIVO</span>
        </div>
      </div>

      {/* Aviso amarelo */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
        <div className="container mx-auto">
          <p className="text-yellow-800 text-sm font-medium flex items-start space-x-2">
            <span className="text-yellow-600 flex-shrink-0">⚠️</span>
            <span>
              <strong>Atenção:</strong> Seu cadastro existe, mas o Bolsa Família ainda não está ativo.
              Para começar a receber, é necessário atualizar ou confirmar seus dados no CadÚnico e ativar o benefício.
            </span>
          </p>
        </div>
      </div>

      <motion.div 
        className="container mx-auto px-4 py-8 max-w-7xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Cartão central do usuário */}
        <Card className="bg-white rounded-xl shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {displayInitials}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                <p className="text-gray-600">Data de Nascimento: {displayBirthDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de informações */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white rounded-lg shadow-md">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Data de Nascimento</p>
              <p className="font-bold text-lg">{displayBirthDate}</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200 rounded-lg shadow-md">
            <CardContent className="p-4">
              <p className="text-sm text-red-600">Situação Cadastral</p>
              <div className="space-y-2">
                <Badge variant="destructive" className="bg-red-600 text-white font-bold">
                  Cadastro Desatualizado
                </Badge>
                <p className="text-sm text-red-700 font-medium">
                  Seu benefício do Bolsa Família ainda não está ativo porque o Cadastro Único precisa de atualização.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200 rounded-lg shadow-md">
            <CardContent className="p-4">
              <p className="text-sm text-red-600">Status Bolsa Família</p>
              <p className="font-bold text-red-700">Cadastro desatualizado</p>
              {displayStatus && (
                <p className="text-sm text-red-600 mt-1">Status API: {displayStatus}</p>
              )}
              {displaySituation && (
                <p className="text-sm text-red-600 mt-1">Situação: {displaySituation}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg shadow-md">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">CPF</p>
              <p className="font-bold text-lg">{displayCpf}</p>
              {validationUrl && (
                <a 
                  href={validationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline mt-2 block"
                >
                  Ver comprovante de validação
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Linha de informações do protocolo */}
        <Card className="bg-gray-50 rounded-lg shadow-md mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Número do Protocolo</p>
                <p className="font-bold">{displayProtocolo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prazo Final para Atualização</p>
                <p className="font-bold text-red-600">27/08/2025</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant="destructive" className="bg-red-600 text-white font-bold">
                  CRÍTICO
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de irregularidade e consequências */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Irregularidade Detectada */}
          <Card className="bg-yellow-50 border-yellow-200 rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-yellow-700">
                Irregularidade Detectada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 font-medium">Seu Cadastro Único está desatualizado</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 font-medium">Endereço e renda não foram confirmados</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 font-medium">Condicionalidades de saúde ou educação estão em atraso</p>
                </div>
              </div>
              <div className="pt-4 border-t border-yellow-200">
                <p className="text-sm text-yellow-800 font-bold flex items-center space-x-2">
                  <span>Sem essa atualização, o Bolsa Família não pode ser liberado.</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Consequências Imediatas */}
          <Card className="bg-red-50 border-red-200 rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-700">
                Consequências Imediatas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">Pagamento bloqueado</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">Exclusão temporária do programa</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">Impossibilidade de saque até atualização</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cronômetro regressivo */}
        <Card className="bg-blue-50 border-blue-200 rounded-xl shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Clock className="text-blue-600" size={32} />
              <div>
                <p className="text-blue-800 font-medium mb-2">Tempo restante para regularização:</p>
                <Timer 
                  initialHours={47}
                  initialMinutes={23}
                  initialSeconds={45}
                  className="text-blue-600 text-4xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={handleBack}
            className="px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Voltar ao Login
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3"
          >
            Regularizar Agora
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultadoScreen;