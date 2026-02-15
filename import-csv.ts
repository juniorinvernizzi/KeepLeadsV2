import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { config } from "dotenv";

// Carregar variáveis de ambiente
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não encontrada no .env");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

interface CsvRow {
  [key: string]: string;
}

/**
 * Parse CSV file and return array of objects
 */
async function parseCSV(filePath: string): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let headers: string[] = [];
    let isFirstLine = true;

    rl.on("line", (line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));

      if (isFirstLine) {
        headers = values;
        isFirstLine = false;
      } else {
        const row: CsvRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        results.push(row);
      }
    });

    rl.on("close", () => {
      resolve(results);
    });

    rl.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Import insurance companies from CSV
 */
async function importInsuranceCompanies(filePath: string) {
  console.log("\n🏢 Importando seguradoras...");

  const rows = await parseCSV(filePath);

  for (const row of rows) {
    try {
      await sql`
        INSERT INTO insurance_companies (name, logo, color)
        VALUES (${row.name}, ${row.logo || null}, ${row.color || "#7C3AED"})
        ON CONFLICT DO NOTHING
      `;
      console.log(`  ✅ ${row.name}`);
    } catch (error: any) {
      console.error(`  ❌ Erro ao importar ${row.name}:`, error.message);
    }
  }

  console.log("✅ Seguradoras importadas!");
}

/**
 * Import users from CSV
 */
async function importUsers(filePath: string) {
  console.log("\n👥 Importando usuários...");

  const rows = await parseCSV(filePath);

  for (const row of rows) {
    try {
      await sql`
        INSERT INTO users (email, password, first_name, last_name, role, status, credits)
        VALUES (
          ${row.email},
          ${row.password},
          ${row.first_name || ""},
          ${row.last_name || ""},
          ${row.role || "client"},
          ${row.status || "active"},
          ${row.credits || "0.00"}
        )
        ON CONFLICT (email) DO NOTHING
      `;
      console.log(`  ✅ ${row.email}`);
    } catch (error: any) {
      console.error(`  ❌ Erro ao importar ${row.email}:`, error.message);
    }
  }

  console.log("✅ Usuários importados!");
}

/**
 * Import leads from CSV
 */
async function importLeads(filePath: string) {
  console.log("\n📋 Importando leads...");

  const rows = await parseCSV(filePath);

  for (const row of rows) {
    try {
      // Buscar ID da seguradora se houver
      let insuranceCompanyId = null;
      if (row.insurance_company) {
        const result = await sql`
          SELECT id FROM insurance_companies WHERE name = ${row.insurance_company} LIMIT 1
        `;
        if (result.length > 0) {
          insuranceCompanyId = result[0].id;
        }
      }

      await sql`
        INSERT INTO leads (
          name, email, phone, age, city, state, income,
          insurance_company_id, plan_type, category,
          budget_min, budget_max, available_lives,
          source, campaign, quality, status, price, notes
        )
        VALUES (
          ${row.name},
          ${row.email},
          ${row.phone},
          ${parseInt(row.age) || 30},
          ${row.city || null},
          ${row.state},
          ${row.income || "3000.00"},
          ${insuranceCompanyId},
          ${row.plan_type || "individual"},
          ${row.category || "health_insurance"},
          ${row.budget_min || null},
          ${row.budget_max || null},
          ${parseInt(row.available_lives) || 1},
          ${row.source},
          ${row.campaign || null},
          ${row.quality || "silver"},
          ${row.status || "available"},
          ${row.price},
          ${row.notes || null}
        )
      `;
      console.log(`  ✅ ${row.name} - ${row.email}`);
    } catch (error: any) {
      console.error(`  ❌ Erro ao importar ${row.name}:`, error.message);
    }
  }

  console.log("✅ Leads importados!");
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Iniciando importação de dados CSV para Neon DB\n");

  // Verificar conexão com o banco
  try {
    const result = await sql`SELECT NOW()`;
    console.log("✅ Conectado ao Neon DB:", result[0].now);
  } catch (error: any) {
    console.error("❌ Erro ao conectar ao banco:", error.message);
    process.exit(1);
  }

  // Solicitar arquivo CSV ao usuário
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("\n📖 Uso:");
    console.log("  npm run import:csv -- --type=<tipo> --file=<caminho>");
    console.log("\nTipos disponíveis:");
    console.log("  - insurance_companies: Importar seguradoras");
    console.log("  - users: Importar usuários");
    console.log("  - leads: Importar leads");
    console.log("\nExemplo:");
    console.log('  npm run import:csv -- --type=leads --file="./data/leads.csv"');
    process.exit(0);
  }

  const typeArg = args.find((arg) => arg.startsWith("--type="));
  const fileArg = args.find((arg) => arg.startsWith("--file="));

  if (!typeArg || !fileArg) {
    console.error("❌ Parâmetros --type e --file são obrigatórios");
    process.exit(1);
  }

  const type = typeArg.split("=")[1];
  const filePath = fileArg.split("=")[1].replace(/^["']|["']$/g, "");

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  // Importar de acordo com o tipo
  try {
    switch (type) {
      case "insurance_companies":
        await importInsuranceCompanies(filePath);
        break;
      case "users":
        await importUsers(filePath);
        break;
      case "leads":
        await importLeads(filePath);
        break;
      default:
        console.error(`❌ Tipo desconhecido: ${type}`);
        console.log("Tipos válidos: insurance_companies, users, leads");
        process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Erro durante importação:", error.message);
    process.exit(1);
  }

  console.log("\n🎉 Importação concluída com sucesso!");
}

main();
