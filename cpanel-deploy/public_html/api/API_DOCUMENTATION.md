# KeepLeads API Documentation
## Mapeamento de Rotas Express → PHP

### Authentication Routes
- **POST** `/api/simple-login` - Login de usuário
  - Body: `{email: string, password: string}`
  - Response: `{success: boolean, user: UserObject}`

- **POST** `/api/simple-register` - Registro de usuário
  - Body: `{email: string, password: string, firstName?: string, lastName?: string}`
  - Response: `{success: boolean, user: UserObject}`

- **POST** `/api/simple-logout` - Logout de usuário
  - Response: `{success: boolean}`

- **GET** `/api/simple-auth/user` - Obter usuário logado
  - Response: `UserObject`

### Leads Routes
- **GET** `/api/leads` - Listar leads com filtros
  - Query Params: `search, insuranceCompany, ageRange, city, minPrice, maxPrice`
  - Response: `Lead[]`

- **GET** `/api/leads/{id}` - Obter lead específico
  - Response: `Lead`

- **POST** `/api/leads/{id}/purchase` - Comprar lead (authenticated)
  - Response: `{success: boolean, message: string}`

### User Routes
- **GET** `/api/my-leads` - Leads comprados pelo usuário (authenticated)
  - Response: `Lead[]`

- **GET** `/api/transactions` - Transações do usuário (authenticated)
  - Response: `Transaction[]`

- **PUT** `/api/user/profile` - Atualizar perfil (authenticated)
  - Body: `{firstName: string, lastName: string, profileImageUrl?: string}`

### Insurance Companies
- **GET** `/api/insurance-companies` - Listar operadoras
  - Response: `{id: string, name: string, logo?: string, color: string}[]`

### Payment Routes  
- **POST** `/api/payment/create-preference` - Criar preferência Mercado Pago (authenticated)
  - Body: `{amount: number, description: string}`
  - Response: `{preferenceId: string, initPoint: string}`

- **POST** `/api/payment/webhook` - Webhook Mercado Pago
  - Body: Mercado Pago notification

### Admin Routes (role = admin)
- **GET** `/api/admin/users` - Listar todos usuários
- **GET** `/api/admin/stats` - Estatísticas do sistema
- **GET** `/api/admin/leads` - Listar todos leads
- **POST** `/api/admin/leads` - Criar novo lead
- **PUT** `/api/admin/leads/{id}` - Atualizar lead
- **DELETE** `/api/admin/leads/{id}` - Deletar lead

## Data Models

### User
```typescript
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'admin' | 'client',
  credits: string,
  profileImageUrl?: string,
  createdAt: string,
  updatedAt: string
}
```

### Lead
```typescript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  age: number,
  city: string,
  state: string,
  insuranceCompanyId: string,
  planType: string,
  budgetMin: string,
  budgetMax: string,
  availableLives: number,
  source: string,
  campaign: string,
  quality: 'high' | 'medium' | 'low',
  status: 'available' | 'sold' | 'reserved',
  price: string,
  notes: string,
  createdAt: string,
  updatedAt: string
}
```