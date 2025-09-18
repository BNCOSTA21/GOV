# Integração PIX com Mangofy

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Configure suas credenciais da Mangofy:

```env
MANGOFY_API_URL=https://api.mangofy.com.br
MANGOFY_TOKEN=seu_token_secreto_da_mangofy
MANGOFY_ENVIRONMENT=sandbox
```

⚠️ **IMPORTANTE**: Nunca exponha o token como `VITE_MANGOFY_TOKEN` no frontend!

### 2. Backend (Express)

O arquivo `server/mangofy.ts` implementa:

- `POST /api/pix/charge` - Criar cobrança PIX
- `GET /api/pix/status/:txid` - Consultar status do pagamento

### 3. Frontend (React)

O componente `PixScreen.tsx` foi atualizado para:

- ✅ Gerar QR Code localmente usando a biblioteca `qrcode`
- ✅ Exibir código "copia e cola" com botão de copiar
- ✅ Mostrar informações da transação (TXID, expiração)
- ✅ Error handling robusto
- ✅ Loading states e feedback visual

## 🚀 Fluxo de Pagamento

1. **Frontend** → Clica em "Gerar QR CODE"
2. **Backend** → Cria cobrança na Mangofy
3. **Mangofy** → Retorna `brcode` (payload PIX)
4. **Frontend** → Gera QR Code a partir do `brcode`
5. **Usuário** → Escaneia QR ou copia código PIX
6. **Webhook** → Mangofy notifica pagamento (implementar)

## 📱 Recursos Implementados

### QR Code Dinâmico
- Geração local usando biblioteca `qrcode`
- Qualidade otimizada (256x256px)
- Correção de erro nível M

### Código Copia e Cola
- Textarea com código PIX completo
- Botão de copiar com feedback visual
- Instruções claras para o usuário

### Informações da Transação
- TXID único para rastreamento
- Data/hora de expiração
- Status da cobrança

### Error Handling
- Timeout de 15s para API calls
- Mensagens de erro específicas
- Retry automático disponível

## 🔒 Segurança

- ✅ Token da Mangofy mantido apenas no backend
- ✅ Validação de dados com Zod
- ✅ Timeout para prevenir hanging requests
- ✅ Logs estruturados para debugging

## 🧪 Teste Local

Para testar a integração:

1. Configure as variáveis de ambiente
2. Inicie o backend Express
3. Teste o endpoint: `POST /api/pix/charge`
4. Verifique se o QR Code é gerado corretamente

## 📋 TODO

- [ ] Implementar webhook para confirmação de pagamento
- [ ] Adicionar polling para verificar status automaticamente
- [ ] Implementar retry logic para falhas de rede
- [ ] Adicionar métricas e monitoramento
- [ ] Testes unitários e de integração