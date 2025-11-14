# KeepLeads - Sistema de Marketplace de Leads

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

KeepLeads é uma plataforma completa de gerenciamento e marketplace de leads para o mercado de planos de saúde no Brasil. O sistema permite capturar, gerenciar e comercializar leads qualificados através de uma interface web moderna e responsiva.

## 📋 Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API](#api)
- [Contribuição](#contribuição)
- [Licença](#licença)

## ✨ Características

### Para Clientes
- 🛒 **Marketplace de Leads**: Navegue e compre leads qualificados
- 💳 **Sistema de Créditos**: Adicione créditos via Mercado Pago (PIX, Cartão de Crédito)
- 📊 **Dashboard**: Visualize estatísticas e métricas em tempo real
- 🔒 **Dados Protegidos**: Informações sensíveis mascaradas até a compra
- 📱 **100% Responsivo**: Interface adaptável para todos os dispositivos
- 🔐 **Autenticação Segura**: Login via Replit Auth (OpenID Connect)

### Para Administradores
- 👥 **Gerenciamento de Leads**: CRUD completo de leads
- 🏢 **Operadoras de Saúde**: Gerenciamento de companies
- 📈 **Painel Admin**: Estatísticas detalhadas e métricas
- 🔄 **Integração KommoCRM**: Importação automática de leads via N8N
- 💰 **Controle Financeiro**: Acompanhamento de transações e vendas

### Funcionalidades Técnicas
- ⚡ **Pagamentos em Tempo Real**: Checkout transparente com Mercado Pago
- 🔔 **Webhooks**: Processamento automático de pagamentos
- 🗄️ **PostgreSQL**: Banco de dados robusto e escalável
- 🔄 **Real-time Updates**: Atualização automática de saldos
- 📋 **LGPD Compliance**: Proteção de dados pessoais
- 🎨 **Design System**: Interface moderna com Tailwind CSS e shadcn/ui

## 🚀 Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Wouter** - Roteamento leve
- **TailwindCSS** - Estilização utility-first
- **shadcn/ui** - Componentes acessíveis
- **Radix UI** - Primitivos headless
- **TanStack Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Type safety
- **Drizzle ORM** - ORM type-safe
- **PostgreSQL** - Banco de dados
- **Passport.js** - Autenticação
- **Mercado Pago SDK** - Gateway de pagamento

### DevOps & Tools
- **Vite** - Build tool e dev server
- **ESBuild** - Bundler rápido
- **Drizzle Kit** - Migrações de banco
- **Neon Database** - PostgreSQL serverless

## 📦 Pré-requisitos

- Node.js >= 18.0.0
- PostgreSQL 14+
- Conta Mercado Pago (para pagamentos)
- Conta Replit (para autenticação)

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/keepleads.git
cd keepleads

# Instale as dependências
npm install
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
PGHOST=your-host
PGPORT=5432
PGUSER=your-user
PGPASSWORD=your-password
PGDATABASE=your-database

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=your-access-token
MERCADO_PAGO_PUBLIC_KEY=your-public-key

# Replit Auth (OpenID Connect)
# Configurado automaticamente no Replit
```

### Configuração do Banco de Dados

```bash
# Execute as migrações
npm run db:push

# Ou force a sincronização do schema
npm run db:push --force
```

## 🎯 Uso

### Desenvolvimento

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# O servidor estará disponível em:
# Frontend: http://localhost:5000
# Backend API: http://localhost:5000/api
```

### Produção

```bash
# Build da aplicação
npm run build

# Inicia o servidor de produção
npm start
```

## 📁 Estrutura do Projeto

```
keepleads/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários e helpers
│   │   └── index.css      # Estilos globais
├── server/                # Backend Node.js
│   ├── db.ts             # Configuração do banco
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Interface de storage
│   ├── auth.ts           # Configuração de autenticação
│   └── index.ts          # Entry point do servidor
├── shared/               # Código compartilhado
│   └── schema.ts         # Schemas Drizzle e Zod
├── drizzle.config.ts     # Configuração Drizzle
├── vite.config.ts        # Configuração Vite
└── package.json          # Dependências
```

## 🔌 API

### Autenticação

```
GET  /api/simple-auth/user          # Obter usuário logado
POST /api/simple-logout             # Fazer logout
```

### Leads

```
GET  /api/leads                     # Listar leads disponíveis
GET  /api/leads/purchased           # Listar leads comprados
POST /api/leads/:id/purchase        # Comprar lead
```

### Créditos

```
GET  /api/transactions              # Histórico de transações
POST /api/payment/create-preference # Criar preferência de pagamento
POST /api/payment/process-card      # Processar pagamento cartão
GET  /api/payment/status/:id        # Status do pagamento
POST /api/payment/webhook           # Webhook Mercado Pago
```

### Admin

```
GET    /api/admin/stats             # Estatísticas gerais
GET    /api/admin/leads             # Listar todos os leads
POST   /api/admin/leads             # Criar lead
PUT    /api/admin/leads/:id         # Atualizar lead
DELETE /api/admin/leads/:id         # Deletar lead
GET    /api/insurance-companies     # Listar operadoras
POST   /api/insurance-companies     # Criar operadora
PUT    /api/insurance-companies/:id # Atualizar operadora
DELETE /api/insurance-companies/:id # Deletar operadora
```

## 🎨 Design e UX

O sistema utiliza um design moderno e limpo com:

- **Paleta de cores**: Roxo primário (#7C3AED) com tons de cinza
- **Tipografia**: System fonts para melhor performance
- **Ícones**: Lucide React para consistência
- **Componentes**: shadcn/ui para acessibilidade
- **Responsividade**: Mobile-first approach
- **Dark mode**: Pronto (pode ser ativado)

## 🔒 Segurança

- ✅ Autenticação via OpenID Connect (Replit)
- ✅ Sessões seguras com PostgreSQL
- ✅ CSRF Protection em rotas sensíveis
- ✅ Validação de dados com Zod
- ✅ Proteção de rotas admin
- ✅ Mascaramento de dados sensíveis
- ✅ HTTPS em produção
- ✅ Secrets management via Replit

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature incrível'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento inicial* - [seu-github](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- [Replit](https://replit.com) - Plataforma de desenvolvimento
- [Mercado Pago](https://www.mercadopago.com.br) - Gateway de pagamento
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Neon](https://neon.tech) - Database serverless

---

**KeepLeads** - Transformando leads em oportunidades 🚀
