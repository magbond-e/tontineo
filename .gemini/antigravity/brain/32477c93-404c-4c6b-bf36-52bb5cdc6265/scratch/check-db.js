const { createClient } = require('c:/Users/DELL/Desktop/Tontineo/node_modules/@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Lire et parser .env.local manuellement (évite d'installer dotenv)
const envPath = path.join(__dirname, '../../../../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  const key = trimmed.substring(0, eqIdx).trim();
  let val = trimmed.substring(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.substring(1, val.length - 1);
  }
  envConfig[key] = val;
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Erreur : variables d'environnement Supabase introuvables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log("=== VÉRIFICATION DE LA BASE DE DONNÉES SUPABASE ===");
  console.log(`URL : ${supabaseUrl}\n`);

  // Liste des tables attendues
  const expectedTables = [
    'profiles',
    'circles',
    'memberships',
    'cycles',
    'payments',
    'wallet_transactions',
    'notifications',
    'trust_events'
  ];

  console.log("--- 1. Vérification de l'existence des Tables ---");
  for (const table of expectedTables) {
    const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table [${table}] : Non trouvée ou erreur (Code: ${error.code}, Message: ${error.message})`);
    } else {
      console.log(`✅ Table [${table}] : Existe (Nombre de lignes : ${data?.length || 0 || '0+'})`);
    }
  }

  console.log("\n--- 2. Vérification des colonnes critiques de [profiles] ---");
  const { data: profileColumns, error: colError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (colError) {
    console.log(`❌ Impossible de lire la table profiles : ${colError.message}`);
  } else {
    const testColumns = [
      'id', 'full_name', 'phone', 'city', 'whatsapp', 'avatar_url', 
      'trust_score', 'wallet_balance', 'pin_code', 'failed_pin_attempts', 
      'is_locked', 'current_plan', 'has_pin',
      'wa_enabled', 'sms_enabled', 'email_enabled',
      'wa_reminders_enabled', 'wa_draws_enabled', 'wa_invites_enabled'
    ];

    for (const col of testColumns) {
      const { error } = await supabase.from('profiles').select(col).limit(1);
      if (error) {
        console.log(`❌ Colonne profiles.[${col}] : Manquante ou erreur (Code: ${error.code})`);
      } else {
        console.log(`✅ Colonne profiles.[${col}] : Existe`);
      }
    }
  }
}

checkDatabase().catch(console.error);
