const { checkDatabase, closeDatabase } = require('./database');
const { checkCache, closeCache } = require('./cache');
const { checkStorage } = require('./storage');

async function checkInfrastructure() {
  const [database, cache, storage] = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkStorage(),
  ]);
  return { database, cache, storage };
}

async function closeInfrastructure() {
  await Promise.allSettled([closeDatabase(), closeCache()]);
}

module.exports = { checkInfrastructure, closeInfrastructure };
