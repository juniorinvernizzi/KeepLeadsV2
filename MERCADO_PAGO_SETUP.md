# Configuração do Mercado Pago - KeepLeads

Este guia explica como obter e configurar as credenciais do Mercado Pago para aceitar pagamentos na plataforma KeepLeads.

## 📋 Pré-requisitos

1. Uma conta no Mercado Pago (criar em: https://www.mercadopago.com.br/)
2. Acesso administrativo ao painel do KeepLeads

## 🔑 Passo 1: Obter as Credenciais do Mercado Pago

### 1.1. Acessar o Painel de Desenvolvedores

1. Faça login na sua conta do Mercado Pago
2. Acesse: https://www.mercadopago.com.br/developers/panel
3. No menu lateral, clique em **"Suas integrações"**
4. Clique em **"Criar aplicação"** (se ainda não tiver uma)

### 1.2. Criar uma Aplicação

1. Escolha o nome da aplicação: **"KeepLeads Produção"** (para produção) ou **"KeepLeads Teste"** (para testes)
2. Selecione o modelo de integração: **"Pagamentos online"**
3. Clique em **"Criar aplicação"**

### 1.3. Obter as Credenciais de TESTE

As credenciais de teste são usadas para fazer testes sem movimentar dinheiro real.

1. Na aplicação criada, vá em **"Credenciais"**
2. Selecione **"Credenciais de teste"**
3. Copie as seguintes informações:
   - **Access Token de teste**: Começa com `TEST-`
   - **Public Key de teste**: Começa com `TEST-`

### 1.4. Obter as Credenciais de PRODUÇÃO

As credenciais de produção são usadas para processar pagamentos reais.

1. Na mesma página de credenciais, selecione **"Credenciais de produção"**
2. Copie as seguintes informações:
   - **Access Token de produção**: Começa com `APP_USR-`
   - **Public Key de produção**: Começa com `APP_USR-`

⚠️ **IMPORTANTE**: Nunca compartilhe suas credenciais de produção publicamente!

## ⚙️ Passo 2: Configurar no KeepLeads

### 2.1. Acessar o Painel Administrativo

1. Faça login no KeepLeads com uma conta **admin**
2. Vá em **"Integrações"** no menu principal
3. Localize a seção **"Mercado Pago"**

### 2.2. Configurar Ambiente de TESTE

1. Na seção **"Ambiente de Teste"**:
   - Cole o **Access Token de teste** no campo "Access Token"
   - Cole a **Public Key de teste** no campo "Public Key"
2. Clique em **"Salvar Credenciais"**
3. Clique em **"Ativar Teste"** para usar o ambiente de teste

### 2.3. Configurar Ambiente de PRODUÇÃO

1. Na seção **"Ambiente de Produção"**:
   - Cole o **Access Token de produção** no campo "Access Token"
   - Cole a **Public Key de produção** no campo "Public Key"
2. Clique em **"Salvar Credenciais"**
3. **QUANDO ESTIVER PRONTO PARA RECEBER PAGAMENTOS REAIS**, clique em **"Ativar Produção"**

## 🧪 Passo 3: Testar o Pagamento

### 3.1. Testar com Ambiente de TESTE

1. Certifique-se de que o **Ambiente de Teste** está ativo (botão verde)
2. Acesse a página **"Créditos"** como usuário cliente
3. Tente adicionar créditos (ex: R$ 50,00)
4. Você será redirecionado para o checkout do Mercado Pago
5. Use os **cartões de teste** fornecidos pelo Mercado Pago:

#### Cartões de Teste (para ambiente de teste)

| Cartão | Número | CVC | Data Validade | Resultado |
|--------|--------|-----|---------------|-----------|
| Mastercard | 5031 4332 1540 6351 | 123 | 11/25 | ✅ Aprovado |
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | ✅ Aprovado |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | ❌ Recusado (fundos insuficientes) |

Mais cartões de teste em: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards

### 3.2. Verificar se o Pagamento Foi Processado

1. Após concluir o pagamento no Mercado Pago, você será redirecionado de volta ao KeepLeads
2. Verifique se os créditos foram adicionados à conta
3. Verifique o histórico de transações

## 🚀 Passo 4: Ativar Produção

⚠️ **ATENÇÃO**: Só ative o ambiente de produção quando:
- Você testou completamente o fluxo de pagamento
- Suas credenciais de produção estão corretas
- Você está pronto para receber pagamentos reais

1. No painel de **Integrações**, seção **Mercado Pago**
2. Certifique-se de que as credenciais de **produção** estão salvas
3. Clique em **"Ativar Produção"**
4. Agora os pagamentos serão processados com dinheiro real! 💰

## 📊 Monitoramento

### Verificar Pagamentos no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/
2. Vá em **"Atividades"** → **"Vendas e cobranças"**
3. Você verá todos os pagamentos recebidos

### Verificar Webhooks

O sistema está configurado para receber notificações automáticas do Mercado Pago quando um pagamento é aprovado. Isso permite adicionar os créditos automaticamente sem intervenção manual.

URL do Webhook (configurada automaticamente):
```
https://seu-dominio.com/api/payment/webhook
```

## 🔧 Solução de Problemas

### Erro: "Mercado Pago não está configurado"

**Causa**: As credenciais não foram configuradas ou não estão ativas.

**Solução**:
1. Verifique se você salvou as credenciais no painel de Integrações
2. Certifique-se de que clicou em "Ativar Teste" ou "Ativar Produção"
3. Recarregue a página e tente novamente

### Pagamento não adiciona créditos automaticamente

**Possíveis causas**:
1. O webhook não está sendo recebido pelo servidor
2. As credenciais estão incorretas
3. O pagamento ainda está pendente

**Solução**:
1. Verifique os logs do servidor para erros de webhook
2. Confirme que o pagamento foi aprovado no painel do Mercado Pago
3. Entre em contato com o suporte técnico

### Erro ao criar preferência de pagamento

**Causa**: Access Token inválido ou expirado.

**Solução**:
1. Gere novas credenciais no painel do Mercado Pago
2. Atualize as credenciais no KeepLeads
3. Tente novamente

## 📞 Suporte

- Documentação oficial do Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs
- Suporte Mercado Pago: https://www.mercadopago.com.br/ajuda

## ✅ Checklist de Configuração

- [ ] Conta criada no Mercado Pago
- [ ] Aplicação criada no painel de desenvolvedores
- [ ] Credenciais de TESTE copiadas
- [ ] Credenciais de PRODUÇÃO copiadas
- [ ] Credenciais de TESTE configuradas no KeepLeads
- [ ] Ambiente de TESTE ativado
- [ ] Pagamento de teste realizado com sucesso
- [ ] Créditos adicionados automaticamente após pagamento de teste
- [ ] Credenciais de PRODUÇÃO configuradas no KeepLeads
- [ ] Ambiente de PRODUÇÃO ativado (quando pronto para aceitar pagamentos reais)

---

**Última atualização**: 24 de outubro de 2025
