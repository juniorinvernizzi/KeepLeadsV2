# Deploy para Vercel - Guia Completo

## 📋 Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Vercel CLI instalado: `npm i -g vercel` ✅ (já instalado)
3. Banco de dados Neon configurado ✅ (já configurado)

## 🚀 Passos para Deploy

### 1. Fazer login na Vercel
```bash
vercel login
```

### 2. Fazer deploy inicial
Na pasta do projeto, execute:
```bash
vercel
```

Responda as perguntas:
- **Set up and deploy?** → Yes
- **Which scope?** → Sua conta pessoal ou team
- **Link to existing project?** → No
- **Project name?** → keepleads (ou outro nome)
- **Directory?** → ./ (apenas Enter)
- **Override settings?** → No

### 3. Configurar variáveis de ambiente na Vercel

Acesse o dashboard da Vercel e adicione as variáveis de ambiente:

**Obrigatórias:**
```
DATABASE_URL=postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
SESSION_SECRET=seu-secret-aqui-min-32-chars
```

**Opcionais:**
```
MERCADO_PAGO_ACCESS_TOKEN=seu-token-aqui
MERCADO_PAGO_PUBLIC_KEY=sua-key-aqui
SENDGRID_API_KEY=seu-api-key-aqui
```

### 4. Deploy para produção
```bash
vercel --prod
```

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
vercel logs

# Fazer redeploy
vercel --prod

# Ver status do projeto
vercel list

# Remover projeto
vercel remove
```

## ⚙️ Arquivos Criados

✅ `vercel.json` - Configuração da Vercel
✅ `api/index.ts` - Handler serverless para as rotas
✅ `.vercelignore` - Arquivos ignorados no deploy
✅ `api/tsconfig.json` - Config TypeScript para API

## 🌐 Após o Deploy

1. Acesse a URL fornecida pela Vercel
2. Teste o login em `/login`
3. Configure domínio customizado (opcional) no dashboard

## ⚠️ Notas Importantes

- **Sessions**: Como a Vercel usa serverless, as sessions em memória não funcionam. O projeto já está configurado para usar PostgreSQL session store (tabela `sessions`).
- **Cold Start**: Primeira requisição pode demorar ~2s (serverless).
- **Logs**: Veja logs no dashboard da Vercel ou via CLI.
- **Timeout**: Máximo 10s por requisição (configurado em vercel.json).

## 🐛 Troubleshooting

**Erro de módulo:**
- Certifique-se que todas dependências estão em `dependencies` (não `devDependencies`)

**Erro de database:**
- Verifique se `DATABASE_URL` está configurado corretamente
- Teste conexão local primeiro

**Erro 404:**
- Verifique se as rotas em `vercel.json` estão corretas
- Limpe cache: `vercel --force`

## 📱 Domínio Customizado

1. Vá em Project Settings → Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde propagação (~10min)
