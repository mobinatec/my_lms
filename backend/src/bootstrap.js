const { migrate } = require('./db');
const { seedLegacyContent } = require('./db/contentStore');
const { migrateLegacyData } = require('./db/legacyData');
const auth = require('./modules/auth/auth.service');
const { checkInfrastructure } = require('./infra');
const { getPool } = require('./infra/database');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForDatabase() {
  const pool = getPool();
  await pool.query('SELECT 1');
}

async function bootstrap() {
  const attempts = Number(process.env.BOOTSTRAP_RETRIES || 90);
  const delayMs = Number(process.env.BOOTSTRAP_DELAY_MS || 5000);
  let lastError;

  for (let i = 1; i <= attempts; i++) {
    try {
      console.log(`▶ Bootstrap attempt ${i}/${attempts}`);
      await waitForDatabase();
      await migrate();
      await auth.seed();
      await seedLegacyContent();
      await migrateLegacyData();
      const infrastructure = await checkInfrastructure();
      if (!infrastructure.database || !infrastructure.cache || !infrastructure.storage) {
        throw new Error(`Infrastructure not ready: ${JSON.stringify(infrastructure)}`);
      }
      console.log('✔ Bootstrap complete: database, migrations, seed and legacy migration finished.');
      return;
    } catch (error) {
      lastError = error;
      console.error(`✖ Bootstrap attempt ${i} failed:`, error.message);
      if (i < attempts) await sleep(delayMs);
    }
  }

  throw lastError || new Error('Bootstrap failed');
}

bootstrap().then(() => process.exit(0)).catch(error => {
  console.error('✖ Bootstrap failed permanently:', error);
  process.exit(1);
});
