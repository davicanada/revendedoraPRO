# 🚀 Guia Completo de Setup do Supabase

## Passo 1: Acessar o Dashboard do Supabase

Acesse: **https://zlqcuoacfzalwbfwlakp.supabase.co**

## Passo 2: Executar a Migration SQL

### 2.1. Abrir SQL Editor

1. Na barra lateral esquerda, clique no ícone **SQL Editor** (ícone de banco de dados)
2. Clique no botão **"New Query"** (canto superior direito)

### 2.2. Copiar e Executar o SQL

1. Abra o arquivo: `supabase/migrations/001_initial_schema.sql`
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no editor SQL** do Supabase
4. Clique em **"Run"** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

### 2.3. Verificar Sucesso

Você deve ver a mensagem: `Success. No rows returned`

Se houver erro, leia a mensagem e corrija (geralmente é porque já executou antes).

## Passo 3: Verificar Tabelas Criadas

1. Vá em **"Table Editor"** (ícone de tabela na barra lateral)
2. Você deve ver 8 tabelas:

```
✅ profiles         - Perfis de usuários
✅ products         - Produtos
✅ customers        - Clientes
✅ sales            - Vendas
✅ sale_items       - Itens de venda
✅ categories       - Categorias
✅ credit_cards     - Cartões de crédito
✅ settings         - Configurações
```

## Passo 4: Verificar Row Level Security

1. Clique em qualquer tabela (ex: `products`)
2. Vá na aba **"Policies"**
3. Você deve ver 4 políticas criadas:
   - Users can view own products
   - Users can insert own products
   - Users can update own products
   - Users can delete own products

Isso garante que cada usuário só vê seus próprios dados!

## Passo 5: Configurar Email (Opcional mas Recomendado)

### 5.1. Desabilitar Confirmação de Email (para testes)

1. Vá em **"Authentication"** > **"Providers"** > **"Email"**
2. Desmarque **"Enable email confirmations"**
3. Clique em **"Save"**

**Nota:** Em produção, mantenha habilitado!

### 5.2. Ou Configurar SMTP (Produção)

1. Vá em **"Project Settings"** > **"Auth"**
2. Role até **"SMTP Settings"**
3. Configure seu servidor de email (Gmail, SendGrid, etc.)

## Passo 6: Testar Autenticação

### 6.1. Criar Usuário de Teste Manualmente

1. Vá em **"Authentication"** > **"Users"**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha:
   - **Email:** `teste@revendedora.com`
   - **Password:** `123456` (mínimo 6 caracteres)
   - **Auto Confirm User:** ✅ Marque esta opção
4. Clique em **"Create user"**

### 6.2. Verificar Profile Criado Automaticamente

1. Vá em **"Table Editor"** > **"profiles"**
2. Você deve ver 1 registro com o email do usuário criado
3. Vá em **"settings"** - também deve ter 1 registro com valores padrão

**Isso confirma que o trigger está funcionando!**

## Passo 7: Iniciar a Aplicação

```bash
npm run dev
```

Acesse: http://localhost:3000

## Passo 8: Testar Login

### 8.1. Login com Usuário Criado

1. Na tela de login, insira:
   - **Email:** `teste@revendedora.com`
   - **Senha:** `123456`
2. Clique em **"Entrar"**

**Resultado esperado:** Você deve ser redirecionado para o Dashboard!

### 8.2. Ou Criar Nova Conta

1. Clique em **"Criar nova conta"**
2. Preencha:
   - **Nome:** Seu nome
   - **Email:** Seu email
   - **Senha:** No mínimo 6 caracteres
3. Clique em **"Criar Conta"**

**Se email confirmations estiver DESABILITADO:** Login automático
**Se HABILITADO:** Verifique seu email e clique no link de confirmação

## Passo 9: Testar CRUD

### 9.1. Adicionar Produto

1. Vá em **"Estoque"**
2. Clique no botão **"+"**
3. Preencha os dados e salve

**Verificar no Supabase:**
1. Vá em **"Table Editor"** > **"products"**
2. Você deve ver o produto criado!

### 9.2. Adicionar Cliente

1. Vá em **"Clientes"**
2. Clique no botão **"+"**
3. Preencha e salve

**Verificar no Supabase:**
- Vá em **"customers"** e confirme

### 9.3. Criar Venda

1. Vá em **"Vendas"** > **"Nova Venda"**
2. Selecione cliente
3. Adicione produtos ao carrinho
4. Confirme a venda

**Verificar no Supabase:**
- **sales** - deve ter 1 registro
- **sale_items** - deve ter N registros (1 por produto)

## Passo 10: Verificar RLS (Row Level Security)

### 10.1. Criar Segundo Usuário

1. No Supabase, vá em **"Authentication"** > **"Add user"**
2. Crie: `teste2@revendedora.com` / `123456`

### 10.2. Fazer Logout e Login com User 2

1. No app, vá em **"Configurações"** > **"Sair"**
2. Faça login com `teste2@revendedora.com`

### 10.3. Verificar Isolamento de Dados

**Resultado esperado:**
- Dashboard vazio (sem produtos, clientes, vendas)
- Cada usuário vê apenas seus próprios dados!

**Isso confirma que o RLS está funcionando perfeitamente!**

---

## 🎉 Parabéns! Sua integração com Supabase está completa!

## Estrutura Final

```
Frontend (React)
    ↓
AppContext (src/context/AppContext.tsx)
    ↓
Services (src/services/*.service.ts)
    ↓
Supabase Client (src/lib/supabase.ts)
    ↓
Supabase Backend (PostgreSQL + Auth + RLS)
```

## Recursos Implementados

✅ **Autenticação Real** - Supabase Auth
✅ **Banco de Dados PostgreSQL** - 8 tabelas relacionadas
✅ **Row Level Security** - Isolamento por usuário
✅ **CRUD Completo** - Products, Customers, Sales, Categories, Credit Cards
✅ **Triggers Automáticos** - Profile e Settings criados no signup
✅ **Validações de Dados** - Constraints e checks
✅ **Relacionamentos** - Foreign keys com cascade
✅ **Cache Local** - localStorage como fallback offline

## Próximos Passos (Opcional)

1. **Realtime Subscriptions** - Sincronização em tempo real
2. **Storage** - Upload de imagens de produtos
3. **Edge Functions** - Lógica serverless
4. **Database Webhooks** - Integrações com outros sistemas

---

## Troubleshooting

### Erro: "Invalid API key"

- Verifique se as variáveis de ambiente no `.env.local` estão corretas
- Reinicie o servidor (`npm run dev`)

### Erro: "Row Level Security policy violation"

- Verifique se você está logado
- Confirme que os policies foram criados corretamente no Supabase

### Erro: "Failed to fetch"

- Verifique sua conexão com internet
- Confirme que a URL do Supabase está correta no `.env.local`

### Dados não aparecem após criar

- Abra o console do navegador (F12)
- Verifique se há erros JavaScript
- Confirme que o userId está sendo passado corretamente

---

**Documentação Supabase:** https://supabase.com/docs
**Dashboard do Projeto:** https://zlqcuoacfzalwbfwlakp.supabase.co
