import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6iuD8BTIYECy@ep-calm-bread-ae4jen49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function check() {
  try {
    console.log('🔍 Verificando tabelas no branch production...\n');
    
    const result = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    
    if (result.rows.length === 0) {
      console.log('❌ Nenhuma tabela encontrada no production!');
    } else {
      console.log(`✅ ${result.rows.length} tabelas encontradas:\n`);
      result.rows.forEach(row => console.log(`  - ${row.tablename}`));
      
      // Contar registros
      console.log('\n📊 Contagem de registros:');
      for (const row of result.rows) {
        const count = await pool.query(`SELECT COUNT(*) FROM ${row.tablename}`);
        console.log(`  ${row.tablename}: ${count.rows[0].count} registros`);
      }
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erro:', error);
    await pool.end();
  }
}

check();
