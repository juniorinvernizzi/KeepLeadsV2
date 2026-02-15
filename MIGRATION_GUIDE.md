# Guia de Migração de Dados para Neon Database

## Cenário 1: Você tem um banco PostgreSQL antigo rodando

### Passo 1: Configure a URL do banco antigo
```bash
# No terminal, defina a variável de ambiente
$env:OLD_DATABASE_URL="postgresql://usuario:senha@host:5432/database_antigo"
```

### Passo 2: Execute o script de migração
```bash
npx tsx migrate-to-neon.ts
```

---

## Cenário 2: Você tem um dump SQL (.sql file)

### Passo 1: Abra o Neon SQL Editor
1. Acesse https://console.neon.tech
2. Selecione seu projeto
3. Clique em "SQL Editor"

### Passo 2: Importe o dump
- Cole o conteúdo do arquivo .sql
- Clique em "Run"

---

## Cenário 3: Você tem dados em CSV ou JSON

### Para CSV:
```bash
# Importe via psql
psql "postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require" -c "\COPY users FROM 'users.csv' WITH CSV HEADER"
```

### Para JSON:
Crie um script Node.js para processar e inserir os dados.

---

## Cenário 4: Exportar do banco antigo PRIMEIRO

Se você precisa **EXPORTAR** os dados do banco antigo primeiro:

### Opção A: Via pg_dump (PostgreSQL)
```bash
# Exportar todo o banco
pg_dump -h host_antigo -U usuario -d database_antigo -f backup.sql

# Exportar apenas dados (sem schema)
pg_dump -h host_antigo -U usuario -d database_antigo --data-only -f data-only.sql

# Exportar tabela específica
pg_dump -h host_antigo -U usuario -d database_antigo -t leads -f leads.sql
```

Depois importe no Neon via SQL Editor.

### Opção B: Via script Node.js (use migrate-to-neon.ts)
```bash
# Configure a URL do banco antigo
$env:OLD_DATABASE_URL="postgresql://usuario:senha@host:5432/database_antigo"

# Execute
npx tsx migrate-to-neon.ts
```

---

## Cenário 5: Dados no backend-php (MySQL local)

Se você tem dados no MySQL local e quer migrar para Neon PostgreSQL:

### Passo 1: Exporte do MySQL
```bash
# Via mysqldump
mysqldump -u root -p keepleads > keepleads_mysql.sql
```

### Passo 2: Converta MySQL para PostgreSQL
Use ferramentas como:
- **pgloader**: https://pgloader.io/
- **MySQL to PostgreSQL converter**: Online tools

### Passo 3: Importe no Neon
Use o SQL Editor do Neon para executar o SQL convertido.

---

## Verificar dados após migração

```bash
# Via psql
psql "postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Depois execute:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM leads;
SELECT COUNT(*) FROM insurance_companies;
SELECT COUNT(*) FROM lead_purchases;
SELECT COUNT(*) FROM credit_transactions;
```

---

## Qual cenário se aplica a você?

Responda para eu criar o script específico:

1. **Tenho um PostgreSQL rodando** → Use migrate-to-neon.ts
2. **Tenho um arquivo .sql** → Importe via SQL Editor
3. **Tenho CSV/JSON** → Me envie os arquivos
4. **Tenho MySQL local** → Use pgloader ou me diga que converto
5. **Não tenho dados antigos** → Use apenas neon-schema.sql (já criado)

**IMPORTANTE**: Antes de qualquer migração, execute [neon-schema.sql](neon-schema.sql) no Neon SQL Editor para criar as tabelas!
