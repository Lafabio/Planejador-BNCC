# 🚀 Próximos Passos - Checklist de Lançamento

## ✅ CONCLUÍDO (Nesta sessão)

### 1. Proteção Legal
- [x] Criado arquivo `LICENSE` com aviso de propriedade
- [x] Atualizado `package.json` como `"private": true` e `"license": "UNLICENSED"`
- [x] README.md atualizado com aviso legal

### 2. Documentação
- [x] Guia completo de proteção e monetização (`GUIA_PROTECAO_MONETIZACAO.md`)
- [x] README profissional com instruções de instalação
- [x] Checklist de próximos passos (este arquivo)

---

## 🔥 AÇÕES IMEDIATAS (Faça HOJE)

### 1. GitHub - Tornar Repositório Privado ⚠️ URGENTE

No GitHub:
1. Acesse https://github.com/seu-usuario/planejador-bncc/settings
2. Role até "Danger Zone"
3. Clique em "Change visibility"
4. Selecione "Make private"
5. Confirme

**Por que?** Se seu repositório é público, qualquer pessoa pode copiar seu código agora mesmo!

### 2. Atualizar Contatos

Edite estes arquivos com seus dados reais:

**README.md** (linhas 11, 130-131):
```
Para licenciamento: seu-email@dominio.com
Email: seu-email@dominio.com
WhatsApp: (XX) XXXXX-XXXX
```

**LICENSE** (linha 22):
```
Contato para licenciamento / Licensing contact: seu-email@dominio.com
```

### 3. Testar Fluxo de Pagamento

```bash
# 1. Instale dependências
npm install

# 2. Crie .env com dados de teste
cp env.example .env
# Edite com seu Access Token SANDBOX do MP

# 3. Inicie servidor
npm start

# 4. Abra index.html no navegador
# Teste compra de pacote de R$ 9,90
```

---

## 📅 ESTA SEMANA

### 1. Migrar para Banco de Dados (CRÍTICO)

Atualmente tokens estão no localStorage (inseguro). Implemente SQLite:

**Passo 1:** Instalar dependência
```bash
npm install better-sqlite3
```

**Passo 2:** Adicionar ao `server.js` (após linha 26):
```javascript
const Database = require('better-sqlite3');
const db = new Database('./tokens.db');

// Inicializar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS tokens (
    professor_id TEXT PRIMARY KEY,
    tokens INTEGER DEFAULT 0,
    gratuitos INTEGER DEFAULT 5,
    planos_gerados INTEGER DEFAULT 0,
    historico TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

**Passo 3:** Criar rotas de API (consulte GUIA_PROTECAO_MONETIZACAO.md)

### 2. Ofuscar Frontend

**Opção A: Online (rápido)**
1. Acesse: https://javascriptobfuscator.com/
2. Cole o conteúdo do index.html (parte JavaScript)
3. Baixe versão ofuscada
4. Substitua no projeto

**Opção B: Local**
```bash
npm install -g javascript-obfuscator
javascript-obfuscator index.html --output index.min.html --compact true
```

### 3. Configurar Domínio

**Registro.br** (domínio .com.br):
1. Acesse: https://registro.br
2. Busque: planejadorbncc.com.br ou similar
3. Compre: R$ 40/ano
4. Configure DNS para Railway/Render

---

## 📅 PRÓXIMA SEMANA

### 1. Deploy em Produção

**Railway.app** (recomendado):
1. Acesse railway.app e crie conta
2. Clique "New Project" → "Deploy from GitHub repo"
3. Selecione seu repositório PRIVADO
4. Em Variables, adicione:
   - MP_ACCESS_TOKEN=seu_token_producao
   - WEBHOOK_SECRET=$(openssl rand -hex 32)
   - FRONTEND_URL=https://seudominio.com
   - PORT=3000

**Configurar Webhook no Mercado Pago:**
1. Painel MP: developers.mercadopago.com.br
2. Seu aplicativo → Webhooks
3. URL: https://seu-app.railway.app/api/mp/webhook
4. Eventos: payment.created, payment.updated

### 2. Testes Finais

Checklist:
- [ ] Cadastro de novo usuário funciona
- [ ] 5 planos gratuitos disponíveis
- [ ] Compra de pacote de R$ 9,90
- [ ] Tokens aparecem após pagamento
- [ ] Geração de plano com IA funciona
- [ ] Exportação Word funciona
- [ ] Webhook está chegando no servidor
- [ ] HTTPS está ativo

---

## 💰 PROJEÇÃO DE RECEITA

| Cenário | Usuários/mês | Ticket Médio | Receita/mês |
|---------|--------------|--------------|-------------|
| Conservador | 20 | R$ 20 | R$ 400 |
| Realista | 100 | R$ 20 | R$ 2.000 |
| Otimista | 500 | R$ 20 | R$ 10.000 |

---

## 📞 CHECKLIST FINAL DE LANÇAMENTO

- [ ] Repositório GitHub privado
- [ ] Banco de dados implementado
- [ ] Frontend ofuscado
- [ ] Domínio comprado
- [ ] Deploy em produção
- [ ] Webhook configurado
- [ ] Testes de compra realizados
- [ ] Contatos atualizados
- [ ] Landing page no ar
- [ ] Primeiros usuários testando

---

**Boa sorte! 🚀**

Se seguir este checklist, você terá um produto profissional e seguro em 2-3 semanas.

*Dúvidas? Consulte o `GUIA_PROTECAO_MONETIZACAO.md` para detalhes técnicos.*
