import { useEffect, useRef, useState } from "react";

// Página que injeta o script da Mangofy exatamente no ponto desejado da tela.
// NÃO fazer fetch/axios. O script da Mangofy monta o checkout sozinho (via iframe).
export default function CheckoutPixAutomatic() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Evita carregar duas vezes em React StrictMode
    if ((window as any).mangofyPixLoaded) return;
    (window as any).mangofyPixLoaded = true;

    try {
      // Limpa o container (caso navegue de volta)
      if (containerRef.current) containerRef.current.innerHTML = "";

      const s = document.createElement("script");
      s.src = "https://compre-safe.com/js/automatic-pix.js";
      s.async = true;

      // === MUDE APENAS ESTES DOIS SE PRECISAR ===
      s.setAttribute("data-code", "vaf5q2mvgeemxp");
      s.setAttribute("data-redirect", "https://portalbolsafamiliagov.site");
      // ==========================================

      s.onerror = () => setError("Falha ao carregar o checkout da Mangofy.");
      containerRef.current?.appendChild(s);
    } catch (e: any) {
      setError(e?.message || "Erro inesperado ao montar o checkout.");
    }

    // cleanup: remove o script/iframe ao sair da página
    return () => {
      const scripts = document.querySelectorAll('script[src*="automatic-pix.js"]');
      scripts.forEach((el) => el.parentElement?.removeChild(el as HTMLScriptElement));
      if (containerRef.current) containerRef.current.innerHTML = "";
      (window as any).__mangofyPixLoaded = false;
    };
  }, []);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-lg rounded-xl border p-4 bg-white/80 dark:bg-slate-900/50">
        <h1 className="text-xl font-semibold mb-3">Pagamento via PIX</h1>
        <p className="text-sm opacity-80 mb-3">
          Aguarde… o checkout seguro da Mangofy será exibido abaixo.
        </p>
        <div ref={containerRef} id="mangofy-pix-container" className="min-h-[420px]" />
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>
    </div>
  );
}