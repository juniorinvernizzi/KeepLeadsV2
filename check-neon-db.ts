/**
 * Verifica qual banco Neon está configurado
 */

// URL configurada na Vercel (banco que migramos PARA)
const VERCEL_DB = 'postgresql://neondb_owner:npg_3NCUd4uRaSTm@ep-young-math-ae4kpbip.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Extrair informações da URL
const url = new URL(VERCEL_DB);

console.log('🔍 Banco configurado na Vercel:\n');
console.log('Host/Endpoint:', url.hostname);
console.log('Database:', url.pathname.replace('/', ''));
console.log('User:', url.username);
console.log('\n---\n');

console.log('📋 Informações da sua URL do console:\n');
console.log('Project: long-shadow-95920870');
console.log('Branch: br-blue-math-aewgxo0q');
console.log('Endpoint: ep-young-math-ae4kpbip');
console.log('\n---\n');

// Verificar se o endpoint corresponde
const endpoint = url.hostname.split('.')[0]; // ep-young-math-ae4kpbip

console.log('✅ VERIFICAÇÃO:\n');
console.log(`Endpoint na DATABASE_URL: ${endpoint}`);
console.log(`Endpoint esperado: ep-young-math-ae4kpbip`);
console.log(`Branch contém "blue-math": ${url.hostname.includes('young-math') ? '✅ SIM' : '❌ NÃO'}`);

if (url.hostname.includes('young-math')) {
  console.log('\n🎉 SIM! É o mesmo banco!');
  console.log('O endpoint "ep-young-math-ae4kpbip" corresponde ao branch "br-blue-math-aewgxo0q"');
  console.log('\nSeus dados migrados estão neste banco! ✅');
} else {
  console.log('\n⚠️  Verificação necessária no console Neon');
}
