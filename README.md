# RevendedoraPRO

Sistema completo de gestão para revendedoras de cosméticos (Natura, Avon e outras marcas) com **backend Supabase**.

## Sobre o Projeto

RevendedoraPRO é uma aplicação **full-stack** moderna que ajuda revendedoras a gerenciar seus negócios de forma eficiente, incluindo:

- **Gestão de Estoque**: Controle total de produtos, alertas de estoque baixo
- **Gestão de Vendas**: Vendas físicas (estoque) e online (comissão)
- **Gestão de Clientes**: Base de clientes com tags e histórico
- **Dashboard**: Métricas em tempo real com gráficos
- **Financeiro**: Controle de cartões de crédito e comissões
- **Categorias**: Organização personalizada de produtos
- **Autenticação Real**: Login/registro com Supabase Auth
- **Banco de Dados**: PostgreSQL com Row Level Security

## Tecnologias Utilizadas

### Frontend
- **React 19.2.3** - Framework UI
- **TypeScript 5.8.2** - Tipagem estática
- **Vite 6.2.0** - Build tool ultra-rápido
- **Tailwind CSS** - Estilização
- **Recharts 3.6.0** - Gráficos
- **Lucide React** - Ícones
- **Context API** - Gerenciamento de estado global

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Supabase Auth** - Autenticação de usuários
- **Row Level Security** - Segurança a nível de linha
- **Supabase Client** - SDK JavaScript

### Persistência
- **Supabase Database** - Persistência primária
- **localStorage** - Cache offline (fallback)

## Estrutura do Projeto

```
RevendedoraPro/
├── src/
│   ├── components/
│   │   ├── common/              # Componentes reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── BrandLogo.tsx
│   │   │   └── DeleteConfirmationModal.tsx
│   │   └── screens/             # Telas do aplicativo
│   │       ├── LoginScreen.tsx
│   │       ├── DashboardScreen.tsx
│   │       ├── StockScreen.tsx
│   │       ├── CustomersScreen.tsx
│   │       ├── SalesScreen.tsx
│   │       ├── NewSaleScreen.tsx
│   │       ├── AddProductScreen.tsx
│   │       ├── AddCustomerScreen.tsx
│   │       ├── SettingsScreen.tsx
│   │       ├── CreditCardsScreen.tsx
│   │       ├── ManageBrandsScreen.tsx
│   │       └── CategoriesScreen.tsx
│   ├── context/
│   │   └── AppContext.tsx       # Contexto global da aplicação
│   ├── utils/
│   │   └── calculations.ts      # Funções utilitárias
│   ├── types.ts                 # Definições de tipos TypeScript
│   ├── constants.ts             # Dados iniciais e constantes
│   └── App.tsx                  # Componente principal
├── index.tsx                    # Entry point
├── index.html                   # HTML base
├── vite.config.ts               # Configuração Vite
├── tsconfig.json                # Configuração TypeScript
└── package.json                 # Dependências

```

## Instalação e Execução

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Supabase (gratuita)

### Passos

1. Clone o repositório ou navegue até a pasta do projeto

2. Instale as dependências:
```bash
npm install
```

3. Configure o Supabase:
   - Siga o guia completo em **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**
   - Execute o SQL da migration no Supabase Dashboard
   - As credenciais já estão configuradas no `.env.local`

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse no navegador:
```
http://localhost:3000
```

## Primeiro Acesso

### Opção 1: Criar Nova Conta
1. Clique em "Criar nova conta"
2. Preencha seus dados
3. Login automático (se confirmação de email estiver desabilitada)

### Opção 2: Criar Usuário Manualmente no Supabase
1. Acesse o Supabase Dashboard
2. Vá em Authentication > Users > Add user
3. Crie um usuário de teste
4. Marque "Auto Confirm User"
5. Use as credenciais para fazer login

## Funcionalidades Principais

### Dashboard
- Métricas em tempo real (lucro, vendas, estoque)
- Gráfico de evolução de vendas
- Distribuição de vendas (físicas vs online)
- Alertas de estoque baixo

### Gestão de Estoque
- Adicionar/remover produtos
- Controle de quantidade
- Alertas de estoque mínimo
- Filtros por marca e categoria
- Cálculo automático de valor investido

### Gestão de Vendas
- **Venda Física**: Desconta do estoque, lucro = (preço venda - custo)
- **Venda Online**: Não afeta estoque, lucro = comissão (15% padrão)
- Carrinho de compras com edição de preços
- Descontos (% ou R$)
- Cálculo automático de lucro

### Gestão de Clientes
- Base de clientes com tags (VIP, Novo, Inativo)
- Histórico de compras
- Total gasto por cliente
- Busca por nome ou telefone

### Categorias e Marcas
- Categorias personalizadas com subcategorias
- Cores customizáveis
- Múltiplas marcas suportadas
- CRUD completo

### Financeiro
- Gestão de cartões de crédito
- Configuração de comissão padrão
- Controle de limite e vencimento

## Persistência de Dados

### Banco de Dados Supabase (PostgreSQL)

Todos os dados são salvos automaticamente no **Supabase**:
- ✅ **Produtos** - Tabela `products`
- ✅ **Clientes** - Tabela `customers`
- ✅ **Vendas** - Tabelas `sales` + `sale_items`
- ✅ **Categorias** - Tabela `categories`
- ✅ **Cartões de Crédito** - Tabela `credit_cards`
- ✅ **Configurações** - Tabela `settings`
- ✅ **Perfil do Usuário** - Tabela `profiles`

### Segurança Row Level Security (RLS)

Cada usuário tem acesso **APENAS** aos seus próprios dados:
- Usuário A não vê dados do Usuário B
- Isolamento total por `user_id`
- Políticas de segurança automáticas

### Cache Offline

**localStorage** é usado apenas como cache de fallback para acesso offline.

## Arquitetura

### Full-Stack Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (React + TypeScript)        │
│  ┌────────────────────────────────────────┐ │
│  │     Components (Screens + Common)      │ │
│  └──────────────┬─────────────────────────┘ │
│                 │                             │
│  ┌──────────────▼─────────────────────────┐ │
│  │     AppContext (State Management)       │ │
│  └──────────────┬─────────────────────────┘ │
│                 │                             │
│  ┌──────────────▼─────────────────────────┐ │
│  │    Services (Business Logic Layer)      │ │
│  │  - productsService                       │ │
│  │  - customersService                      │ │
│  │  - salesService                          │ │
│  │  - categoriesService                     │ │
│  └──────────────┬─────────────────────────┘ │
└─────────────────┼─────────────────────────────┘
                  │
         ┌────────▼────────┐
         │ Supabase Client │
         └────────┬────────┘
                  │
┌─────────────────▼─────────────────────────────┐
│           Supabase Backend (BaaS)             │
│  ┌──────────────────────────────────────────┐│
│  │     PostgreSQL Database (8 tabelas)      ││
│  └──────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────┐│
│  │  Supabase Auth (JWT + Sessions)          ││
│  └──────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────┐│
│  │  Row Level Security (RLS Policies)       ││
│  └──────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────┐│
│  │  Triggers & Functions (Auto-creation)    ││
│  └──────────────────────────────────────────┘│
└───────────────────────────────────────────────┘
```

### Context API
O aplicativo usa React Context API para gerenciamento de estado global, com integração completa ao Supabase.

### Services Layer
Cada entidade tem seu próprio service que abstrai a comunicação com o Supabase:
- `productsService` - CRUD de produtos
- `customersService` - CRUD de clientes
- `salesService` - CRUD de vendas
- `categoriesService` - CRUD de categorias
- `creditCardsService` - CRUD de cartões
- `settingsService` - Gerenciamento de configurações

### Tipagem TypeScript
- ✅ Todo o código fortemente tipado
- ✅ Zero uso de `any`
- ✅ Database types gerados automaticamente
- ✅ Segurança de tipos end-to-end

### Componentização
- **Componentes Common**: Reutilizáveis (Button, Input, Card, etc.)
- **Screens**: Telas independentes e modulares
- **Hooks**: `useAuth`, `useApp`
- **Utils**: Funções puras para cálculos e formatação

## Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Cria build de produção
npm run preview  # Preview do build de produção
```

## Melhorias Implementadas

### Versão 1.0 → 2.0 (Refatoração Frontend)

✅ **Arquitetura modular** - De 1 arquivo (1982 linhas) para 26 arquivos organizados
✅ **Context API** - Eliminação de props drilling
✅ **Tipagem completa** - Zero tipos `any`
✅ **Componentização** - Componentes reutilizáveis
✅ **Bugs corrigidos** - `getStatusBadge`, `AddCustomerScreen`

### Versão 2.0 → 3.0 (Backend Supabase) - **ATUAL**

✅ **Backend Completo** - PostgreSQL com 8 tabelas relacionadas
✅ **Autenticação Real** - Supabase Auth com JWT
✅ **Row Level Security** - Isolamento total por usuário
✅ **CRUD Completo** - Todos os serviços integrados ao Supabase
✅ **Triggers Automáticos** - Profile e Settings criados no signup
✅ **Validações de Dados** - Constraints e foreign keys
✅ **Cache Offline** - localStorage como fallback
✅ **Multi-usuário** - Suporte a múltiplos usuários independentes
✅ **Segurança** - RLS policies em todas as tabelas
✅ **Escalabilidade** - Pronto para milhares de usuários

## Próximas Funcionalidades Sugeridas

- [ ] Backup/exportação de dados (JSON/CSV)
- [ ] Gráficos mais detalhados (por marca, categoria)
- [ ] Metas de vendas mensais
- [ ] Calculadora de preços
- [ ] Integração com WhatsApp
- [ ] PWA (Progressive Web App)
- [ ] Backend com API REST
- [ ] Multi-usuário

## Autor

Desenvolvido para revendedoras autônomas de cosméticos.

## Licença

MIT License

---

**Versão**: 2.4.0 (Refatorada)
**Data**: Dezembro 2024
