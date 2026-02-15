/**
 * Mostra para qual branch/endpoint do Neon os dados foram migrados
 */

import { Pool } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function checkBranch() {
  console.log('🔍 Verificando conexão e branch...\n');
  
  const url = new URL(DATABASE_URL);
  const endpoint = url.hostname;
  
  console.log('📍 Conectando em:');
  console.log(`   Host: ${endpoint}`);
  console.log(`   Database: ${url.pathname.replace('/', '')}`);
  console.log(`   User: ${url.username}\n`);
  
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    // Verificar se há dados
    const result = await pool.query('SELECT COUNT(*) as count FROM leads');
    const count = result.rows[0].count;
    
    console.log('📊 Dados encontrados:');
    console.log(`   Leads: ${count}\n`);
    
    if (count > 0) {
      console.log('✅ DADOS ESTÃO NESTE ENDPOINT!');
      console.log(`\n🔑 Endpoint correto: ${endpoint.split('.')[0]}`);
      console.log(`\n⚠️  No console Neon, você precisa estar no branch que corresponde a:`);
      console.log(`   ${endpoint}`);
    } else {
      console.log('❌ Branch vazio!');
    }
    
    // Mostrar info do servidor
    const versionResult = await pool.query('SELECT version()');
    console.log(`\n📌 Servidor PostgreSQL conectado:\n   ${versionResult.rows[0].version.substring(0, 50)}...`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

checkBranch().catch(console.error);
