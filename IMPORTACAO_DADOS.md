# 📥 Importação de Dados - KeepLeads

Guia para importar os dados do Replit para o Neon DB usando o script SQL gerado.

---

## 🎯 Visão Geral

O arquivo **`import-data.sql`** contém todos os dados extraídos do Replit prontos para serem importados no Neon DB. O script inclui:

✅ **4 Seguradoras** (Amil, Bradesco, SulAmérica, Unimed)  
✅ **7 Usuários** (incluindo admins e clientes)  
✅ **1 Sessão ativa**  
✅ **43 Leads** (com informações completas)  
✅ **12 Transações de Crédito**  
✅ **2 Compras de Leads**

---

## 🚀 Como Importar

### Opção 1: Via psql (Recomendado)

```bash
# Certifique-se que psql está instalado
psql --version

# Execute o script
psql "postgresql://seu-usuario:sua-senha@host.neon.tech/neondb?sslmode=require" -f import-data.sql
```

**Substitua** `seu-usuario:sua-senha@host.neon.tech` pela sua connection string do Neon.

### Opção 2: Via Neon Dashboard (SQL Editor)

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Entre no seu projeto **KeepLeads**
3. Clique em **SQL Editor** no menu lateral
4. Abra o arquivo `import-data.sql` no seu editor
5. **Copie TODO o conteúdo** do arquivo
6. **Cole no SQL Editor** do Neon
7. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 3: Via Script Node.js

```bash
# Usar o script TypeScript (se criado)
npm run db:import
```

---

## 📊 Estrutura dos Dados Importados

### 1. Insurance Companies (Seguradoras)
- Amil
- Bradesco Saúde
- SulAmérica
- Unimed

### 2. Users (Usuários)
- **Admin**: carol.cura@keepthefuture.com.br
- **Admin**: juniorinvernizzi@gmail.com
- **Admin**: admin@keepleads.com
- **Clientes**: carol.cura@hotmail.com, cliente@cliente.com.br, etc.

### 3. Leads
- **43 leads** no total
- Estados: SP, RJ, PR, SC, RS, MG, BA, CE, entre outros
- Status: `available`, `sold`
- Qualidade: `diamond`, `gold`, `silver`, `bronze`

### 4. Transações
- Depósitos via Mercado Pago (PIX)
- Compras de leads
- Histórico completo de créditos

---

## ⚙️ Configurações

### Limpar Dados Antes de Importar

Se você quiser **apagar todos os dados existentes** antes de importar, descomente as linhas no início do arquivo `import-data.sql`:

```sql
TRUNCATE TABLE lead_purchases CASCADE;
TRUNCATE TABLE credit_transactions CASCADE;
TRUNCATE TABLE leads CASCADE;
TRUNCATE TABLE sessions CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE insurance_companies CASCADE;
```

⚠️ **ATENÇÃO**: Isso apagará TODOS os dados do banco!

### Evitar Duplicatas

O script já está configurado com `ON CONFLICT DO NOTHING` ou `ON CONFLICT DO UPDATE`, então você pode executá-lo múltiplas vezes sem criar duplicatas.

---

## 🔍 Verificação Pós-Importação

Após executar o script, ele automaticamente mostra um resumo:

```
tabela                 | total
-----------------------|-------
insurance_companies    |     4
users                  |     7
sessions               |     1
leads                  |    43
credit_transactions    |    12
lead_purchases         |     2
```

### Verificar Manualmente

```sql
-- Contar usuários
SELECT COUNT(*) FROM users;

-- Contar leads disponíveis
SELECT COUNT(*) FROM leads WHERE status = 'available';

-- Ver usuários com créditos
SELECT email, credits, role FROM users ORDER BY credits DESC;

-- Ver leads por qualidade
SELECT quality, COUNT(*) as total FROM leads GROUP BY quality;
```

---

## 🐛 Problemas Comuns

### ❌ Erro: "relation does not exist"

**Causa**: Tabelas não foram criadas no banco.

**Solução**: Execute o schema primeiro:
```bash
psql "sua-connection-string" -f neon-schema.sql
```

### ❌ Erro: "duplicate key value"

**Causa**: Dados já existem no banco.

**Solução**: Use a opção `ON CONFLICT DO NOTHING` (já incluída no script) ou limpe os dados antes.

### ❌ Erro: "connection refused"

**Causa**: Connection string incorreta ou banco não acessível.

**Solução**: 
- Verifique se a `DATABASE_URL` está correta
- Certifique-se que inclui `?sslmode=require` no final
- Teste a conexão: `psql "sua-connection-string" -c "SELECT NOW()"`

---

## 📝 Notas Importantes

1. **Ordem de Importação**: O script respeita as foreign keys automaticamente
2. **Senhas**: As senhas dos usuários já estão hasheadas com bcrypt
3. **IDs**: Todos os IDs originais são preservados (UUIDs)
4. **Timestamps**: Todas as datas/horas originais são mantidas
5. **Nulos**: Campos vazios são tratados como `NULL`

---

## 🔄 Atualizar Dados Existentes

Se quiser atualizar apenas alguns registros, você pode executar queries individuais:

```sql
-- Atualizar créditos de um usuário
UPDATE users 
SET credits = '100.00' 
WHERE email = 'cliente@exemplo.com';

-- Mudar status de um lead
UPDATE leads 
SET status = 'sold' 
WHERE id = '123e4567-e89b-12d3-a456-426614174000';
```

---

## ✅ Checklist Final

- [ ] Neon DB criado e configurado
- [ ] Tabelas criadas (executou `neon-schema.sql`)
- [ ] Script `import-data.sql` executado com sucesso
- [ ] Verificação mostra os totais corretos
- [ ] Login funcionando com usuários importados
- [ ] Leads aparecem no dashboard

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do Neon Dashboard
2. Execute a verificação: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
3. Teste conexão: `SELECT NOW();`

---

**🎉 Pronto! Seus dados foram importados com sucesso!**
