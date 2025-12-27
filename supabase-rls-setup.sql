-- ================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) SETUP
-- ================================================
-- Execute este script no SQL Editor do Supabase para configurar
-- as políticas de segurança que permitem os usuários acessarem
-- apenas seus próprios dados.
--
-- Como executar:
-- 1. Acesse seu projeto no Supabase Dashboard
-- 2. Vá em "SQL Editor" no menu lateral
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
-- ================================================

-- ================================================
-- TABELA: products
-- ================================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios produtos
CREATE POLICY "Users can view own products"
ON products FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir seus próprios produtos
CREATE POLICY "Users can insert own products"
ON products FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios produtos
CREATE POLICY "Users can update own products"
ON products FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios produtos
CREATE POLICY "Users can delete own products"
ON products FOR DELETE
USING (auth.uid() = user_id);

-- ================================================
-- TABELA: customers
-- ================================================

-- Habilitar RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios clientes
CREATE POLICY "Users can view own customers"
ON customers FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir seus próprios clientes
CREATE POLICY "Users can insert own customers"
ON customers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios clientes
CREATE POLICY "Users can update own customers"
ON customers FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios clientes
CREATE POLICY "Users can delete own customers"
ON customers FOR DELETE
USING (auth.uid() = user_id);

-- ================================================
-- TABELA: sales
-- ================================================

-- Habilitar RLS
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias vendas
CREATE POLICY "Users can view own sales"
ON sales FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias vendas
CREATE POLICY "Users can insert own sales"
ON sales FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias vendas
CREATE POLICY "Users can update own sales"
ON sales FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias vendas
CREATE POLICY "Users can delete own sales"
ON sales FOR DELETE
USING (auth.uid() = user_id);

-- ================================================
-- TABELA: sale_items
-- ================================================

-- Habilitar RLS
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver itens de suas próprias vendas
CREATE POLICY "Users can view own sale_items"
ON sale_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sales
    WHERE sales.id = sale_items.sale_id
    AND sales.user_id = auth.uid()
  )
);

-- Política: Usuários podem inserir itens em suas próprias vendas
CREATE POLICY "Users can insert own sale_items"
ON sale_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sales
    WHERE sales.id = sale_items.sale_id
    AND sales.user_id = auth.uid()
  )
);

-- Política: Usuários podem atualizar itens de suas próprias vendas
CREATE POLICY "Users can update own sale_items"
ON sale_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM sales
    WHERE sales.id = sale_items.sale_id
    AND sales.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sales
    WHERE sales.id = sale_items.sale_id
    AND sales.user_id = auth.uid()
  )
);

-- Política: Usuários podem deletar itens de suas próprias vendas
CREATE POLICY "Users can delete own sale_items"
ON sale_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM sales
    WHERE sales.id = sale_items.sale_id
    AND sales.user_id = auth.uid()
  )
);

-- ================================================
-- TABELA: categories
-- ================================================

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias categorias
CREATE POLICY "Users can view own categories"
ON categories FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias categorias
CREATE POLICY "Users can insert own categories"
ON categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias categorias
CREATE POLICY "Users can update own categories"
ON categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias categorias
CREATE POLICY "Users can delete own categories"
ON categories FOR DELETE
USING (auth.uid() = user_id);

-- ================================================
-- TABELA: credit_cards
-- ================================================

-- Habilitar RLS
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios cartões
CREATE POLICY "Users can view own credit_cards"
ON credit_cards FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir seus próprios cartões
CREATE POLICY "Users can insert own credit_cards"
ON credit_cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios cartões
CREATE POLICY "Users can update own credit_cards"
ON credit_cards FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios cartões
CREATE POLICY "Users can delete own credit_cards"
ON credit_cards FOR DELETE
USING (auth.uid() = user_id);

-- ================================================
-- TABELA: settings
-- ================================================

-- Habilitar RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias configurações
CREATE POLICY "Users can view own settings"
ON settings FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias configurações
CREATE POLICY "Users can insert own settings"
ON settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias configurações
CREATE POLICY "Users can update own settings"
ON settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias configurações
CREATE POLICY "Users can delete own settings"
ON settings FOR DELETE
USING (auth.uid() = user_id);

-- ================================================
-- VERIFICAÇÃO FINAL
-- ================================================
-- Execute esta query para verificar se todas as políticas foram criadas:

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Você deve ver 4 políticas para cada tabela (SELECT, INSERT, UPDATE, DELETE)
-- Exceto sale_items que tem políticas mais complexas devido ao relacionamento
