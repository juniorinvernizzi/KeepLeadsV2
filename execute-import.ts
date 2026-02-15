import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const sql = neon(process.env.DATABASE_URL!);

async function executeImport() {
  try {
    console.log('🚀 Iniciando importação de dados...\n');
    
    const sqlScript = readFileSync('./import-data.sql', 'utf-8');
    
    // Separar comandos SQL (por blocos de comentários)
    const commands = sqlScript
      .split('-- =====================================')
      .filter(cmd => cmd.trim() && !cmd.trim().startsWith('Script de Importação') && !cmd.trim().startsWith('FIM DO SCRIPT'))
      .map(cmd => cmd.trim());
    
    for (const command of commands) {
      if (!command || command.startsWith('Limpar dados') || command.startsWith('VERIFICAÇÃO')) continue;
      
      const section = command.split('\n')[0];
      console.log(`📦 Importando: ${section}`);
      
      try {
        // Extrair apenas os comandos SQL (DELETE, INSERT, etc)
        const sqlCommands = command
          .split('\n')
          .filter(line => !line.startsWith('--'))
          .join('\n')
          .trim();
        
        if (sqlCommands) {
          await sql(sqlCommands);
          console.log(`   ✅ Concluído\n`);
        }
      } catch (err: any) {
        console.log(`   ⚠️  ${err.message}\n`);
      }
    }
    
    console.log('📊 Verificando dados importados...\n');
    
    // Verificar registros
    const results = await sql`
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
      SELECT 'lead_purchases', COUNT(*) FROM lead_purchases
      ORDER BY tabela;
    `;
    
    console.table(results);
    console.log('\n✅ Importação concluída!');
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
}

executeImport();
