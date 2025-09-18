// src/components/pix/PixGeneratePanel.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { QrCode, Check, Copy, Loader2, Sparkles, RotateCcw, Clock } from "lucide-react";

/**
 * Elegante painel "mobile-first" para geração do QRCode PIX.
 * - Mostra campo de valor, botão Gerar, e ao abrir exibe um card moderno com QR + ações.
 * - Compatível com Tailwind no tema dark que você usa (slate-900, green-400 etc.).
 * - Injeta o script da Mangofy DENTRO de um container controlado, sem ficar gigante.
 *
 * Props mais comuns:
 *  - scriptCode: string (obrigatório) => data-code da Mangofy
 *  - redirectUrl?: string => data-redirect (opcional)
 *  - defaultAmount?: number => valor inicial a mostrar
 *  - onConfirm?: (amount: number) => void => callback após clicar em "Gerar"
 *
 * Como usar:
 *   <PixGeneratePanel
 *     scriptCode="SEU_DATA_CODE"
 *     redirectUrl="https://seu-dominio.exemplo/"
 *     defaultAmount={49.9}
 *   />
 */

type Props = {
  scriptCode: string;
  redirectUrl?: string;
  defaultAmount?: number;
  label?: string;
  maxQrSizePx?: number; // tamanho máximo do lado do QR (default 260)
  timeoutMs?: number;   // tempo limite para carregar o script (default 12000)
  onConfirm?: (amount: number) => void;
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function PixGeneratePanel({
  scriptCode,
  redirectUrl,
  defaultAmount = 49.9,
  label = "Gerar cobrança PIX",
  maxQrSizePx = 260,
  timeoutMs = 12000,
  onConfirm,
}: Props) {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copiedCC, setCopiedCC] = useState(false); // copia e cola (se exposto futuramente)
  const [createdAt, setCreatedAt] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadedOnceRef = useRef(false);
  const epochRef = useRef(0);
  const abortRef = useRef<number | null>(null);

  const elapsed = useElapsed(createdAt);

  const canGenerate = useMemo(() => amount > 0 && !loading, [amount, loading]);

  const injectScript = () => {
    const mount = containerRef.current;
    if (!mount) return;

    mount.innerHTML = "";
    setErr(null);
    setLoading(true);

    const s = document.createElement("script");
    s.src = "https://compre-safe.com/js/automatic-pix.js";
    s.async = true;
    s.defer = true;
    s.dataset.code = scriptCode;
    if (redirectUrl) s.dataset.redirect = redirectUrl;

    // timeout de segurança
    const timer = window.setTimeout(() => {
      setLoading(false);
      setErr("Tempo esgotado ao gerar o QR. Verifique conexão ou permissões de rede (CSP).");
    }, timeoutMs);
    abortRef.current = timer;

    s.onload = () => {
      if (abortRef.current) window.clearTimeout(abortRef.current);
      abortRef.current = null;
      setLoading(false);
      setCreatedAt(Date.now());
    };
    s.onerror = () => {
      if (abortRef.current) window.clearTimeout(abortRef.current);
      abortRef.current = null;
      setLoading(false);
      setErr("Falha ao carregar o script de QR (compre-safe).");
    };

    mount.appendChild(s);
  };

  // Abre/fecha e injeta só uma vez por epoch
  useEffect(() => {
    if (!open) return;
    if (loadedOnceRef.current) return;
    loadedOnceRef.current = true;
    injectScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, epochRef.current]);

  useEffect(() => {
    return () => {
      if (abortRef.current) window.clearTimeout(abortRef.current);
    };
  }, []);

  const handleGenerate = () => {
    // Apenas abre o card e injeta o script
    setOpen(true);
    setCreatedAt(null);
    onConfirm?.(amount);
  };

  const resetQr = () => {
    loadedOnceRef.current = false;
    epochRef.current += 1;
    if (containerRef.current) containerRef.current.innerHTML = "";
    setErr(null);
    setLoading(false);
    setCreatedAt(null);
    if (open) {
      loadedOnceRef.current = true;
      injectScript();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-400" />
            <h2 className="text-base font-semibold text-gray-200">{label}</h2>
          </div>
          {createdAt && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>gerado há {elapsed}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 grid gap-4">
          {/* Valor + botão */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <label className="grow grid gap-1.5">
              <span className="text-xs text-gray-300">Valor (R$)</span>
              <input
                type="number"
                step="0.01"
                value={Number.isFinite(amount) ? amount : 0}
                onChange={(e) => setAmount(parseFloat(e.target.value || "0"))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-gray-200 outline-none focus:ring-2 focus:ring-green-400/60 placeholder:text-gray-500"
                placeholder="0,00"
                min={0}
              />
              <span className="text-[11px] text-gray-400">
                Valor exibido: <strong className="text-gray-300">{formatBRL(Number.isFinite(amount) ? amount : 0)}</strong>
              </span>
            </label>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-green-500/90 hover:bg-green-500 text-white shadow-sm transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <QrCode className="w-4 h-4" />
              Gerar QR Code
            </button>
          </div>

          {/* Card do QR */}
          {open && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4">
                {/* Container do QR - controlado */}
                <div className="place-self-center">
                  <div
                    className="relative aspect-square rounded-xl border border-slate-800 bg-slate-800/60 overflow-hidden p-2
                               [&_canvas]:!w-full [&_canvas]:!h-full [&_canvas]:object-contain
                               [&_img]:!w-full [&_img]:!h-full [&_img]:object-contain
                               [&_svg]:!w-full [&_svg]:!h-full [&_svg]:object-contain"
                    style={{ width: `${maxQrSizePx}px` }}
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
                    <div className="mt-2 text-xs text-amber-400">
                      {err}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={resetQr}
                      className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-800 text-gray-200"
                    >
                      <RotateCcw className="w-3 h-3" /> Tentar novamente
                    </button>
                  </div>
                </div>

                {/* Lado direito: valor, cópia e dicas */}
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-400">Valor</div>
                    <div className="text-lg font-semibold text-gray-200">{formatBRL(Number.isFinite(amount) ? amount : 0)}</div>
                  </div>

                  {/* Bloco "copia e cola" (opcional - futuro) */}
                  {/*
                  <div className="rounded-lg border border-slate-800 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-800 text-xs text-gray-400">
                      Copia e cola
                    </div>
                    <div className="px-3 py-2 flex items-center justify-between gap-2">
                      <div className="truncate font-mono text-xs text-gray-200">
                        {payload}
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(payload); setCopiedCC(true); setTimeout(()=>setCopiedCC(false), 1200);}}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-slate-700 hover:bg-slate-800"
                        title="Copiar"
                      >
                        {copiedCC ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedCC ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                  </div>
                  */}

                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Aponte a câmera do app do seu banco para pagar.</li>
                    <li>• O QR pode expirar segundo regras do emissor.</li>
                    <li>• Se preferir, utilize o “copia e cola”.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Hook simples: calcula "há Xs/min" */
function useElapsed(since: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!since) return "-";
  const diff = Math.max(0, Math.floor((now - since) / 1000));
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff / 60), s = diff % 60;
  return `${m}m ${s}s`;
}
