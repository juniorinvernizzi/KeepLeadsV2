# Deploy GRATUITO no Render.com

## ✅ Por que Render?

- 🆓 **100% Gratuito** (plano Free permanente)
- ✅ Suporta Node.js + Express perfeitamente
- ✅ 750 horas/mês grátis (suficiente para 1 app rodando 24/7)
- ✅ Deploy automático via Git
- ✅ SSL gratuito
- ✅ Domínio customizado gratuito

## ⚠️ Limitações do plano gratuito:
- Servidor "hiberna" após 15min de inatividade (primeira requisição demora ~30s)
- 512MB RAM
- Sem garantia de uptime

## 🚀 Passo a Passo - Deploy no Render

### 1. Criar conta no Render
Acesse: https://render.com e faça signup com GitHub

### 2. Preparar o projeto

O projeto já está pronto, mas vamos garantir o script de start:

Verifique se o `package.json` tem:
```json
"scripts": {
  "start": "cross-env NODE_ENV=production node dist/index.js",
  "build": "vite build"
}
```

### 3. Push para GitHub (se ainda não fez)

```bash
# Inicializar git (se necessário)
git init
git add .
git commit -m "Deploy to Render"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/keepleads.git
git branch -M main
git push -u origin main
```

### 4. Criar Web Service no Render

1. No dashboard do Render, clique em **New +** → **Web Service**
2. Conecte sua conta GitHub
3. Selecione o repositório `keepleads`
4. Configure:

**Settings:**
- **Name**: `keepleads` (ou qualquer nome)
- **Region**: `Oregon (US West)` (mais perto)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 5. Adicionar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```
DATABASE_URL=postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

NODE_ENV=production

SESSION_SECRET=gere-um-secret-aleatorio-de-no-minimo-32-caracteres-aqui

PORT=5000
```

**Para gerar SESSION_SECRET, use:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Deploy

1. Clique em **Create Web Service**
2. Render vai automaticamente:
   - Clonar o repositório
   - Instalar dependências
   - Fazer build
   - Iniciar o servidor
3. Aguarde ~5min para o primeiro deploy

### 7. Acessar a aplicação

Render fornecerá uma URL tipo:
- `https://keepleads.onrender.com`

## 🔄 Deploys Automáticos

Cada push para `main` no GitHub dispara deploy automático no Render!

```bash
git add .
git commit -m "Update feature"
git push
```

## 🌐 Domínio Customizado (Opcional)

1. No dashboard do Render, vá em **Settings** → **Custom Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. SSL é configurado automaticamente

## 📊 Monitoramento

- **Logs**: Dashboard → Logs (tempo real)
- **Métricas**: CPU, memória, requisições
- **Status**: Ver se servidor está rodando ou hibernando

## 💡 Dicas para plano gratuito

1. **Evitar hibernação**: Use um serviço de ping (UptimeRobot) para fazer requisição a cada 10min
2. **Otimizar RAM**: O build já está otimizado
3. **Cache**: Configure cache no Neon para reduzir queries

## 🆘 Troubleshooting

**Erro de build:**
- Verifique logs no dashboard
- Certifique-se que todas dependências estão em `dependencies` (não `devDependencies`)

**App não inicia:**
- Verifique variáveis de ambiente
- Veja logs de runtime

**Timeout:**
- Primeira requisição após hibernar pode demorar 30s
- É normal no plano gratuito

## 🎯 Outras opções gratuitas

Se Render não funcionar, alternativas:

### **Fly.io** (3 apps gratuitos)
```bash
npm i -g flyctl
flyctl auth signup
flyctl launch
```

### **Adaptable.io** (100% gratuito)
- Similar ao Render
- Conecta com GitHub

## 📝 Próximos Passos

1. ✅ Push código para GitHub
2. ✅ Criar conta no Render
3. ✅ Configurar Web Service
4. ✅ Adicionar variáveis de ambiente
5. ✅ Aguardar deploy
6. ✅ Testar aplicação!

Quer que eu ajude com algum passo específico?
