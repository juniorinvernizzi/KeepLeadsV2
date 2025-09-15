# Deploy no cPanel - KeepLeads

## Pré-requisitos
- cPanel com suporte a PHP 7.4+ 
- MySQL 5.7+
- Composer (se disponível no cPanel)

## Passo 1: Upload dos arquivos

### Backend PHP
1. Faça upload da pasta `backend-php` para seu cPanel
2. Coloque o conteúdo de `backend-php/public/` na pasta `public_html`
3. Coloque o restante dos arquivos fora da pasta public (por segurança)

### Frontend React (Build)
1. Execute localmente: `cd client && npm run build`  
2. Faça upload do conteúdo de `client/dist/` para `public_html`

## Passo 2: Configurar banco de dados

1. No cPanel, crie um banco MySQL com nome `keepleads`
2. Execute o script `database/schema.sql` no phpMyAdmin
3. Anote as credenciais do banco (host, user, password)

## Passo 3: Configurar variáveis

1. Copie `.env.example` para `.env`
2. Configure as variáveis:
   ```
   DB_HOST=localhost
   DB_NAME=seu_user_keepleads  
   DB_USER=seu_user_mysql
   DB_PASS=sua_senha_mysql
   MERCADO_PAGO_ACCESS_TOKEN=seu_token_mp
   ```

## Passo 4: Instalar dependências

Se o cPanel tiver Composer:
```bash
composer install --no-dev --optimize-autoloader
```

Se não tiver, faça upload da pasta `vendor/` completa.

## Passo 5: Configurar .htaccess

O arquivo `.htaccess` já está configurado para:
- Redirecionar APIs para `index.php`
- Servir arquivos estáticos React
- Headers de segurança
- Compressão

## Passo 6: Testar

1. Acesse `seudominio.com/api/` - deve retornar JSON com status
2. Acesse `seudominio.com` - deve carregar a aplicação React
3. Teste login/registro
4. Configure Mercado Pago em produção

## Estrutura final no cPanel:
```
public_html/
├── index.php (API)
├── .htaccess
├── assets/ (React build)
├── static/ (React build)
└── ...

private/ (fora do public_html)
├── src/
├── config/
├── vendor/
└── .env
```

## Troubleshooting

### Erro 500
- Verifique os logs de erro do cPanel
- Confirme permissões dos arquivos (644 para arquivos, 755 para pastas)
- Verifique se o `.env` está configurado corretamente

### APIs não funcionam
- Confirme se mod_rewrite está ativo
- Verifique o `.htaccess`
- Teste diretamente: `seudominio.com/api/`

### Banco não conecta  
- Confirme credenciais no `.env`
- Verifique se o banco foi criado no cPanel
- Execute o schema SQL no phpMyAdmin