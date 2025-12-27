-- ================================================
-- VERIFICAÇÃO DO SCHEMA DO BANCO DE DADOS
-- ================================================
-- Execute este script no SQL Editor do Supabase para verificar
-- se todas as tabelas e colunas necessárias existem.
-- ================================================

-- Verificar colunas da tabela products
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
ORDER BY ordinal_position;

-- Verificar colunas da tabela customers
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'customers'
ORDER BY ordinal_position;

-- Verificar colunas da tabela sales
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sales'
ORDER BY ordinal_position;

-- Verificar colunas da tabela sale_items
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sale_items'
ORDER BY ordinal_position;

-- Verificar colunas da tabela categories
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'categories'
ORDER BY ordinal_position;

-- Verificar colunas da tabela credit_cards
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'credit_cards'
ORDER BY ordinal_position;

-- Verificar colunas da tabela settings (IMPORTANTE: verificar physical_profit_margin)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'settings'
ORDER BY ordinal_position;

-- ================================================
-- ADICIONAR COLUNA physical_profit_margin SE NÃO EXISTIR
-- ================================================
-- Se a coluna physical_profit_margin não aparecer acima,
-- execute este comando para adicioná-la:

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'settings'
    AND column_name = 'physical_profit_margin'
  ) THEN
    ALTER TABLE settings ADD COLUMN physical_profit_margin NUMERIC(10,4) DEFAULT 0.15;
    RAISE NOTICE 'Coluna physical_profit_margin adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna physical_profit_margin já existe.';
  END IF;
END
$$;

-- Verificar novamente a tabela settings
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'settings'
ORDER BY ordinal_position;

-- ================================================
-- VERIFICAR STATUS DO RLS
-- ================================================
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Se rls_enabled = false em alguma tabela, o RLS não está ativado
-- Execute o script supabase-rls-setup.sql para configurar
