/**
 * Script de diagnóstico para testar a conexão com o Supabase
 * Execute no console do navegador (F12 -> Console):
 *
 * import { testSupabaseConnection } from './utils/testSupabaseConnection';
 * testSupabaseConnection();
 */

import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DE CONEXÃO SUPABASE\n');
  console.log('='.repeat(60));

  // 1. Verificar variáveis de ambiente
  console.log('\n📋 1. VERIFICANDO VARIÁVEIS DE AMBIENTE:');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('URL:', supabaseUrl);
  console.log('KEY (primeiros 20 chars):', supabaseKey?.substring(0, 20) + '...');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
    return;
  }

  // 2. Testar conexão básica
  console.log('\n🔌 2. TESTANDO CONEXÃO BÁSICA:');
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/', {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    console.log('Status da resposta:', response.status);
    console.log('Status OK:', response.ok);

    if (!response.ok) {
      console.error('❌ ERRO: Conexão falhou');
      console.error('Resposta:', await response.text());
      return;
    }

    console.log('✅ Conexão básica OK');
  } catch (err) {
    console.error('❌ ERRO ao conectar:', err);
    console.error('Isso pode indicar:');
    console.error('  - Problema de CORS');
    console.error('  - Firewall bloqueando');
    console.error('  - URL incorreta');
    console.error('  - Projeto Supabase inativo');
    return;
  }

  // 3. Verificar autenticação
  console.log('\n👤 3. VERIFICANDO AUTENTICAÇÃO:');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Erro ao obter sessão:', error);
    } else if (!session) {
      console.warn('⚠️ Nenhuma sessão ativa (usuário não está logado)');
    } else {
      console.log('✅ Sessão ativa encontrada');
      console.log('User ID:', session.user.id);
      console.log('Email:', session.user.email);
    }
  } catch (err) {
    console.error('❌ ERRO ao verificar autenticação:', err);
  }

  // 4. Testar query simples em cada tabela
  console.log('\n📊 4. TESTANDO ACESSO ÀS TABELAS:');

  const tables = [
    'products',
    'customers',
    'sales',
    'categories',
    'credit_cards',
    'settings'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        console.error(`❌ ${table}:`, error.message);
        console.error('   Código:', error.code);
        console.error('   Detalhes:', error.details);
        console.error('   Dica:', error.hint);
      } else {
        console.log(`✅ ${table}: OK (${count ?? 0} registros)`);
      }
    } catch (err: any) {
      console.error(`❌ ${table}: EXCEÇÃO -`, err.message);
    }
  }

  // 5. Testar permissões de escrita
  console.log('\n✏️ 5. TESTANDO PERMISSÕES DE ESCRITA (settings):');
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.warn('⚠️ Não foi possível testar escrita: usuário não está logado');
    } else {
      // Tentar upsert nas configurações
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          user_id: session.user.id,
          default_commission: 0.15,
          physical_profit_margin: 0.15,
          low_stock_threshold: 3,
          currency: 'BRL'
        })
        .select();

      if (error) {
        console.error('❌ Erro ao escrever:', error.message);
        console.error('   Código:', error.code);
      } else {
        console.log('✅ Escrita OK:', data);
      }
    }
  } catch (err: any) {
    console.error('❌ EXCEÇÃO ao testar escrita:', err.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 DIAGNÓSTICO COMPLETO\n');
}
