# 🔗 Guia de Integração KommoCRM + N8N + KeepLeads

Este guia mostra como configurar a integração completa para importar leads do KommoCRM automaticamente para o KeepLeads usando N8N.

---

## 📋 Requisitos

- ✅ Conta KommoCRM (plano Advanced ou Enterprise para webhooks)
- ✅ N8N instalado e rodando
- ✅ KeepLeads backend PHP funcionando

---

## 🚀 Passo 1: Importar Workflow no N8N

1. Abra seu N8N
2. Clique em **"+"** para criar novo workflow
3. Clique no menu **⋮** (três pontos) no canto superior direito
4. Selecione **"Import from File"**
5. Escolha o arquivo `n8n-kommo-keepleads-workflow.json`
6. O workflow será importado com todos os nós configurados

### Configurar URL do KeepLeads

1. No workflow importado, clique no nó **"Send to KeepLeads"**
2. Altere a URL para o domínio do seu KeepLeads:
   ```
   https://SEU-DOMINIO.replit.app/api/leads/import
   ```
3. **Salve** o workflow

### Ativar o Workflow

1. Clique no botão **"Activate"** no canto superior direito
2. O workflow agora está ativo e pronto para receber webhooks

### Copiar URL do Webhook

1. Clique no nó **"Webhook - Kommo"**
2. Copie a **Production Webhook URL** que aparece
3. Será algo como: `https://seu-n8n.com/webhook/kommo-webhook`
4. **Guarde essa URL** - você vai usar no próximo passo

---

## 🔧 Passo 2: Configurar Webhook no KommoCRM

### Método 1: Via Configurações da Conta (Recomendado)

1. **Acesse as Configurações**
   - Entre no seu KommoCRM
   - Vá em **Settings → Integrations**
   - Clique em **"Web hooks"** (canto superior direito)

2. **Adicionar Novo Webhook**
   - Clique em **"+ Add webhook"**
   - Cole a URL do webhook do N8N (copiada no passo anterior)

3. **Selecionar Eventos**
   - Marque: **"Leads → added"** (novo lead criado)
   - Você também pode marcar:
     - **"Leads → edited"** (se quiser atualizar leads)
     - **"Leads → status changed"** (mudança de status)

4. **Salvar**
   - Clique em **"Save"**
   - O webhook está ativo! ✅

### Método 2: Via Digital Pipeline (Alternativo)

1. **Abrir Pipeline**
   - Vá em **Leads → Automate**
   - Escolha o pipeline que deseja monitorar

2. **Adicionar Ação de Webhook**
   - Clique em um estágio específico (ex: "Novo Lead")
   - Selecione **"API: + Send webhook"**
   - Cole a URL do webhook do N8N
   - Clique em **"Done"**

> **Nota:** Este método envia webhook apenas quando o lead entra naquele estágio específico.

---

## 🧪 Passo 3: Testar a Integração

### Criar Lead de Teste no KommoCRM

1. Vá para **Leads** no KommoCRM
2. Clique em **"+ Add Lead"**
3. Preencha os campos:
   - **Nome:** João da Silva
   - **Email:** joao@exemplo.com
   - **Telefone:** 11999999999
   - **Tags:** Adicione tag com nome da seguradora (ex: "Unimed")

4. **Adicionar Campos Personalizados** (se configurados):
   - Idade: 35
   - Cidade: São Paulo
   - Estado: SP
   - Tipo de Plano: Individual
   - Vidas: 1

5. **Salvar o Lead**

### Verificar no N8N

1. Abra o workflow no N8N
2. Vá para **Executions** (menu lateral)
3. Você verá uma nova execução
4. Clique nela para ver os detalhes
5. Verifique se passou por todos os nós com sucesso ✅

### Verificar no KeepLeads

1. Abra o KeepLeads
2. Vá para a página de **Admin → Leads**
3. O novo lead deve aparecer na lista
4. Verifique se os dados foram importados corretamente

---

## 📊 Mapeamento de Campos

O N8N transforma automaticamente os dados do KommoCRM para o formato do KeepLeads:

| KommoCRM | KeepLeads | Observações |
|----------|-----------|-------------|
| Nome do Lead | `name` | Obrigatório |
| Email (contato) | `email` | Obrigatório |
| Telefone (contato) | `phone` | Obrigatório |
| Campo "Idade" | `age` | Padrão: 30 |
| Campo "Cidade" | `city` | Padrão: São Paulo |
| Campo "Estado" | `state` | Padrão: SP |
| Tag/Campo Seguradora | `insuranceCompanyId` | amil, bradesco, unimed, etc |
| Campo "Tipo de Plano" | `planType` | individual, family, business |
| Campo "Orçamento Min" | `budgetMin` | Valor em R$ |
| Campo "Orçamento Max" | `budgetMax` | Valor em R$ |
| Campo "Vidas" | `availableLives` | Número de vidas |
| Nome do Pipeline | `campaign` | Nome da campanha |
| Notas | `notes` | Observações |

### Como o Sistema Define Valores Automáticos

- **Origem:** Sempre "KommoCRM"
- **Qualidade:** Calculada automaticamente baseado nos campos preenchidos
- **Preço:** Calculado com base na qualidade e número de vidas
- **Status:** Sempre "available" (disponível para compra)

---

## 🎯 Campos Personalizados no KommoCRM

Para melhor qualidade dos leads, configure estes campos personalizados no KommoCRM:

### Criar Campos (Settings → Fields → Custom Fields)

1. **Idade** (tipo: Number)
2. **Cidade** (tipo: Text)
3. **Estado** (tipo: Text - max 2 caracteres)
4. **Seguradora** (tipo: Select)
   - Opções: Amil, Bradesco, SulAmérica, Unimed, Porto Seguro
5. **Tipo de Plano** (tipo: Select)
   - Opções: Individual, Familiar, Empresarial
6. **Orçamento Mínimo** (tipo: Number)
7. **Orçamento Máximo** (tipo: Number)
8. **Vidas** (tipo: Number)

### Alternativa Simples: Usar Tags

Se não quiser criar campos personalizados, você pode usar **Tags** para indicar a seguradora:

- Tag: "Amil" → `insuranceCompanyId: "amil"`
- Tag: "Bradesco" → `insuranceCompanyId: "bradesco"`
- Tag: "Unimed" → `insuranceCompanyId: "unimed"`

---

## 🔍 Solução de Problemas

### Webhook não está disparando

**Causas possíveis:**
- Webhook não foi ativado no KommoCRM
- URL do webhook está incorreta
- Workflow do N8N não está ativado

**Solução:**
1. Verifique se o webhook está salvo no KommoCRM (Settings → Integrations → Webhooks)
2. Confirme que a URL está correta
3. Ative o workflow no N8N

### Lead não aparece no KeepLeads

**Causas possíveis:**
- Campos obrigatórios faltando (nome, email, telefone)
- Erro na transformação de dados
- Endpoint do KeepLeads fora do ar

**Solução:**
1. Verifique os logs do N8N (menu Executions)
2. Veja se há erro no nó "Send to KeepLeads"
3. Teste o endpoint diretamente:
   ```bash
   curl -X POST https://SEU-DOMINIO.replit.app/api/leads/import \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Teste",
       "email": "teste@exemplo.com",
       "phone": "11999999999"
     }'
   ```

### Webhook é desabilitado automaticamente

**Causa:**
- O KommoCRM desabilita webhooks que retornam erro 100+ vezes em 2 horas

**Solução:**
1. Corrija o erro no N8N
2. Volte em Settings → Integrations → Webhooks
3. Clique em **"Save"** para reativar

### Dados estão chegando incompletos

**Causa:**
- Campos personalizados não configurados no KommoCRM

**Solução:**
- Configure os campos personalizados (veja seção acima)
- Ou ajuste o código do N8N para usar valores padrão

---

## 🎉 Pronto!

Sua integração está completa! Agora todos os leads criados no KommoCRM serão automaticamente importados para o KeepLeads através do N8N.

### Próximos Passos

- ✅ Monitore as execuções no N8N
- ✅ Verifique a qualidade dos leads importados
- ✅ Ajuste os campos personalizados conforme necessário
- ✅ Configure alertas no N8N para falhas (opcional)

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do N8N (menu Executions)
2. Veja os logs do backend PHP (`backend-php/logs/`)
3. Teste o endpoint manualmente com cURL

**Lembre-se:** O webhook do KommoCRM espera resposta em **menos de 2 segundos**, então o N8N e KeepLeads devem estar rápidos!
