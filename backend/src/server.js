const app = require('./app');
const env = require('./config/env');
const { checkInfrastructure, closeInfrastructure } = require('./infra');

let server;
async function start(){
  try {
    const infrastructure = await checkInfrastructure();
    if (env.infrastructureRequired && (!infrastructure.database || !infrastructure.cache || !infrastructure.storage)) {
      throw new Error(`Infrastructure not ready: ${JSON.stringify(infrastructure)}`);
    }
    server = app.listen(env.port, () => console.log(`✔ Codesazan API is running on port ${env.port} [${env.nodeEnv}]`));
    console.log('✔ Bootstrap gate passed; HTTP server started.');
    console.log('✔ Infrastructure:', infrastructure);
  } catch (error) {
    console.error('✖ Startup failed:', error);
    process.exit(1);
  }
}
start();

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (!server) { await closeInfrastructure(); process.exit(0); return; }
  server.close(async () => { await closeInfrastructure(); process.exit(0); });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
