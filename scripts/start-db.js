const { createServer } = require('pglite-server');
const { PGlite } = require('@electric-sql/pglite');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../data/pgdata');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function main() {
  const db = new PGlite(dataDir);
  const server = createServer(db);

  server.listen(5432, () => {
    console.log('🐘 PostgreSQL Wire-Protocol Server running on localhost:5432 (Data stored in ./data/pgdata)');
  });
}

main().catch(err => {
  console.error('Failed to start postgres server:', err);
  process.exit(1);
});
