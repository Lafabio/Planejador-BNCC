# Planejador BNCC — Sistema de Planejamento Escolar com IA

## ⚠️ AVISO LEGAL IMPORTANTE

**Este software é PROPRIETÁRIO e CONFIDENCIAL.**

© 2025 Prof. Lafaiete Erkmann — **Todos os direitos reservados.**

É **PROIBIDA** a cópia, distribuição, modificação ou uso comercial deste software sem autorização expressa por escrito do autor. Violações serão perseguidas legalmente conforme Lei nº 9.609/98 (Lei de Software).

Para licenciamento: prog.lafa@gmail.com

---

## 📚 Sobre o Projeto

Sistema completo para planejamento escolar baseado na BNCC (Base Nacional Comum Curricular), com:

- Geração de planos de aula com Inteligência Artificial (Google Gemini)
- Exportação para Microsoft Word (.docx)
- Sistema de tokens para monetização
- Integração com Mercado Pago para pagamentos
- Painel administrativo para gestão de usuários

---

## 🚀 Funcionalidades

### Para Professores
- ✅ 5 planos gratuitos para teste
- ✅ Compra de pacotes de tokens (10, 30, 100 planos)
- ✅ Geração automática de planos com IA
- ✅ Exportação em formato Word editável
- ✅ Salvamento e carregamento de planos
- ✅ Suporte a Educação Infantil e Ensino Fundamental

### Para Administradores
- ✅ Painel de configuração do Mercado Pago
- ✅ Concessão manual de tokens
- ✅ Gestão de professores
- ✅ Reset de uso gratuito

---

## 💻 Instalação

### Pré-requisitos
- Node.js >= 18.0.0
- npm ou yarn
- Conta no Mercado Pago (produção)
- API Key do Google Gemini (gratuita)

### Backend
```bash
npm install

# Configure as variáveis de ambiente
cp env.example .env
# Edite .env com suas credenciais

# Inicie o servidor
npm start
```

### Variáveis de Ambiente Obrigatórias
```env
MP_ACCESS_TOKEN=seu_access_token_mercado_pago
FRONTEND_URL=https://seudominio.com
WEBHOOK_SECRET=gerar_com_openssl_rand_hex_32
PORT=3000
```

---

## 🔐 Segurança

- Access Token do Mercado Pago **nunca** exposto no frontend
- Webhook com validação HMAC-SHA256
- CORS configurado para domínio específico
- Rate limiting nas APIs
- Validação rigorosa de entradas

---

## 📦 Estrutura

```
├── server.js          # Backend Node.js + Express
├── index.html         # Frontend completo (SPA)
├── package.json       # Dependências
├── env.example        # Modelo de variáveis de ambiente
├── LICENSE            # Licença proprietária
└── README.md          # Este arquivo
```

---

## 💰 Monetização

Pacotes disponíveis:
| Pacote | Planos | Preço | Economia |
|--------|--------|-------|----------|
| Básico | 10 | R$ 9,90 | — |
| Popular ⭐ | 30 | R$ 19,90 | 33% |
| Pro | 100 | R$ 49,90 | 50% |

---

## 🌐 Deploy Recomendado

### Opção 1: Railway.app
1. Conecte seu repositório GitHub (privado)
2. Configure variáveis de ambiente
3. Deploy automático

### Opção 2: Render.com
1. Crie novo Web Service
2. Conecte ao GitHub
3. Comando: `npm start`

### Opção 3: VPS Própria
- DigitalOcean, Hostinger, etc.
- Requer configuração de Nginx + HTTPS

---

## 📞 Suporte

Para dúvidas técnicas ou licenciamento:
- Email: prog.lafa@gmail.com
- WhatsApp: [(XX) XXXXX-XXXX]

---

## 📝 Changelog

### v1.0.0
- Lançamento inicial
- Integração Mercado Pago
- Sistema de tokens
- Geração com IA via Gemini
- Exportação Word

---

**Planejador BNCC** — Criado com ❤️ por Prof. Lafaiete Erkmann
