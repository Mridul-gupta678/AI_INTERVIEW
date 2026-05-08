const { OpenAI } = require('openai');
const Redis = require('ioredis');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)="?(.*)"?$/);
  if (match) acc[match[1]] = match[2].replace(/"/g, '');
  return acc;
}, {});

async function test() {
  console.log('Testing OpenAI with key:', env.OPENAI_API_KEY.substring(0, 10) + '...');
  try {
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const res = await openai.models.list();
    console.log('OpenAI connection SUCCESS. Models count:', res.data.length);
  } catch (e) {
    console.log('OpenAI connection FAILED:', e.message);
  }

  console.log('Testing Redis with url:', env.REDIS_URL.substring(0, 15) + '...');
  try {
    const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 1 });
    await redis.ping();
    console.log('Redis connection SUCCESS');
    redis.quit();
  } catch (e) {
    console.log('Redis connection FAILED:', e.message);
  }
}

test();
