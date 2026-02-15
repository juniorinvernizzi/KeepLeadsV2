-- =====================================
-- Script de Importação de Dados
-- KeepLeads - Dados do Replit
-- =====================================

-- Limpar dados existentes (CUIDADO: isso apaga tudo!)
-- Descomente as linhas abaixo se quiser limpar antes de importar
-- TRUNCATE TABLE lead_purchases CASCADE;
-- TRUNCATE TABLE credit_transactions CASCADE;
-- TRUNCATE TABLE leads CASCADE;
-- TRUNCATE TABLE sessions CASCADE;
-- TRUNCATE TABLE users CASCADE;
-- TRUNCATE TABLE insurance_companies CASCADE;

-- =====================================
-- 1. INSURANCE COMPANIES (Seguradoras)
-- =====================================

INSERT INTO insurance_companies (id, name, color, created_at, logo) VALUES
('amil-123', 'Amil', '#E74C3C', '2025-09-05T14:43:44.210Z', NULL),
('bradesco-456', 'Bradesco Saúde', '#003A8C', '2025-09-05T14:43:44.210Z', NULL),
('sulamerica-789', 'SulAmérica', '#0B7EC8', '2025-09-05T14:43:44.210Z', NULL),
('unimed-012', 'Unimed', '#228B22', '2025-09-05T14:43:44.210Z', NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- 2. USERS (Usuários)
-- =====================================

-- Deletar usuários com emails duplicados que tenham IDs diferentes (manter apenas os do import)
DELETE FROM users 
WHERE email IN (
  'carol.cura@hotmail.com',
  'carol.cura@keepthefuture.com.br',
  'cliente@cliente.com.br',
  'admin@keepleads.com',
  'teste@teste.com',
  'test@example.com',
  'juniorinvernizzi@gmail.com'
) AND id NOT IN (
  '2a9dfa1d-72c0-4625-807e-eebf42f54c39',
  '352ab832-60b1-4b5f-bfb4-92960483084e',
  '3febf047-4ce8-48f9-b070-8f0cd272d080',
  '400c576d-b034-4016-9ce2-1a9bb4dd1601',
  '405d44ca-14a8-4191-bd58-66e60f1ed3ed',
  '7654ce1d-3ebf-4a31-ac27-ae0988d29321',
  '83d4f4a4-f8e6-4f83-a4c6-e432844c6821'
);

INSERT INTO users (id, email, password, first_name, last_name, profile_image_url, role, credits, created_at, updated_at, status) VALUES
('2a9dfa1d-72c0-4625-807e-eebf42f54c39', 'carol.cura@hotmail.com', '$2b$12$bU4S76NfihP3nSfAVHpSEewFVcRZyuCb8LOxuyqLpLZl.FFWi7Uz2', 'Caroline', 'Cura', NULL, 'client', '10.10', '2025-12-10T13:00:09.762Z', '2025-12-10T16:42:05.610Z', 'active'),
('352ab832-60b1-4b5f-bfb4-92960483084e', 'carol.cura@keepthefuture.com.br', '$2b$12$IShV8gXHsKF5cobVi5Vc5uxEjWkEBUVIzksZfMjAZJHYCsj4bJyyq', 'Administrador', 'Keepthefuture', NULL, 'admin', '60.10', '2025-12-10T13:33:19.183Z', '2025-12-20T20:38:49.723Z', 'active'),
('3febf047-4ce8-48f9-b070-8f0cd272d080', 'cliente@cliente.com.br', '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9', 'Cliente', 'Teste', NULL, 'client', '486.60', '2025-09-05T14:43:10.507Z', '2025-12-12T11:45:20.444Z', 'active'),
('400c576d-b034-4016-9ce2-1a9bb4dd1601', 'admin@keepleads.com', '$2b$10$n8mNTlHI.Zd5T6KtUZaQ0eOlh9Nszl5RBtPXAt3hfHiOLJEGATGNu', 'Admin', 'KeepLeads', NULL, 'admin', '0.00', '2025-11-17T15:25:45.945Z', '2025-11-21T17:10:10.752Z', 'active'),
('405d44ca-14a8-4191-bd58-66e60f1ed3ed', 'teste@teste.com', '$2b$12$ZZBozj8DmQDDzgz1Pu8vt.qQqXJDefmt8GbgqiAUeEkUW4d3YD8wa', 'Usuario', 'Teste', NULL, 'client', '0.00', '2025-10-27T15:39:01.282Z', '2025-11-21T14:42:33.150Z', 'active'),
('7654ce1d-3ebf-4a31-ac27-ae0988d29321', 'test@example.com', '$2b$10$oBnMHz4H/F4VPuRE8Df/r.YjSDFPrRAi6wGnIR792RaHqYh8gajXS', 'Test', 'User', NULL, 'client', '0.00', '2025-09-11T17:49:27.845Z', '2025-12-01T03:55:24.348Z', 'suspended'),
('83d4f4a4-f8e6-4f83-a4c6-e432844c6821', 'juniorinvernizzi@gmail.com', '$2b$12$o5KziZEG2tFz/9cmfmx.NeOU2.0HAv5JoyxdZMG7IqJbyt0qy8vJm', 'Junior', 'Invernizzi', NULL, 'admin', '755.90', '2025-09-05T14:56:51.140Z', '2025-12-10T16:41:06.640Z', 'active')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  credits = EXCLUDED.credits,
  updated_at = EXCLUDED.updated_at,
  status = EXCLUDED.status,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- =====================================
-- 3. SESSIONS (Sessões)
-- =====================================

INSERT INTO sessions (sid, sess, expire) VALUES
('IBg5Wv2LYzdnz_RkznPcjmDyhc-luTYq', '{"user":{"id":"352ab832-60b1-4b5f-bfb4-92960483084e","role":"admin","email":"carol.cura@keepthefuture.com.br","status":"active","credits":"60.10","lastName":"Keepthefuture","password":"$2b$12$IShV8gXHsKF5cobVi5Vc5uxEjWkEBUVIzksZfMjAZJHYCsj4bJyyq","createdAt":"2025-12-10T13:33:19.183Z","firstName":"Administrador","updatedAt":"2025-12-20T20:38:49.723Z","profileImageUrl":null},"cookie":{"path":"/","secure":true,"expires":"2026-01-05T19:23:53.019Z","httpOnly":true,"sameSite":"lax","originalMaxAge":604800000},"userId":"352ab832-60b1-4b5f-bfb4-92960483084e"}', '2026-01-05T19:24:16.000Z')
ON CONFLICT (sid) DO UPDATE SET
  sess = EXCLUDED.sess,
  expire = EXCLUDED.expire;

-- =====================================
-- 4. LEADS
-- =====================================

INSERT INTO leads (id, name, email, phone, age, city, income, insurance_company_id, price, status, created_at, updated_at, state, category, plan_type, budget_min, budget_max, available_lives, source, campaign, quality, notes) VALUES
('1239af25-11ef-44ad-8e10-089302d5baba', 'Juliana Oliveira', 'juliana.oliveira@email.com', '(47) 94444-5555', 39, 'Florianópolis', '8500-12000', 'bradesco-456', '67.30', 'available', '2025-09-05T17:45:21.129Z', '2025-09-05T17:45:21.129Z', 'SC', 'health_insurance', 'individual', '53.84', '100.95', 1, 'Google Ads', 'Seguro Saúde 2025', 'gold', NULL),
('12ce209f-c183-43ae-8e3b-a51bcff08e46', 'Larissa Pinto', 'larissa.pinto@email.com', '(81) 21098-7654', 25, 'Recife', '3500-5000', 'unimed-012', '39.10', 'available', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'PE', 'health_insurance', 'individual', '31.28', '58.65', 1, 'Google Ads', 'Seguro Saúde 2025', 'bronze', NULL),
('187d7071-4697-41d1-8b38-5d31c38e6707', 'Ana Costa', 'ana.costa@email.com', '(41) 66666-4444', 50, 'Curitiba', '12000+', 'unimed-012', '75.20', 'sold', '2025-09-05T17:43:49.782Z', '2025-10-03T20:14:53.696Z', 'PR', 'health_insurance', 'individual', '60.16', '112.80', 1, 'Google Ads', 'Seguro Saúde 2025', 'gold', NULL),
('209cdd58-7248-4546-a38a-5772eb2a196c', 'Carlos Rogério Almeida Silva', 'cras-sp@uol.com.br', '(11) 99375-9240', NULL, 'SÃO PAULO', '3000.00', NULL, '39.90', 'sold', '2025-12-10T16:34:28.029Z', '2025-12-10T17:10:49.814Z', 'SP', 'health_insurance', 'pme', '0.00', '0.00', 3, 'Facebook Meta', '', 'silver', ' '),
('21350b87-6f25-4867-a2e8-475392975e7b', 'Maria Santos', 'maria.santos@email.com', '(21) 88888-2222', 42, 'Rio de Janeiro', '8000-12000', 'bradesco-456', '62.80', 'available', '2025-09-05T17:43:49.782Z', '2025-09-05T17:43:49.782Z', 'SP', 'health_insurance', 'individual', '50.24', '94.20', 1, 'Google Ads', 'Seguro Saúde 2025', 'gold', NULL),
('24273022-4818-45b1-ad6a-1ac364b1fb6d', 'Monica Dias', 'monica.dias@email.com', '(67) 65432-3456', 42, 'Campo Grande', '6500-9000', 'bradesco-456', '58.70', 'available', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'MS', 'health_insurance', 'individual', '46.96', '88.05', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('282700b1-008f-49e9-9b0b-d3b093e82651', 'Camila Torres', 'camila.torres@email.com', '(41) 65432-1098', 30, 'Curitiba', '4500-6000', 'unimed-012', '44.20', 'sold', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'PR', 'health_insurance', 'individual', '35.36', '66.30', 1, 'Google Ads', 'Seguro Saúde 2025', 'bronze', NULL),
('2928787e-235e-49b4-872f-5ccece224c34', 'Roberto Alves', 'roberto.alves@email.com', '(31) 93333-7777', 45, 'Belo Horizonte', '8000-12000', 'sulamerica-789', '68.90', 'available', '2025-09-05T17:45:21.129Z', '2025-09-05T17:45:21.129Z', 'SP', 'health_insurance', 'individual', '55.12', '103.35', 1, 'Google Ads', 'Seguro Saúde 2025', 'gold', NULL),
('2af42d83-c5b2-49e8-a2bf-be8dd2080bb0', 'Thiago Ribeiro', 'thiago.ribeiro@email.com', '(84) 76543-9012', 35, 'Natal', '5500-7500', 'amil-123', '50.20', 'available', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'RN', 'health_insurance', 'individual', '40.16', '75.30', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('331123b1-77f1-451e-83e9-d03ac7dbd733', 'André Luiz Costa', 'andre.costa@email.com', '41865432109', 30, 'Curitiba', '8500.00', NULL, '72.00', 'sold', '2025-10-08T21:38:50.104Z', '2025-11-21T14:22:33.902Z', 'PR', 'health_insurance', 'familiar', '0.00', '0.00', 4, 'Google Ads', 'Campanha Sul', 'silver', 'Lead convertido - plano familiar completo'),
('3a3afd6a-e241-43b1-abd0-5dc7bdc31fb7', 'Silvia Parão', 'silvia36silva@hotmail.com', '(19) 99279-3504', NULL, 'HORTOLANDIA', '3000.00', NULL, '39.90', 'available', '2025-12-10T16:34:28.005Z', '2025-12-10T17:11:57.405Z', 'SP', 'health_insurance', 'pme', '0.00', '0.00', 2, 'Facebook Meta', '', 'silver', ' '),
('3ac4c77e-3f34-4de5-ac47-3bb97243fee8', 'José Wilson Boldrin', 'josewilson@yogaonline.com.br', '(17) 99155-5457', NULL, 'SAO JOSE DO RIO PRETO', '3000.00', NULL, '59.90', 'available', '2025-12-10T16:34:27.737Z', '2025-12-10T17:14:30.403Z', 'SP', 'health_insurance', 'pme', '0.00', '0.00', 10, 'Facebook Meta', '', 'diamond', ' '),
('3d01c1d3-5109-482e-9a4e-6c0d2f56a636', 'Renato Souza', 'renato.souza@email.com', '(71) 32109-8765', 43, 'Salvador', '5000-7000', 'sulamerica-789', '51.60', 'sold', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'BA', 'health_insurance', 'individual', '41.28', '77.40', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('4017cce4-f2d1-4b31-b8cf-8f207fb1b48f', 'Juliano Tavoloni', 'tavolonijuliano@gmail.com', '(19) 99980-2403', NULL, 'LIMEIRA', '3000.00', NULL, '49.90', 'available', '2025-12-10T16:34:27.714Z', '2025-12-10T17:03:48.952Z', 'SP', 'health_insurance', 'pme', '0.00', '0.00', 6, 'Facebook Meta', '', 'gold', ' '),
('40afd249-ca34-4b78-a823-7dd1f792f733', 'Pedro Henrique Lima', 'pedro.lima@email.com', '11921098765', 30, 'Campinas', '11000.00', NULL, '80.00', 'available', '2025-10-08T21:38:50.104Z', '2025-11-21T14:21:40.803Z', 'SP', 'health_insurance', 'empresarial', '0.00', '0.00', 12, 'LinkedIn', 'Campanha Empresas', 'gold', 'Dono de pequena empresa - 12 funcionários'),
('475c574f-8bb4-45dc-b2d9-3c562fa47b57', 'Priscila Almeida', 'priscila.almeida@email.com', '(65) 87654-5678', 28, 'Cuiabá', '4000-5500', 'unimed-012', '41.30', 'available', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'MT', 'health_insurance', 'individual', '33.04', '61.95', 1, 'Google Ads', 'Seguro Saúde 2025', 'bronze', NULL),
('4a2af011-3f2a-46db-b6cd-35a6f5e5f153', 'Helena Baptistella', 'hlglbaptistella@hotmail.com', '(19) 99811-3688', NULL, 'PIRACICABA ', '3000.00', NULL, '49.90', 'available', '2025-12-10T16:34:27.687Z', '2025-12-10T17:15:07.121Z', 'SP', 'health_insurance', 'pme', '0.00', '0.00', 6, 'Facebook Meta', '', 'gold', ' '),
('4de638d8-38d5-4fbf-9730-443125c9809d', 'Maria Fernanda Costa', 'maria.costa@email.com', '21976543210', 30, 'Rio de Janeiro', '6500.00', NULL, '33.00', 'available', '2025-10-08T21:38:50.104Z', '2025-11-21T14:20:48.425Z', 'RJ', 'health_insurance', 'individual', '0.00', '0.00', 1, 'Google Ads', 'Campanha RJ 2024', 'gold', 'Busca plano com boa rede credenciada'),
('4ebce33b-847d-410b-aa04-601706186318', 'Conceição Di Capua', 'conceicaoabrahaodicapua@gmail.com', '(22) 98833-5667', NULL, 'RIO DE JANEIRO', '3000.00', NULL, '49.90', 'available', '2025-12-10T16:34:27.225Z', '2025-12-10T17:27:32.729Z', 'RJ', 'health_insurance', 'pme', '0.00', '0.00', 4, 'Facebook Meta', '', 'gold', ''),
('50307729-0d02-43dc-85e6-e9a275e47551', 'Maria Silva', 'maria.silva@exemplo.com', '11987654321', 30, 'São Paulo', '3000.00', NULL, '21.00', 'available', '2025-10-03T20:42:27.239Z', '2025-11-21T14:21:14.369Z', 'SP', 'health_insurance', 'individual', '0.00', '0.00', 5, 'KommoCRM - Teste', 'Campanha Abril 2025', 'silver', 'Lead de teste importado via API'),
('52c4bf69-bdc3-4e4e-b227-831e2866cf6b', 'Claudio Porto', 'claudiolporto@yahoo.com.br', '(92) 98116-3700', NULL, 'RIO DE JANEIRO', '3000.00', NULL, '59.90', 'available', '2025-12-10T16:34:27.297Z', '2025-12-10T17:25:56.115Z', 'RJ', 'health_insurance', 'pme', '0.00', '0.00', 10, 'Facebook Meta', '', 'diamond', ''),
('59c1a228-5963-47f9-94e2-c5e21f263766', 'Daniela Silva', 'daniela.silva@email.com', '92798765432', 30, 'Manaus', '8800.00', NULL, '740.00', 'available', '2025-10-08T21:38:50.104Z', '2025-11-18T00:07:34.913Z', 'AM', 'health_insurance', 'familiar', '0.00', '0.00', 3, 'Facebook Ads', 'Campanha Norte', 'gold', 'Família com 1 filho adolescente'),
('5cdd62db-0e73-4e7f-adad-3fc3965671d6', 'Leonardo Freitas', 'leonardo.freitas@email.com', '(68) 54321-6789', 29, 'Rio Branco', '3800-5200', 'sulamerica-789', '43.50', 'sold', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'AC', 'health_insurance', 'individual', '34.80', '65.25', 1, 'Google Ads', 'Seguro Saúde 2025', 'bronze', NULL),
('6a352628-84c2-421f-8d9e-08a183e5e307', 'Martin von Simson', 'msimson@guiamaritimo.com.br', '(12) 99176-6992', NULL, 'SÃO PAULO', '3000.00', NULL, '49.90', 'available', '2025-12-10T16:34:27.637Z', '2025-12-10T17:15:32.145Z', 'SP', 'health_insurance', 'pme', '0.00', '0.00', 5, 'Facebook Meta', '', 'gold', ' '),
('6e017496-234b-4893-a4d5-2b9a0edff641', 'Carlos Ferreira', 'carlos.ferreira@email.com', '(11) 95555-5555', 38, 'São Paulo', '6000-8000', 'amil-123', '52.30', 'available', '2025-09-05T17:45:21.129Z', '2025-09-05T17:45:21.129Z', 'SP', 'health_insurance', 'individual', '41.84', '78.45', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('6fa673af-da9f-4fbf-aaf4-c711bc8e97e9', 'Lucia Mendes', 'lucia.mendes@email.com', '(21) 94444-6666', 29, 'Rio de Janeiro', '4000-6000', 'bradesco-456', '41.70', 'available', '2025-09-05T17:45:21.129Z', '2025-09-05T17:45:21.129Z', 'SP', 'health_insurance', 'individual', '33.36', '62.55', 1, 'Google Ads', 'Seguro Saúde 2025', 'bronze', NULL),
('71c28a12-5016-4539-a27e-6c6444a21420', 'Robert Dedding', 'deddingrobert@gmail.com', '(19) 99214-1441', NULL, 'CAMPINAS', '3000.00', NULL, '39.90', 'available', '2025-12-10T16:34:27.371Z', '2025-12-10T17:24:42.624Z', 'SP', 'health_insurance', 'pme', '0.00', '0.00', 2, 'Facebook Meta', '', 'silver', ' '),
('771fbabd-62ee-4e66-baac-82b9f8b68b11', 'Elisangela Barros Maravelli', 'eliselucca@hotmail.com', '(11) 98116-5967', NULL, 'SAO BERNARDO DO CAMPO', '3000.00', NULL, '39.90', 'available', '2025-12-10T16:34:27.454Z', '2025-12-10T17:22:04.958Z', 'SP', 'health_insurance', 'pme', '0.00', '0.00', 3, 'Facebook Meta', '', 'silver', ' '),
('77b00f1e-a7fd-4a15-bb46-415dc1fb300b', 'Ricardo Santos', 'ricardo.santos@email.com', '(51) 91111-9999', 41, 'Porto Alegre', '7000-10000', 'amil-123', '59.80', 'available', '2025-09-05T17:45:21.129Z', '2025-09-05T17:45:21.129Z', 'RS', 'health_insurance', 'individual', '47.84', '89.70', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('796b1913-f2a5-4f1b-b4f4-50b825cca743', 'Juliana Martins', 'juliana.martins@email.com', '71932109876', 29, 'Salvador', '4800.00', 'amil-123', '420.00', 'available', '2025-10-08T21:38:50.104Z', '2025-10-08T21:38:50.104Z', 'BA', 'health_insurance', 'individual', '300.00', '500.00', 1, 'Facebook Ads', 'Campanha BA 2024', 'silver', NULL),
('80cec5fb-5bad-4717-a982-818cfc135dfb', 'João Silva', 'joao.silva@email.com', '(11) 99999-1111', 35, 'São Paulo', '5000-8000', 'amil-123', '45.50', 'available', '2025-09-05T17:43:49.782Z', '2025-09-05T17:43:49.782Z', 'SP', 'health_insurance', 'individual', '36.40', '68.25', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('839c2355-60d4-42ac-813d-2c26826f9718', 'Elaine Magalhaes', 'etsmagalhaes@yahoo.com.br', '(21) 98748-4540', NULL, 'RIO DE JANEIRO', '3000.00', NULL, '49.90', 'available', '2025-12-10T16:34:27.959Z', '2025-12-10T17:12:07.158Z', 'RJ', 'health_insurance', 'pme', '0.00', '0.00', 4, 'Facebook Meta', '', 'gold', ' '),
('85a2b531-1df7-4479-b32c-320a6e5b4f35', 'Vanessa Gomes', 'vanessa.gomes@email.com', '(61) 43210-9876', 34, 'Brasília', '8000-11000', 'bradesco-456', '65.30', 'available', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'DF', 'health_insurance', 'individual', '52.24', '97.95', 1, 'Google Ads', 'Seguro Saúde 2025', 'gold', NULL),
('8c0b5f7b-19b0-4aa2-8d0c-f99ca3d35b84', 'Patricia Ferreira', 'patricia.ferreira@email.com', '(19) 98765-4321', 33, 'Campinas', '6000-8500', 'sulamerica-789', '56.40', 'available', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'SP', 'health_insurance', 'individual', '45.12', '84.60', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('8f6e1da3-8ea7-4dc2-8c7c-ba3ee8923e19', 'Fabio Martins', 'fabio.martins@email.com', '(27) 76543-4567', 36, 'Vitória', '7000-9500', 'bradesco-456', '61.20', 'available', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'ES', 'health_insurance', 'individual', '48.96', '91.80', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('917a37fc-3c86-451e-a26f-8e85e5e32a86', 'Marcos Silva', 'marcos.silva@email.com', '(62) 87654-6789', 39, 'Goiânia', '6500-9000', 'amil-123', '58.70', 'available', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'GO', 'health_insurance', 'individual', '46.96', '88.05', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('a6c3e9fb-78f2-4d7e-a8e5-ec4c7a8b3d29', 'Fernando Costa', 'fernando.costa@email.com', '(11) 97777-8888', 48, 'São Paulo', '10000-15000', 'amil-123', '72.10', 'available', '2025-09-05T17:45:21.129Z', '2025-09-05T17:45:21.129Z', 'SP', 'health_insurance', 'individual', '57.68', '108.15', 1, 'Google Ads', 'Seguro Saúde 2025', 'gold', NULL),
('b0c1f2e8-9d3a-4b7c-8e6f-5d4a3c2b1a09', 'Gustavo Barbosa', 'gustavo.barbosa@email.com', '(13) 21098-7654', 31, 'Santos', '5000-7000', 'unimed-012', '49.90', 'sold', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'SP', 'health_insurance', 'individual', '39.92', '74.85', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('c755c684-fcd0-4ced-946c-d7a74644408d', 'Isabel Barreto', 'isabel.barreto@email.com', '(11) 95222-6321', 33, 'São Paulo', '9000.00', NULL, '39.90', 'sold', '2025-12-10T13:28:50.341Z', '2025-12-10T16:42:05.536Z', 'SP', 'health_insurance', 'individual', '0.00', '0.00', 1, 'Facebook Meta', '', 'silver', ' '),
('c8df6a4c-31b4-4ee1-b8f7-0e8c5d2a9f1b', 'Alexandre Silva', 'alexandre.silva@email.com', '(48) 10987-6543', 44, 'Florianópolis', '9000-13000', 'unimed-012', '69.80', 'sold', '2025-09-05T17:46:00.971Z', '2025-09-05T17:46:00.971Z', 'SC', 'health_insurance', 'individual', '55.84', '104.70', 1, 'Google Ads', 'Seguro Saúde 2025', 'gold', NULL),
('e3d9c8b7-a6f5-4e3d-9c2b-1a0f8e7d6c5b', 'Beatriz Oliveira', 'beatriz.oliveira@email.com', '(11) 96666-7777', 27, 'São Paulo', '4500-6500', 'sulamerica-789', '48.30', 'available', '2025-09-05T17:45:21.129Z', '2025-09-05T17:45:21.129Z', 'SP', 'health_insurance', 'individual', '38.64', '72.45', 1, 'Google Ads', 'Seguro Saúde 2025', 'bronze', NULL),
('e7f8a9b0-c1d2-e3f4-a5b6-c7d8e9f0a1b2', 'Claudia Lima', 'claudia.lima@email.com', '(21) 92222-3333', 40, 'Rio de Janeiro', '7500-10000', 'bradesco-456', '64.70', 'available', '2025-09-05T17:45:21.129Z', '2025-09-05T17:45:21.129Z', 'SP', 'health_insurance', 'individual', '51.76', '97.05', 1, 'Google Ads', 'Seguro Saúde 2025', 'gold', NULL),
('f1e2d3c4-b5a6-9e8f-7d6c-5b4a3e2f1d0e', 'Diego Pereira', 'diego.pereira@email.com', '(11) 93333-4444', 37, 'São Paulo', '6500-9000', 'sulamerica-789', '58.70', 'available', '2025-09-05T17:45:21.129Z', '2025-09-05T17:45:21.129Z', 'SP', 'health_insurance', 'individual', '46.96', '88.05', 1, 'Google Ads', 'Seguro Saúde 2025', 'silver', NULL),
('f9fb9636-2b9a-4fdd-8c37-ca1652a7ff00', 'Felipe Castro', 'felipe.castro@email.com', '(85) 10987-6543', 40, 'Fortaleza', '7500-10000', 'amil-123', '63.90', 'sold', '2025-09-05T17:46:00.971Z', '2025-10-03T20:25:40.005Z', 'CE', 'health_insurance', 'individual', '51.12', '95.85', 1, 'Google Ads', 'Seguro Saúde 2025', 'gold', NULL)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at,
  price = EXCLUDED.price;

-- =====================================
-- 5. CREDIT TRANSACTIONS (Transações de Crédito)
-- =====================================

INSERT INTO credit_transactions (id, user_id, type, amount, description, balance_before, balance_after, created_at, payment_method, payment_id) VALUES
('46f25061-1a7b-42f3-816c-390f6b225d0b', '3febf047-4ce8-48f9-b070-8f0cd272d080', 'purchase', '-43.50', 'Lead purchase - Leonardo Freitas', '50.10', '6.60', '2025-09-05T14:55:17.334Z', 'manual', NULL),
('60a4ef92-5c69-40dc-aeb0-0bd99b0a8054', '83d4f4a4-f8e6-4f83-a4c6-e432844c6821', 'purchase', '-53.40', 'Lead purchase - Natalia Ramos', '948.40', '895.00', '2025-09-12T15:38:18.679Z', 'manual', NULL),
('6d31c91f-1f3e-423c-b83f-8a21972ddb85', '2a9dfa1d-72c0-4625-807e-eebf42f54c39', 'purchase', '-39.90', 'Lead purchase - Isabel Barreto', '50.00', '10.10', '2025-12-10T16:42:05.646Z', NULL, NULL),
('9190f13a-80b1-408d-a20b-f7d05920ccd7', '83d4f4a4-f8e6-4f83-a4c6-e432844c6821', 'purchase', '-75.20', 'Compra de lead: Ana Costa', '895.00', '819.80', '2025-10-03T17:14:54.036Z', 'credits', NULL),
('981e8637-27a1-41ce-9db0-68b33cbd3d97', '3febf047-4ce8-48f9-b070-8f0cd272d080', 'purchase', '-44.20', 'Lead purchase - Camila Torres', '600.60', '556.40', '2025-09-09T18:23:25.129Z', 'manual', NULL),
('9a3c4b5a-d7dd-494a-97f7-1fb9b391049b', '83d4f4a4-f8e6-4f83-a4c6-e432844c6821', 'purchase', '-63.90', 'Compra de lead: Felipe Castro', '819.80', '755.90', '2025-10-03T17:25:40.420Z', 'credits', NULL),
('9a8d24a8-37da-44b3-b0f0-e19f84d80c5c', '352ab832-60b1-4b5f-bfb4-92960483084e', 'deposit', '50.00', 'Depósito via Mercado Pago - PIX', '50.00', '100.00', '2025-12-10T15:35:30.657Z', 'bank_transfer', '137291883820'),
('a1a0d6c9-6943-433d-8870-5b57d2426482', '352ab832-60b1-4b5f-bfb4-92960483084e', 'purchase', '-39.90', 'Lead purchase - Carlos Rogério Almeida Silva', '100.00', '60.10', '2025-12-20T20:19:39.310Z', NULL, NULL),
('b6d4e63c-05dc-4fda-904f-7afed12d33e1', '83d4f4a4-f8e6-4f83-a4c6-e432844c6821', 'purchase', '-51.60', 'Lead purchase - Renato Souza', '1000.00', '948.40', '2025-09-05T15:00:38.090Z', 'manual', NULL),
('d703e737-691e-4435-b58c-20cc551090c2', '3febf047-4ce8-48f9-b070-8f0cd272d080', 'purchase', '-49.90', 'Lead purchase - Gustavo Barbosa', '100.00', '50.10', '2025-09-05T14:54:12.557Z', 'manual', NULL),
('ed375303-3ae2-40aa-82c4-6e3a3c549559', '2a9dfa1d-72c0-4625-807e-eebf42f54c39', 'deposit', '50.00', 'Depósito via Mercado Pago - PIX', '0.00', '50.00', '2025-12-10T13:01:11.076Z', 'bank_transfer', '137270160936'),
('f6a170d1-084a-4fe9-b1e4-6b9f6efb058c', '3febf047-4ce8-48f9-b070-8f0cd272d080', 'purchase', '-69.80', 'Lead purchase - Alexandre Silva', '556.40', '486.60', '2025-09-11T15:17:28.851Z', 'manual', NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- 6. LEAD PURCHASES (Compras de Leads)
-- =====================================

INSERT INTO lead_purchases (id, lead_id, user_id, price, purchased_at, status) VALUES
('2b5cc42c-32b1-4fb1-80f7-2e5ce7a5444b', '209cdd58-7248-4546-a38a-5772eb2a196c', '352ab832-60b1-4b5f-bfb4-92960483084e', '39.90', '2025-12-20T20:19:38.845Z', 'active'),
('a0a3feec-6c55-46c3-a0ec-fc43880937fb', 'c755c684-fcd0-4ced-946c-d7a74644408d', '2a9dfa1d-72c0-4625-807e-eebf42f54c39', '39.90', '2025-12-10T16:42:05.570Z', 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================
-- VERIFICAÇÃO
-- =====================================

-- Contar registros importados
SELECT 'insurance_companies' as tabela, COUNT(*) as total FROM insurance_companies
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
UNION ALL
SELECT 'credit_transactions', COUNT(*) FROM credit_transactions
UNION ALL
SELECT 'lead_purchases', COUNT(*) FROM lead_purchases;

-- =====================================
-- FIM DO SCRIPT
-- =====================================
