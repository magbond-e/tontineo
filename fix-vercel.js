const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'app', '(app)', 'admin');
const abonnementDir = path.join(__dirname, 'app', '(app)', 'abonnement');

try {
  if (fs.existsSync(adminDir)) {
    fs.rmSync(adminDir, { recursive: true, force: true });
    console.log('Supprimé: ' + adminDir);
  }
  if (fs.existsSync(abonnementDir)) {
    fs.rmSync(abonnementDir, { recursive: true, force: true });
    console.log('Supprimé: ' + abonnementDir);
  }
  console.log('✅ Succès ! Les vieux dossiers bloquants ont été supprimés.');
} catch (e) {
  console.error('Erreur:', e);
}
