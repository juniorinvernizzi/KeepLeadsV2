# 🚀 Deploy Rápido - KeepLeads (Vercel + Neon DB)

Guia resumido para colocar o projeto no ar em minutos.

---

## ⚡ Deploy em 5 Passos

### 1️⃣ Configurar Neon DB (5 min)

```bash
# 1. Criar projeto em https://neon.tech
# 2. Copiar a connection string
# 3. Criar tabelas
```

**Via psql:**
```bash
psql "sua-connection-string-aqui" -f neon-schema.sql
```

**Via Dashboard:** Copie e cole o conteúdo de `neon-schema.sql` no SQL Editor do Neon.

---

### 2️⃣ Importar Dados (2 min)

```bash
psql "sua-connection-string-aqui" -f import-data.sql
```

Isso importa:
- ✅ 4 Seguradoras
- ✅ 7 Usuários (incluindo admins)
- ✅ 43 Leads
- ✅ Transações e compras

---

### 3️⃣ Configurar Variáveis de Ambiente (2 min)

Crie arquivo `.env` local:

```env
DATABASE_URL=sua-connection-string-do-neon
NODE_ENV=production
SESSION_SECRET=gere-uma-string-aleatoria-com-32-chars
```

**Gerar SESSION_SECRET:**
```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

### 4️⃣ Deploy na Vercel (3 min)

```bash
# Instalar Vercel CLI (se necessário)
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

**Responda:**
- Set up and deploy? → `Yes`
- Project name? → `keepleads`
- Directory? → `.` (Enter)
- Override settings? → `No`

---

### 5️⃣ Adicionar Variáveis na Vercel (2 min)

**Via CLI:**
```bash
vercel env add DATABASE_URL production
# Cole sua connection string

vercel env add SESSION_SECRET production
# Cole sua secret key

vercel env add NODE_ENV production
# Digite: production
```

**Deploy para produção:**
```bash
vercel --prod
```

---

## 🎉 Pronto!

Seu site estará em: `https://keepleads.vercel.app`

### 👤 Login Padrão

**Admin:**
- Email: `carol.cura@keepthefuture.com.br`
- Senha: (use a senha original hasheada no banco)

**Ou crie um novo usuário no sistema**

---

## 📋 Checklist Final

- [ ] Neon DB criado
- [ ] Tabelas criadas (`neon-schema.sql`)
- [ ] Dados importados (`import-data.sql`)
- [ ] Variáveis configuradas na Vercel
- [ ] Deploy realizado com sucesso
- [ ] Site abrindo normalmente
- [ ] Login funcionando

---

## 🔧 Comandos Úteis

```bash
# Ver logs em tempo real
vercel logs --follow

# Testar localmente
npm run dev

# Build de teste
npm run build

# Importar CSV customizado (se necessário)
npm run import:csv -- --type=leads --file="./caminho/arquivo.csv"
```

---

## 🆘 Problemas?

### Site não abre
- Verifique logs: `vercel logs`
- Confirme variáveis: Vercel Dashboard → Settings → Environment Variables

### Erro de banco
- Teste conexão: `psql "sua-connection-string" -c "SELECT NOW()"`
- Verifique se `?sslmode=require` está na URL

### Login não funciona
- Confirme que `SESSION_SECRET` tem 32+ caracteres
- Verifique se usuários foram importados: `SELECT * FROM users;`

---

## 📚 Documentação Completa

- **[IMPORTACAO_DADOS.md](./IMPORTACAO_DADOS.md)** - Guia detalhado de importação
- **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** - Deploy completo Vercel
- **[import-csv.ts](./import-csv.ts)** - Script de importação CSV

---

**⏱️ Tempo Total: ~15 minutos**

Seu KeepLeads estará funcionando na Vercel com todos os dados! 🚀
