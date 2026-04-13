# 🛡️ Guia de Proteção e Comercialização - Planejador BNCC

## ✅ O que já está implementado

### 1. Sistema de Tokens Funcional
- **5 planos gratuitos** por usuário
- **Compra de pacotes**: 10 (R$9,90), 30 (R$19,90), 100 (R$49,90)
- **Armazenamento seguro**: tokens salvos no localStorage por professor_id
- **Consumo automático**: usa gratuitos primeiro, depois tokens comprados

### 2. Backend Seguro com Mercado Pago
- **Access Token protegido**: nunca exposto no frontend
- **Webhook com validação HMAC**: previne fraudes
- **Polling seguro**: frontend consulta backend, não o MP diretamente
- **Rate limiting**: previne abuso das APIs
- **CORS configurado**: apenas domínio autorizado

### 3. Proteção Básica do Código
- Lógica de pagamento no servidor (`server.js`)
- Validações rigorosas de entrada
- Referências únicas e não-adivinháveis

---

## 🔒 AÇÕES REALIZADAS PARA PROTEÇÃO

### 1. License Proprietária
- Criado arquivo `LICENSE` com direitos reservados
- `package.json` marcado como `"private": true` e `"license": "UNLICENSED"`

### 2. .gitignore Atualizado
Já protege:
- `node_modules/`
- `.env` (variáveis sensíveis)
- `*.log`

---

## ⚠️ RECOMENDAÇÕES CRÍTICAS

### 1. GitHub - Evitar Cópias

#### a) NÃO publique o código fonte completo
```bash
# Opção A: Repositório PRIVADO
- Vá em Settings → Change visibility → Private
- Apenas você terá acesso

# Opção B: Publicar apenas build minimizado
- Minifique index.html com ferramentas online
- Ofusque JavaScript (ex: javascriptobfuscator.com)
```

#### b) Adicione aviso legal no README.md
```markdown
## ⚠️ AVISO LEGAL

Este software é PROPRIETÁRIO e CONFIDENCIAL.
© 2025 Prof. Lafaiete Erkmann - Todos os direitos reservados.

É PROIBIDA cópia, distribuição ou uso comercial sem autorização.
Violações serão perseguidas legalmente.
```

#### c) Registre na INPI (Brasil)
- Registro de Software: ~R$ 100
- Validade: 50 anos
- URL: https://www.gov.br/inpi

---

### 2. Proteger o Frontend (index.html)

#### a) Ofuscação Recomendada
```bash
# Instale o javascript-obfuscator
npm install -g javascript-obfuscator

# Ofusque o código JavaScript
javascript-obfuscator index.html --output index.min.html \
  --compact true \
  --control-flow-flattening true \
  --dead-code-injection true \
  --string-array true \
  --rotate-string-array true \
  --split-strings true
```

#### b) Remover comentários e espaços
Seu HTML tem 2436 linhas. Após ofuscação: ~800 linhas.

---

### 3. Banco de Dados Real (URGENTE)

Atualmente os tokens estão no **localStorage do navegador**, o que permite:
- ❌ Usuário limpar dados e ganhar novos tokens grátis
- ❌ Fraude manipulando localStorage
- ❌ Perda de dados se trocar de dispositivo

#### Solução: SQLite ou PostgreSQL

**Opção fácil: SQLite (sem configuração)**

```javascript
// server.js - Adicionar banco de dados
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tokens.db');

// Criar tabela
db.run(`CREATE TABLE IF NOT EXISTS tokens (
  professor_id TEXT PRIMARY KEY,
  tokens INTEGER DEFAULT 0,
  gratuitos INTEGER DEFAULT 5,
  planos_gerados INTEGER DEFAULT 0,
  historico TEXT
)`);

// Rota para consultar tokens
app.get('/api/tokens', async (req, res) => {
  const { professor_id } = req.query;
  db.get('SELECT * FROM tokens WHERE professor_id = ?', [professor_id], (err, row) => {
    if (!row) {
      // Novo usuário
      res.json({ tokens: 0, gratuitos: 5, planos_gerados: 0 });
    } else {
      res.json(row);
    }
  });
});

// Rota para consumir token
app.post('/api/tokens/consumir', async (req, res) => {
  const { professor_id } = req.body;
  // Lógica de consumo segura no backend
});
```

**Instalar dependência:**
```bash
npm install sqlite3
```

---

### 4. Hospedagem Segura

#### Opção A: Railway.app (Recomendado)
```bash
# 1. Crie conta em railway.app
# 2. Deploy direto do GitHub (repositório privado)
# 3. Configure variáveis de ambiente:
MP_ACCESS_TOKEN=seu_token_producao
WEBHOOK_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=https://seudominio.com
DATABASE_URL=sqlite://./tokens.db
```

#### Opção B: Render.com
```bash
# Similar ao Railway
# Free tier disponível
```

#### Opção C: VPS Própria
- DigitalOcean Droplet ($6/mês)
- Hostinger VPS (R$ 30/mês)
- Mais controle, mais trabalho

---

### 5. Domínio Profissional

#### Compre um domínio (.com.br)
- Registro.br: R$ 40/ano
- Ex: `planejadorbncc.com.br`

#### Configure HTTPS (obrigatório)
```bash
# Se usar Railway/Render: já vem HTTPS grátis
# Se usar VPS: Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d planejadorbncc.com.br
```

---

## 💰 ESTRATÉGIA DE MONETIZAÇÃO

### 1. Pacotes Sugeridos
| Pacote | Planos | Preço | Preço/Plano |
|--------|--------|-------|-------------|
| Básico | 10 | R$ 9,90 | R$ 0,99 |
| Popular ⭐ | 30 | R$ 19,90 | R$ 0,66 |
| Pro | 100 | R$ 49,90 | R$ 0,49 |
| Escola | 500 | R$ 199,90 | R$ 0,40 |

### 2. Como Implementar Novos Pacotes

No `index.html`, linha ~340-360:

```html
<div class="token-plano" onclick="iniciarCompraMp(500,19990,'500 Planos')">
  <span class="tp-badge">ESCOLA</span>
  <span class="tp-qtd">500</span>
  <span class="tp-label">planos</span>
  <span class="tp-preco">R$ 199,90<br><small>R$ 0,40/plano</small></span>
</div>
```

### 3. Assinatura Recorrente (Opcional)

Para cobrar mensalmente:

```javascript
// server.js - Criar preferência com recurring
const preferencia = await prefApi.create({ body: {
  // ... itens normais
  back_urls: { ... },
  auto_return: 'approved',
  
  // Adicionar recorrência
  recurring_payments: {
    frequency: 1,
    frequency_type: 'months',
    transaction_amount: valor_mensal,
    currency_id: 'BRL'
  }
}});
```

---

## 🔐 CHECKLIST DE SEGURANÇA

- [x] Access Token do MP apenas no backend
- [x] Webhook com validação HMAC
- [x] CORS configurado
- [x] Rate limiting nas APIs
- [ ] **Migrar localStorage para banco de dados**
- [ ] **Ofuscar frontend antes de publicar**
- [ ] **Usar repositório privado no GitHub**
- [ ] **HTTPS obrigatório**
- [ ] **Backup automático do banco**

---

## 📋 PASSO A PASSO PARA LANÇAMENTO

### Semana 1: Preparação
1. Migrar para banco de dados SQLite
2. Testar fluxo completo de compra
3. Ofuscar frontend
4. Configurar domínio

### Semana 2: Infraestrutura
1. Deploy no Railway/Render
2. Configurar variáveis de ambiente
3. Testar webhook em produção
4. Configurar HTTPS

### Semana 3: Lançamento
1. Criar página de vendas
2. Configurar meios de contato
3. Divulgar para primeiros usuários
4. Monitorar transações

---

## 🆘 SUPORTE TÉCNICO

### Problemas Comuns

**1. Webhook não chega**
```bash
# Verifique no painel do MP:
https://www.mercadopago.com.br/developers/panel/app/SEU_APP/notifications

# Teste local com ngrok:
npm install -g ngrok
ngrok http 3000
# Use a URL gerada no FRONTEND_URL
```

**2. Tokens não aparecem após pagamento**
- Verifique logs do servidor
- Confirme que `pagamentosAprovados` está persistindo
- Implemente banco de dados urgente

**3. CORS error no frontend**
- Confirme FRONTEND_URL exato (sem barra final)
- Limpe cache do navegador

---

## 📞 CONTATO PARA LICENCIAMENTO

Adicione no `LICENSE`:
```
Contato para licenciamento: seu-email@dominio.com
WhatsApp: (XX) XXXXX-XXXX
Site: www.seusite.com.br
```

---

## ✨ PRÓXIMOS PASSOS IMEDIATOS

1. **HOJE**: 
   - Tornar repositório privado no GitHub
   - Alterar README com aviso legal

2. **ESTA SEMANA**:
   - Implementar SQLite no server.js
   - Testar compra real com valores baixos (R$ 1)

3. **PRÓXIMA SEMANA**:
   - Contratar domínio .com.br
   - Deploy em produção
   - Ofuscar frontend

---

**Boa sorte com sua monetização! 🚀**

Se precisar de ajuda com implementação específica, me avise.
