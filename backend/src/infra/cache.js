const { createClient } = require('redis');

let client = null;

function getCache() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on('error', (err) => console.error('Redis error:', err.message));
  }
  return client;
}

async function connectCache() {
  const c = getCache();
  if (!c.isOpen) await c.connect();
  return c;
}

async function checkCache() {
  const c = await connectCache();
  return (await c.ping()) === 'PONG';
}

async function closeCache() {
  if (client?.isOpen) await client.quit();
  client = null;
}

module.exports = { getCache, connectCache, checkCache, closeCache };
