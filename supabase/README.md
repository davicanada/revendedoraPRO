# Supabase Database Setup

## Instruções para Criar o Banco de Dados

### 1. Acessar o Supabase Dashboard

Acesse: https://zlqcuoacfzalwbfwlakp.supabase.co

### 2. Executar a Migration SQL

1. No dashboard, vá em **SQL Editor** (ícone de banco de dados na barra lateral)
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `migrations/001_initial_schema.sql`
4. Cole no editor SQL
5. Clique em **Run** (ou pressione Ctrl+Enter)

### 3. Verificar Tabelas Criadas

Após executar o SQL, vá em **Table Editor** e você deverá ver as seguintes tabelas:

- ✅ **profiles** - Perfis de usuários
- ✅ **products** - Produtos
- ✅ **customers** - Clientes
- ✅ **sales** - Vendas
- ✅ **sale_items** - Itens de venda
- ✅ **categories** - Categorias
- ✅ **credit_cards** - Cartões de crédito
- ✅ **settings** - Configurações do usuário

### 4. Estrutura do Banco de Dados

```
┌─────────────┐
│   auth.users│ (Gerenciado pelo Supabase Auth)
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌─────▼────────┐
│  profiles   │   │   settings   │
└─────────────┘   └──────────────┘
       │
       ├──────────┬──────────┬──────────┬──────────────┐
       │          │          │          │              │
┌──────▼──────┐ ┌▼────────┐ ┌▼────────┐ ┌▼────────┐ ┌─▼──────────┐
│  products   │ │customers│ │  sales  │ │categories│ │credit_cards│
└─────────────┘ └────┬────┘ └────┬────┘ └──────────┘ └────────────┘
                     │           │
                     └─────┬─────┘
                           │
                    ┌──────▼──────┐
                    │ sale_items  │
                    └─────────────┘
```

### 5. Recursos de Segurança

✅ **Row Level Security (RLS)** - Habilitado em todas as tabelas
- Cada usuário só acessa seus próprios dados
- Políticas automáticas de SELECT, INSERT, UPDATE, DELETE

✅ **Triggers Automáticos**
- `updated_at` atualizado automaticamente
- Profile e settings criados automaticamente no signup

✅ **Validações**
- Constraints de integridade referencial
- Checks para valores válidos (dias de vencimento 1-31)
- Tipos de venda validados

### 6. Próximos Passos

Após executar a migration:

1. O banco de dados está pronto
2. Volte para a aplicação e rode `npm run dev`
3. Crie uma conta na tela de login
4. Os dados serão salvos no Supabase automaticamente

### 7. Dados Iniciais (Opcional)

Se quiser popular o banco com dados de exemplo, execute também:
`migrations/002_seed_data.sql`

---

**URL do Projeto:** https://zlqcuoacfzalwbfwlakp.supabase.co
**Documentação:** https://supabase.com/docs
