#!/usr/bin/env node
/**
 * send-discord.js
 *
 * Wysyła payload (JSON z listą newsów) jako Discord embeds.
 *
 * Użycie:
 *   node send-discord.js payload.json
 *
 * Wymaga env: DISCORD_WEBHOOK_URL
 */

const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(__dirname, '.env'));

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const MAX_EMBEDS_PER_MESSAGE = 10; // limit Discorda
const MAX_DESCRIPTION_LENGTH = 4096;
const MAX_TITLE_LENGTH = 256;

const CATEGORY_COLORS = {
  polityka:   0xE74C3C, // czerwony
  korporacja: 0x9B59B6, // fioletowy
  urzędy:     0xF39C12, // pomarańczowy
  media:      0x3498DB, // niebieski
  inne:       0x95A5A6, // szary
};

const CATEGORY_EMOJI = {
  polityka:   '🏛️',
  korporacja: '🏢',
  urzędy:     '📋',
  media:      '📰',
  inne:       '🤔',
};

function fail(msg, code = 1) {
  console.error(`❌ ${msg}`);
  process.exit(code);
}

function truncate(str, max) {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max - 1) + '…';
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    fail('Payload nie jest obiektem JSON.');
  }
  if (!Array.isArray(payload.items)) {
    fail('Payload.items musi być tablicą (może być pusta).');
  }
  for (const [i, item] of payload.items.entries()) {
    const required = ['title', 'summary', 'angle', 'category', 'url', 'source'];
    for (const field of required) {
      if (!item[field] || typeof item[field] !== 'string') {
        fail(`items[${i}].${field} jest wymagane i musi być stringiem.`);
      }
    }
    if (!CATEGORY_COLORS[item.category]) {
      fail(`items[${i}].category="${item.category}" — dozwolone: ${Object.keys(CATEGORY_COLORS).join(', ')}`);
    }
    try {
      new URL(item.url);
    } catch {
      fail(`items[${i}].url nie jest poprawnym URL: ${item.url}`);
    }
  }
}

function buildEmbed(item) {
  const emoji = CATEGORY_EMOJI[item.category] || '';
  return {
    title: truncate(`${emoji} ${item.title}`, MAX_TITLE_LENGTH),
    url: item.url,
    description: truncate(
      `${item.summary}\n\n**🎙️ Kąt:** ${item.angle}`,
      MAX_DESCRIPTION_LENGTH
    ),
    color: CATEGORY_COLORS[item.category],
    footer: { text: item.source },
    timestamp: new Date().toISOString(),
  };
}

async function postWebhook(body) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    fail(`Discord zwrócił ${res.status}: ${text}`);
  }
}

async function main() {
  if (!WEBHOOK_URL) {
    fail('Brak env DISCORD_WEBHOOK_URL.');
  }

  const inputPath = process.argv[2];
  if (!inputPath) {
    fail('Użycie: node send-discord.js <payload.json>');
  }

  const absPath = path.resolve(inputPath);
  if (!fs.existsSync(absPath)) {
    fail(`Plik nie istnieje: ${absPath}`);
  }

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  } catch (e) {
    fail(`Nieprawidłowy JSON: ${e.message}`);
  }

  validatePayload(payload);

  const dateLabel = payload.date || new Date().toISOString().slice(0, 10);

  // Pusty dzień — krótka notka, bez embedów
  if (payload.items.length === 0) {
    await postWebhook({
      content: `📭 **${dateLabel}** — dziś nic ciekawego do podcastu. Spokojny dzień w internecie (lub Claude się nie postarał).`,
    });
    console.log('✅ Wysłano komunikat o pustym dniu.');
    return;
  }

  // Header
  await postWebhook({
    content: `🔥 **Rage feed — ${dateLabel}** • ${payload.items.length} ${payload.items.length === 1 ? 'temat' : 'tematów'} na dziś`,
  });

  // Embeds w paczkach po 10
  for (let i = 0; i < payload.items.length; i += MAX_EMBEDS_PER_MESSAGE) {
    const chunk = payload.items.slice(i, i + MAX_EMBEDS_PER_MESSAGE);
    await postWebhook({ embeds: chunk.map(buildEmbed) });
  }

  console.log(`✅ Wysłano ${payload.items.length} ${payload.items.length === 1 ? 'embed' : 'embedów'} na Discord.`);
}

main().catch((e) => fail(`Nieoczekiwany błąd: ${e.message}`));
