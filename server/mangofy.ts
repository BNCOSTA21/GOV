import express from "express";
import axios from "axios";
import * as z from "zod";

const router = express.Router();

const CreateChargeSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  customerName: z.string().optional(),
  customerDocument: z.string().optional(),
});

// Endpoint para criar cobrança PIX via Mangofy
router.post("/api/pix/charge", async (req, res) => {
  try {
    const body = CreateChargeSchema.parse(req.body);

    // Validar variáveis de ambiente
    if (!process.env.MANGOFY_API_URL || !process.env.MANGOFY_TOKEN) {
      return res.status(500).json({ 
        error: "Configuração do servidor incompleta",
        details: "MANGOFY_API_URL ou MANGOFY_TOKEN não configurados"
      });
    }

    console.log('[MANGOFY] Criando cobrança PIX:', {
      amount: body.amount,
      description: body.description
    });

    const response = await axios.post(
      `${process.env.MANGOFY_API_URL}/checkout/pix`,
      {
        amount: body.amount,
        description: body.description || "Pagamento Bolsa Família",
        customer: {
          name: body.customerName || "Cidadão Brasileiro",
          document: body.customerDocument,
        },
        // Gerar TXID único (máximo 25 caracteres alfanuméricos)
        txid: `BF${Date.now().toString(36).toUpperCase()}`.slice(0, 25),
        // Expiração em 30 minutos
        expiresIn: 1800,
        metadata: {
          source: "bolsa-familia-portal",
          timestamp: new Date().toISOString()
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MANGOFY_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    console.log('[MANGOFY] Resposta recebida:', {
      status: response.status,
      hasData: !!response.data
    });

    // Extrair dados da resposta
    const { brcode, qrCode, txid, expiresAt } = response.data;

    if (!brcode && !qrCode) {
      console.error('[MANGOFY] Resposta sem brcode/qrCode:', response.data);
      return res.status(502).json({ 
        error: "Resposta da Mangofy sem brcode/qrCode",
        details: "API não retornou dados de pagamento válidos"
      });
    }

    console.log('[MANGOFY] Cobrança criada com sucesso:', { txid });

    res.json({ 
      brcode, 
      qrCode, 
      txid, 
      expiresAt,
      success: true
    });

  } catch (err: any) {
    console.error('[MANGOFY] Erro ao criar cobrança:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    });

    const status = err.response?.status || 500;
    const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido";

    return res.status(status).json({
      error: "Falha ao criar cobrança PIX na Mangofy",
      details: errorMessage,
      success: false
    });
  }
});

// Endpoint para verificar status do pagamento
router.get("/api/pix/status/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    if (!process.env.MANGOFY_API_URL || !process.env.MANGOFY_TOKEN) {
      return res.status(500).json({ 
        error: "Configuração do servidor incompleta" 
      });
    }

    const response = await axios.get(
      `${process.env.MANGOFY_API_URL}/checkout/pix/${txid}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MANGOFY_TOKEN}`,
        },
        timeout: 10000,
      }
    );

    res.json(response.data);

  } catch (err: any) {
    console.error('[MANGOFY] Erro ao consultar status:', err.message);
    
    const status = err.response?.status || 500;
    return res.status(status).json({
      error: "Falha ao consultar status do pagamento",
      details: err.response?.data || err.message
    });
  }
});

export default router;