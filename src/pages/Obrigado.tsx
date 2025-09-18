export default function Obrigado() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-lg rounded-xl border p-4 bg-white/80 dark:bg-slate-900/50">
        <h1 className="text-2xl font-semibold mb-2">Pagamento recebido ✅</h1>
        <p className="opacity-80">
          Obrigado! Seu pagamento via PIX foi confirmado. Você já pode fechar esta página.
        </p>
      </div>
    </div>
  );
}