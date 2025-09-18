import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export interface UserData {
  name: string;
  cpf: string;
  birthDate: string;
  protocolo: string;
  status?: string;
  situation?: string;
  validationHtmlUrl?: string;
}

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Função para normalizar a data
  const formatDateForAPI = (dateStr: string) => {
    if (dateStr.includes("/")) {
      // se vier DD/MM/AAAA mantém assim (API aceita)
      return dateStr;
    } else if (dateStr.length === 8) {
      // se vier DDMMYYYY transforma em DD/MM/YYYY
      return `${dateStr.slice(0, 2)}/${dateStr.slice(2, 4)}/${dateStr.slice(4)}`;
    }
    return dateStr;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 10);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const generateProtocolo = () => {
    const randomNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `BF-2024-${randomNumber}`;
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Validação básica
    if (!cpf || !dataNascimento || !telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validação de formato CPF
    const cpfNumbers = cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      toast({
        title: "CPF inválido",
        description: "CPF deve conter 11 dígitos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validação de formato da data
    const dateNumbers = dataNascimento.replace(/\D/g, '');
    if (dateNumbers.length !== 8) {
      toast({
        title: "Data inválida",
        description: "Data deve estar no formato DD/MM/AAAA.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const requestPayload = {
        cpf: cpfNumbers, // Enviar apenas números
        birthDate: formatDateForAPI(dataNascimento)
      };

      console.log("Enviando requisição para CPF Hub:", {
        url: "https://api.cpfhub.io/api/cpf",
        payload: requestPayload,
      });

      // Chamada para a API CPF Hub
      const response = await fetch("https://api.cpfhub.io/api/cpf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "ba7fec04a8d771482fc56a42e140a1232651eb5cbff05927e4d883edd17fe226"
        },
        body: JSON.stringify(requestPayload)
      });

      console.log("Response status:", response.status);

      let apiData;
      try {
        apiData = await response.json();
      } catch (jsonError) {
        console.error("Erro ao fazer parse do JSON:", jsonError);
        throw new Error(`Erro no servidor da API (${response.status}): Resposta inválida`);
      }

      // Verifica se a resposta HTTP foi bem-sucedida
      if (!response.ok) {
        
        // Mensagens específicas para diferentes códigos de erro
        let errorMessage = `Erro na API (${response.status})`;
        
        switch (response.status) {
          case 400:
            errorMessage += ": Dados inválidos. Verifique o CPF e data de nascimento.";
            break;
          case 401:
            errorMessage += ": Chave de API inválida ou expirada.";
            break;
          case 403:
            errorMessage += ": Acesso negado. Verifique as permissões da API.";
            break;
          case 429:
            errorMessage += ": Muitas tentativas. Tente novamente em alguns minutos.";
            break;
          case 500:
            errorMessage += ": Erro interno do servidor da API. Tente novamente mais tarde.";
            break;
          case 503:
            errorMessage += ": Serviço temporariamente indisponível.";
            break;
          default:
            errorMessage += `: ${apiData?.message || 'Falha na consulta'}`;
        }
        
        throw new Error(errorMessage);
      }

      // Verifica se a API retornou sucesso
      if (!apiData.success) {
        
        let errorMsg = apiData.message || apiData.error || 'CPF ou data de nascimento não conferem.';
        
        // Mensagens mais específicas baseadas no erro da API
        if (errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('não encontrado')) {
          errorMsg = 'CPF não encontrado na base de dados da Receita Federal.';
        } else if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('inválido')) {
          errorMsg = 'CPF ou data de nascimento inválidos.';
        }
        
        throw new Error(errorMsg);
      }

      // Verifica se os dados necessários estão presentes
      if (!apiData.data || !apiData.data.name) {
        throw new Error('Dados incompletos retornados pela API. Tente novamente.');
      }

      // Criar dados do usuário com dados da API
      const userData: UserData = {
        name: apiData.data.name,
        cpf: apiData.data.cpfNumber || cpfNumbers,
        birthDate: apiData.data.birthDate,
        protocolo: generateProtocolo(),
        status: apiData.data.status,
        situation: apiData.data.situation,
        validationHtmlUrl: apiData.data.validationHtmlUrl
      };

      // Salvar dados no localStorage para usar nas próximas páginas
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Navegar para a próxima página
      navigate('/consulta');
    } catch (error) {
      
      let errorMessage = 'Erro desconhecido na consulta.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão ou CORS. Configure CORS no backend ou verifique sua internet.';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro na consulta",
        description: errorMessage,
        variant: "destructive",
      });
      
      // SEMPRE resetar o loading em caso de erro para permitir nova tentativa
      setIsLoading(false);
    } finally {
      // Garantir que o loading seja resetado mesmo se houver erro no catch
      setIsLoading(false);
    }
  };

  const renderLogo = () => {
    const logoText = "gov.br";
    const colors = ['#2563EB', '#F2C94C', '#27AE60', 'currentColor', '#2563EB', '#F2C94C'];
    
    return (
      <div className="text-2xl font-bold flex items-center justify-center mb-2">
        {logoText.split('').map((char, index) => (
          <span key={index} style={{ color: colors[index] || 'currentColor' }}>
            {char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <motion.div 
        className="min-h-screen flex items-center justify-center pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 border-0">
          <CardHeader className="text-center pb-4">
            {renderLogo()}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">CPF Brasil</h1>
            <p className="text-sm text-gray-600">Receita Federal do Brasil</p>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-blue-800 leading-relaxed">
                  Ao prosseguir, você concorda com nossos{' '}
                  <span className="underline cursor-pointer">Termos de Uso</span>
                  {' '}e{' '}
                  <span className="underline cursor-pointer">Política de privacidade</span>
                  .
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> Digite seu CPF:
                </Label>
                <Input
                  id="cpf"
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> Digite sua data de nascimento:
                </Label>
                <Input
                  id="dataNascimento"
                  type="text"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(formatDate(e.target.value))}
                  placeholder="DD/MM/AAAA"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> Digite seu telefone:
                </Label>
                <Input
                  id="telefone"
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full text-white font-bold py-3 rounded-lg hover:bg-blue-700"
              style={{ backgroundColor: '#0057FF' }}
            >
              {isLoading ? 'Consultando...' : '→ ENTRAR COM GOV.BR'}
            </Button>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Lock size={16} />
              <span>Conexão segura</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <Toaster />
    </div>
  );
};

export default LoginScreen;