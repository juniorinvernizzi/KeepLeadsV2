# ⚠️ VARIÁVEIS FALTANDO NA VERCEL

## Variáveis CRÍTICAS que precisam ser adicionadas:

### 1. SESSION_SECRET (OBRIGATÓRIA) ⚠️
```
Nome: SESSION_SECRET
Valor: keepleads-super-secret-key-min-32-characters-long-2025
Ambientes: Production, Preview, Development
```

**POR QUE É NECESSÁRIA:**
- Sem esta variável, as sessões não funcionam
- O login vai falhar com erro 500
- É usada para criptografar cookies de sessão

### 2. NODE_ENV (RECOMENDADA)
```
Nome: NODE_ENV
Valor: production
Ambientes: Production
```

**POR QUE É NECESSÁRIA:**
- Define configurações corretas de cookies (secure, sameSite)
- Otimizações de produção

## Como adicionar:

1. No painel da Vercel que você mostrou, clique em **"Add New"** (botão no canto superior direito)
2. Adicione cada variável:
   - **Key:** SESSION_SECRET
   - **Value:** keepleads-super-secret-key-min-32-characters-long-2025
   - **Environments:** Marque todos os checkboxes
3. Clique em **Save**
4. Repita para NODE_ENV
5. **IMPORTANTE:** Depois de adicionar, vá até a aba "Deployments" e clique em **"Redeploy"** no último deploy

## Status Atual das Variáveis:

✅ DATABASE_URL (configurada)
✅ PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE (configuradas)
✅ MERCADO_PAGO_ACCESS_TOKEN (configurada)
✅ MERCADO_PAGO_PUBLIC_KEY (configurada)
❌ SESSION_SECRET (FALTANDO - CRÍTICO)
❌ NODE_ENV (FALTANDO - RECOMENDADO)
