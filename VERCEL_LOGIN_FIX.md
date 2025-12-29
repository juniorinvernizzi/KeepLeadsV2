# 🔧 Correção de Login na Vercel

## ✅ Correções Aplicadas no Código

1. **Cookie SameSite**: Alterado de `'none'` para `'lax'` em produção
2. **Trust Proxy**: Adicionado `app.set('trust proxy', 1)` no handler da Vercel
3. **CSRF Protection**: Adicionado suporte para domínios `vercel.app`
4. **Cookie Path**: Definido explicitamente como `'/'`

## 🔑 Variáveis de Ambiente Obrigatórias na Vercel

Acesse: https://vercel.com/seu-projeto/settings/environment-variables

**Configure as seguintes variáveis:**

```bash
# Banco de Dados (OBRIGATÓRIO)
DATABASE_URL=postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# Ambiente (OBRIGATÓRIO)
NODE_ENV=production

# Session Secret (OBRIGATÓRIO) - Gere um novo com pelo menos 32 caracteres
SESSION_SECRET=seu-secret-super-seguro-com-minimo-32-caracteres-aqui

# Opcionais
MERCADO_PAGO_ACCESS_TOKEN=seu-token
MERCADO_PAGO_PUBLIC_KEY=sua-key
SENDGRID_API_KEY=sua-api-key
```

### 🔐 Gerando um SESSION_SECRET Seguro

Execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e use como valor de `SESSION_SECRET`

## 📋 Checklist de Deploy

- [ ] 1. Commitar as alterações:
```bash
git add .
git commit -m "Fix login for Vercel production"
git push
```

- [ ] 2. Configurar variáveis de ambiente na Vercel:
  - [ ] DATABASE_URL
  - [ ] NODE_ENV=production
  - [ ] SESSION_SECRET (gerado com crypto)

- [ ] 3. Fazer redeploy:
```bash
vercel --prod
```

- [ ] 4. Verificar logs:
```bash
vercel logs --follow
```

- [ ] 5. Testar login no domínio da Vercel

## 🐛 Troubleshooting

### Login ainda não funciona?

1. **Verificar variáveis de ambiente:**
```bash
vercel env ls
```

2. **Verificar se SESSION_SECRET está definido:**
   - Deve ter pelo menos 32 caracteres
   - Não deve ser o valor padrão 'dev-secret-change-in-production'

3. **Verificar se banco está acessível:**
   - Teste a connection string localmente
   - Verifique se o IP da Vercel não está bloqueado no Neon

4. **Limpar cookies do navegador:**
   - Cookies antigos podem causar problemas
   - Ctrl+Shift+Del → Limpar cookies

5. **Verificar logs em tempo real:**
```bash
vercel logs --follow
```

### Erro "Failed to save session"

- Verifique se a tabela `sessions` existe no banco
- Execute o schema SQL se necessário:
```sql
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);
```

### Erro 500 na Vercel

- Verifique se todas as dependências estão em `dependencies` (não `devDependencies`)
- Verifique se o build foi concluído com sucesso
- Verifique os logs: `vercel logs`

## ✨ Após as Correções

O login deve funcionar normalmente tanto em:
- ✅ Desenvolvimento (localhost)
- ✅ Produção (Vercel)

A sessão será armazenada no PostgreSQL (Neon), garantindo persistência entre requisições serverless.
