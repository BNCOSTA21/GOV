import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const DarfScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/pix');
  };

  const handleNext = () => {
    navigate('/pix');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <motion.div 
        className="flex items-center justify-center py-8 pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-4xl mx-4 space-y-6">
          <Card className="border-blue-200 bg-blue-50 rounded-lg shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <FileText className="text-blue-600" size={48} />
                <div>
                  <h1 className="text-2xl font-bold text-blue-900 mb-2">
                    Documento de Arrecadação
                  </h1>
                  <p className="text-blue-700">DARF - Documento de Arrecadação de Receitas Federais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-2 rounded-lg">
            <div className="bg-gray-50 border-b p-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-900">
                  RECEITA FEDERAL DO BRASIL
                </h2>
                <p className="text-sm text-gray-600">Código da Receita: 0220</p>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <CardTitle className="text-lg mb-4 text-gray-900">
                    Dados do Contribuinte
                  </CardTitle>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium">João Silva Santos</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CPF</p>
                      <p className="font-medium">123.456.789-00</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Período de Apuração</p>
                      <p className="font-medium">01/2022 a 12/2022</p>
                    </div>
                  </div>
                </div>

                <div>
                  <CardTitle className="text-lg mb-4 text-gray-900">
                    Informações do Pagamento
                  </CardTitle>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Data de Vencimento</p>
                      <p className="font-medium text-red-600">15/02/2024</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Descrição da Receita</p>
                      <p className="font-medium">Imposto de Renda - Pessoa Física</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <CardTitle className="text-lg mb-4 text-gray-900">
                  Discriminação dos Valores
                </CardTitle>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Principal:</span>
                    <span className="font-medium">R$ 1.850,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Multa:</span>
                    <span className="font-medium">R$ 370,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Juros:</span>
                    <span className="font-medium">R$ 327,89</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Valor Total:</span>
                    <span>R$ 2.547,89</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-sm text-yellow-800 font-medium">
                    IMPORTANTE: O não pagamento deste débito resultará em inscrição em Dívida Ativa da União e execução fiscal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
            >
              <Download className="mr-2" size={20} />
              Gerar DARF de Pagamento
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DarfScreen;