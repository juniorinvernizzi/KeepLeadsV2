# KeepLeads - Guia de Instalação para cPanel

## 📋 Pré-requisitos

- **Hospedagem cPanel** com suporte ao PHP 7.4 ou superior
- **MySQL Database** (disponível na maioria dos planos cPanel)
- **Acesso FTP ou Gerenciador de Arquivos** do cPanel
- **Token do Mercado Pago** (para processamento de pagamentos)

## 🚀 Instalação Passo a Passo

### 1. Preparar o Banco de Dados

1. **Acesse o cPanel** da sua hospedagem
2. **Vá em "Bancos de Dados MySQL"**
3. **Crie um novo banco de dados:**
   - Nome: `keepleads` (ou outro de sua escolha)
4. **Crie um usuário para o banco:**
   - Usuário: `keepleads_user`
   - Senha: gere uma senha forte
5. **Associe o usuário ao banco** com todas as permissões

### 2. Upload dos Arquivos

1. **Faça o upload da pasta `cpanel-deploy/public_html`** para o diretório raiz do seu domínio
2. **Estrutura final no servidor:**
   ```
   public_html/
   ├── index.html              (frontend React)
   ├── assets/                 (CSS, JS, imagens)
   ├── api/                    (backend PHP)
   │   ├── public/
   │   │   └── index.php
   │   ├── src/
   │   ├── config/
   │   └── vendor/
   └── .htaccess
   ```

### 3. Instalar Dependências PHP

1. **Acesse o terminal/SSH** (se disponível) ou use o **Terminal no cPanel**
2. **Navegue até a pasta api:**
   ```bash
   cd public_html/api
   ```
3. **Instale as dependências com Composer:**
   ```bash
   composer install
   ```
   
   > **Nota:** Se não tiver Composer instalado, baixe em: https://getcomposer.org/

### 4. Configurar Variáveis de Ambiente

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```
2. **Edite o arquivo `.env`** com suas configurações:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_NAME=seu_nome_banco
   DB_USER=seu_usuario_banco
   DB_PASS=sua_senha_banco

   # Mercado Pago Configuration
   MERCADO_PAGO_ACCESS_TOKEN=seu_token_mercado_pago

   # Application Configuration
   APP_URL=https://seudominio.com
   APP_ENV=production

   # Session Configuration
   SESSION_SECRET=sua_chave_secreta_session
   ```

### 5. Configurar Permissões

1. **Configure as permissões dos diretórios:**
   - `api/`: 755
   - `api/public/`: 755
   - `api/config/`: 755
   - `api/vendor/`: 755

### 6. Testar a Instalação

1. **Acesse:** `https://seudominio.com/api`
2. **Você deve ver:** 
   ```json
   {
     "message": "KeepLeads API PHP",
     "status": "running", 
     "version": "1.0.0",
     "environment": "cpanel"
   }
   ```

3. **Acesse:** `https://seudominio.com`
4. **Deve carregar a aplicação KeepLeads**

## 🔧 Configurações Adicionais

### SSL/HTTPS (Recomendado)

1. **Ative o SSL** no cPanel (Let's Encrypt gratuito)
2. **Force HTTPS** editando o `.htaccess` na raiz:
   ```apache
   # Force HTTPS
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

### Configurar Mercado Pago

1. **Obtenha suas credenciais** no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. **Adicione o token** no arquivo `.env`
3. **Configure webhook** (opcional):
   - URL: `https://seudominio.com/api/payment/webhook`

## 🛠️ Solução de Problemas

### Erro 500 - Internal Server Error

1. **Verifique o log de erros** no cPanel
2. **Confirme permissões** dos arquivos
3. **Verifique se o Composer** instalou todas as dependências
4. **Confirme configuração** do banco de dados

### Frontend não carrega

1. **Verifique se o `.htaccess`** está na raiz
2. **Confirme que o arquivo `index.html`** existe
3. **Teste diretamente:** `https://seudominio.com/index.html`

### API não responde

1. **Teste diretamente:** `https://seudominio.com/api/public/index.php`
2. **Verifique configurações** do banco de dados
3. **Confirme que o PHP** é versão 7.4 ou superior

### Banco de dados não conecta

1. **Verifique credenciais** no `.env`
2. **Confirme que o usuário** tem permissões no banco
3. **Teste conexão** usando phpMyAdmin no cPanel

## 📊 Recursos da Aplicação

- ✅ **Autenticação** de usuários (admin/cliente)
- ✅ **Marketplace** de leads de saúde
- ✅ **Sistema de créditos** 
- ✅ **Pagamentos** via Mercado Pago
- ✅ **Painel administrativo**
- ✅ **Gestão de leads** e usuários
- ✅ **Relatórios** e estatísticas

## 🔐 Credenciais Padrão

**Administrador:**
- Email: `admin@admin.com.br`
- Senha: `admin123`

> **IMPORTANTE:** Altere essas credenciais após a primeira instalação!

## 📞 Suporte

Em caso de dúvidas:
1. Verifique os logs de erro do servidor
2. Confirme todas as configurações acima
3. Teste cada componente individualmente

---

**Parabéns! 🎉 Sua aplicação KeepLeads está agora funcionando no cPanel.**