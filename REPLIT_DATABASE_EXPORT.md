# Como Exportar Dados do Replit PostgreSQL

## Passo 1: Obter URL do Banco Replit

### Opção A - Via Secrets do Replit:
1. Abra seu Repl no Replit
2. Clique no ícone de **cadeado** (🔒) ou vá em "Secrets" no painel lateral
3. Procure por variáveis como:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

### Opção B - Via Shell do Replit:
1. Abra o Shell no Replit
2. Execute:
```bash
echo $DATABASE_URL
```

A URL será algo como:
```
postgresql://usuario:senha@db.xxxx-xx-x.replit.dev:5432/replit
```

---

## Passo 2: Exportar os Dados

### Método 1: Via Script Automático (RECOMENDADO)

**No seu computador local:**

1. Configure a variável de ambiente:
```powershell
$env:OLD_DATABASE_URL="postgresql://usuario:senha@db.xxxx.replit.dev:5432/replit"
```

2. Execute o script de migração:
```powershell
npx tsx migrate-to-neon.ts
```

---

### Método 2: Via Shell do Replit (Manual)

**No Shell do Replit:**

1. Exportar TODOS os dados:
```bash
pg_dump $DATABASE_URL > backup_completo.sql
```

2. Baixar o arquivo:
   - Encontre `backup_completo.sql` no explorador de arquivos do Replit
   - Clique com botão direito → Download

3. **No Neon SQL Editor:**
   - Abra https://console.neon.tech
   - SQL Editor
   - Cole o conteúdo do arquivo
   - Execute

---

### Método 3: Exportar Apenas Dados (sem schema)

**No Shell do Replit:**

```bash
# Apenas INSERTs, sem CREATE TABLE
pg_dump $DATABASE_URL --data-only > dados.sql
```

Isso é útil porque você já criou o schema com `neon-schema.sql`.

---

### Método 4: Exportar Tabela por Tabela

**No Shell do Replit:**

```bash
# Usuários
pg_dump $DATABASE_URL -t users --data-only > users.sql

# Leads
pg_dump $DATABASE_URL -t leads --data-only > leads.sql

# Empresas
pg_dump $DATABASE_URL -t insurance_companies --data-only > insurance_companies.sql

# Compras
pg_dump $DATABASE_URL -t lead_purchases --data-only > lead_purchases.sql

# Transações
pg_dump $DATABASE_URL -t credit_transactions --data-only > credit_transactions.sql
```

---

## Passo 3: Verificar Conexão com Replit

Teste se consegue conectar do seu PC ao banco do Replit:

```powershell
# Instale psql se ainda não tiver (via Chocolatey)
# choco install postgresql

# Teste a conexão
psql "postgresql://usuario:senha@db.xxxx.replit.dev:5432/replit" -c "SELECT COUNT(*) FROM users;"
```

Se conectar, você pode usar o **migrate-to-neon.ts** diretamente! ✅

---

## Passo 4: Executar Migração

### Se a conexão funcionar:
```powershell
# Configure
$env:OLD_DATABASE_URL="postgresql://USER:PASS@db.xxxx.replit.dev:5432/replit"

# Execute
npx tsx migrate-to-neon.ts
```

### Se a conexão NÃO funcionar (firewall):
1. Exporte via Shell do Replit (Método 2 ou 3)
2. Importe manualmente no Neon SQL Editor

---

## ⚠️ IMPORTANTE - Ordem de Execução:

1. **PRIMEIRO**: Execute `neon-schema.sql` no Neon para criar tabelas
2. **DEPOIS**: Execute a migração de dados

Se você exportar com `--data-only`, já terá apenas os INSERTs prontos para usar no Neon!

---

## 🆘 Precisa de Ajuda?

Me diga:
1. ✅ Conseguiu achar a DATABASE_URL no Replit?
2. ✅ Consegue acessar o Shell do Replit?
3. ✅ Qual método prefere usar?

Vou te guiar passo a passo! 🚀
