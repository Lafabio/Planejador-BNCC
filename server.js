// =============================================================================
// PLANEJADOR BNCC — BACKEND SEGURO (Mercado Pago)
// server.js — Node.js + Express
//
// COMO USAR:
//   1. Preencha as variáveis de ambiente abaixo (ou use um arquivo .env)
//   2. npm install
//   3. node server.js
//
// VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS:
//   MP_ACCESS_TOKEN   → Seu Access Token de produção do Mercado Pago
//   FRONTEND_URL      → URL onde o index.html está hospedado (ex: https://meusite.com)
//   WEBHOOK_SECRET    → Uma string aleatória para validar webhooks do MP (ex: gere com: openssl rand -hex 32)
//   PORT              → Porta do servidor (padrão: 3000)
//
// COMO GERAR O WEBHOOK_SECRET:
//   No terminal: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// =============================================================================

'use strict';

// ── Dependências ──────────────────────────────────────────────────────────────
const express    = require('express');
const cors       = require('cors');
const crypto     = require('crypto');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// ── Configuração (via variáveis de ambiente) ───────────────────────────────────
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const FRONTEND_URL    = (process.env.FRONTEND_URL  || 'http://localhost').replace(/\/+$/, '');
const WEBHOOK_SECRET  = process.env.WEBHOOK_SECRET || '';
const PORT            = parseInt(process.env.PORT) || 3000;

// Validação obrigatória na inicialização
if (!MP_ACCESS_TOKEN) {
  console.error('❌ ERRO: Defina a variável de ambiente MP_ACCESS_TOKEN');
  process.exit(1);
}
if (!WEBHOOK_SECRET) {
  console.warn('⚠️  AVISO: WEBHOOK_SECRET não definido. Webhooks do MP não serão validados.');
}

// ── Mercado Pago SDK ──────────────────────────────────────────────────────────
const mpClient = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN,
  options: { timeout: 10000 }
});

// ── Armazenamento em memória de pagamentos aprovados ─────────────────────────
// Em produção real, substitua por um banco de dados (PostgreSQL, SQLite, etc.)
// Aqui usamos Map para simplicidade — os dados sobrevivem enquanto o servidor roda.
const pagamentosAprovados = new Map(); // ref_externa → { qtd, data, payment_id }
const preferenciasEmitidas = new Set(); // para evitar duplicatas

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();

// CORS: permite apenas o domínio do seu frontend
app.use(cors({
  origin: function(origin, cb) {
    // Permite requests sem origin (ex: curl, mobile) e do domínio configurado
    if (!origin || origin === FRONTEND_URL) return cb(null, true);
    return cb(new Error('CORS bloqueado para origin: ' + origin));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Body parser — exceto para /webhook (precisa do body raw para validar HMAC)
app.use('/api/mp/webhook', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '16kb' }));

// Rate limiting simples (sem dependência extra)
const requestCounts = new Map();
function rateLimit(maxPerMinute) {
  return function(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = requestCounts.get(key) || { count: 0, start: now };
    if (now - entry.start > 60000) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count++;
    requestCounts.set(key, entry);
    if (entry.count > maxPerMinute) {
      return res.status(429).json({ erro: 'Muitas requisições. Aguarde um momento.' });
    }
    next();
  };
}

// ── ROTA: healthcheck / status ─────────────────────────────────────────────────
app.get('/api/status', async (req, res) => {
  try {
    // Verifica se o token MP é válido consultando a API
    const r = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: 'Bearer ' + MP_ACCESS_TOKEN }
    });
    const u = await r.json();
    if (!u.id) throw new Error('Token inválido');
    res.json({
      ok: true,
      mp_user: u.nickname || u.email,
      frontend_url: FRONTEND_URL,
      timestamp: new Date().toISOString()
    });
  } catch(e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

// ── ROTA: criar preferência de pagamento ──────────────────────────────────────
app.post('/api/mp/criar-preferencia', rateLimit(10), async (req, res) => {
  try {
    const {
      titulo,
      valor_centavos,
      ref_externa,
      qtd_tokens,
      professor_id,
      professor_email
    } = req.body;

    // Validações de entrada
    if (!titulo || !valor_centavos || !ref_externa || !qtd_tokens || !professor_id) {
      return res.status(400).json({ erro: 'Dados incompletos na requisição.' });
    }
    if (typeof valor_centavos !== 'number' || valor_centavos < 100) {
      return res.status(400).json({ erro: 'Valor inválido.' });
    }
    if (typeof qtd_tokens !== 'number' || qtd_tokens < 1 || qtd_tokens > 1000) {
      return res.status(400).json({ erro: 'Quantidade de tokens inválida.' });
    }
    // Referência deve ter formato esperado para evitar injection
    if (!/^BNCC_\d+_\d+_[a-z0-9]+$/.test(ref_externa)) {
      return res.status(400).json({ erro: 'Referência inválida.' });
    }
    // Evitar criar preferência duplicada para mesma referência
    if (preferenciasEmitidas.has(ref_externa)) {
      return res.status(409).json({ erro: 'Preferência já criada para esta referência.' });
    }

    const retornoBase = FRONTEND_URL + '/index.html';
    const prefApi = new Preference(mpClient);

    const preferencia = await prefApi.create({ body: {
      items: [{
        title:       titulo,
        unit_price:  valor_centavos / 100,
        quantity:    1,
        currency_id: 'BRL',
        description: 'Planejador BNCC — ' + qtd_tokens + ' planos'
      }],
      payer: professor_email ? { email: professor_email } : undefined,
      external_reference: ref_externa,
      metadata: {
        professor_id: String(professor_id),
        qtd_tokens:   qtd_tokens
      },
      back_urls: {
        success: retornoBase + '?mp_status=approved&mp_ref=' + encodeURIComponent(ref_externa) + '&mp_qtd=' + qtd_tokens,
        failure: retornoBase + '?mp_status=rejected&mp_ref=' + encodeURIComponent(ref_externa),
        pending: retornoBase + '?mp_status=pending&mp_ref='  + encodeURIComponent(ref_externa) + '&mp_qtd=' + qtd_tokens
      },
      auto_return:          'approved',
      statement_descriptor: 'Planejador BNCC',
      notification_url:     FRONTEND_URL.replace('http://localhost', '') // MP não notifica localhost
                              ? (FRONTEND_URL + '/api/mp/webhook')
                              : undefined
    }});

    preferenciasEmitidas.add(ref_externa);

    console.log('[MP] Preferência criada:', ref_externa, '| R$', (valor_centavos/100).toFixed(2), '| prof:', professor_id);

    res.json({
      id:          preferencia.id,
      init_point:  preferencia.init_point  // URL de produção
      // sandbox_init_point: preferencia.sandbox_init_point  // descomentar para testes
    });

  } catch(e) {
    console.error('[MP] Erro ao criar preferência:', e.message);
    res.status(500).json({ erro: 'Erro interno ao criar preferência de pagamento.' });
  }
});

// ── ROTA: verificar pagamento (polling do frontend) ───────────────────────────
app.get('/api/mp/verificar/:ref', rateLimit(60), async (req, res) => {
  const ref = decodeURIComponent(req.params.ref);

  // Validar formato da referência
  if (!/^BNCC_\d+_\d+_[a-z0-9]+$/.test(ref)) {
    return res.status(400).json({ aprovado: false, erro: 'Referência inválida.' });
  }

  // 1. Checar cache local primeiro (evita chamadas desnecessárias à API do MP)
  if (pagamentosAprovados.has(ref)) {
    return res.json({ aprovado: true, fonte: 'cache' });
  }

  // 2. Consultar API do Mercado Pago
  try {
    const r = await fetch(
      'https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&external_reference=' + encodeURIComponent(ref),
      { headers: { Authorization: 'Bearer ' + MP_ACCESS_TOKEN } }
    );
    if (!r.ok) {
      return res.json({ aprovado: false, erro: 'API MP indisponível' });
    }
    const data = await r.json();
    const pago = data.results && data.results.find(p => p.status === 'approved');

    if (pago) {
      // Guardar no cache
      pagamentosAprovados.set(ref, {
        payment_id: pago.id,
        qtd:        pago.metadata?.qtd_tokens,
        data:       pago.date_approved
      });
      console.log('[MP] Pagamento aprovado detectado via polling:', ref, '| payment_id:', pago.id);
      return res.json({ aprovado: true, fonte: 'api' });
    }

    res.json({ aprovado: false });

  } catch(e) {
    console.error('[MP] Erro ao verificar pagamento:', e.message);
    res.json({ aprovado: false, erro: 'Erro de consulta' });
  }
});

// ── ROTA: webhook do Mercado Pago ─────────────────────────────────────────────
// O MP chama este endpoint automaticamente quando um pagamento muda de status.
// Isso garante que boletos e PIX com demora sejam capturados mesmo sem polling.
app.post('/api/mp/webhook', async (req, res) => {
  // Responder 200 imediatamente (o MP espera resposta rápida)
  res.sendStatus(200);

  try {
    const bodyRaw  = req.body; // Buffer (express.raw)
    const bodyStr  = bodyRaw.toString('utf8');
    const bodyJson = JSON.parse(bodyStr);

    // Validar assinatura HMAC-SHA256 se WEBHOOK_SECRET estiver configurado
    if (WEBHOOK_SECRET) {
      const signature   = req.headers['x-signature'] || '';
      const requestId   = req.headers['x-request-id'] || '';
      const queryDataId = req.query['data.id'] || req.query['id'] || '';

      // Formato do MP: ts={timestamp};v1={hash}
      const parts = Object.fromEntries(signature.split(';').map(p => p.split('=')));
      const ts    = parts['ts'] || '';
      const v1    = parts['v1'] || '';

      const manifest = `id:${queryDataId};request-id:${requestId};ts:${ts};`;
      const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(manifest).digest('hex');

      if (v1 && expected !== v1) {
        console.warn('[WEBHOOK] Assinatura inválida — ignorando.');
        return;
      }
    }

    // O MP envia type=payment quando um pagamento é criado/atualizado
    if (bodyJson.type !== 'payment' || !bodyJson.data?.id) return;

    const paymentId = bodyJson.data.id;

    // Buscar detalhes do pagamento
    const payApi = new Payment(mpClient);
    const payment = await payApi.get({ id: paymentId });

    if (payment.status !== 'approved') return;

    const ref = payment.external_reference;
    if (!ref || pagamentosAprovados.has(ref)) return; // já registrado

    pagamentosAprovados.set(ref, {
      payment_id: payment.id,
      qtd:        payment.metadata?.qtd_tokens,
      data:       payment.date_approved
    });

    console.log('[WEBHOOK] Pagamento aprovado:', ref, '| payment_id:', payment.id, '| valor: R$', payment.transaction_amount);

  } catch(e) {
    console.error('[WEBHOOK] Erro ao processar:', e.message);
  }
});

// ── Iniciar servidor ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('✅ Servidor Planejador BNCC rodando na porta', PORT);
  console.log('   Frontend autorizado:', FRONTEND_URL);
  console.log('   Webhook MP:          ' + FRONTEND_URL + '/api/mp/webhook');
  console.log('   Status:              http://localhost:' + PORT + '/api/status');
  console.log('');
});