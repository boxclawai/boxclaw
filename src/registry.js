const BASE_URL =
  'https://raw.githubusercontent.com/boxclawai/skills/main';

const REGISTRY_URLS = {
  skill: `${BASE_URL}/registry.json`,
  mcp: `${BASE_URL}/mcp-registry.json`,
  rag: `${BASE_URL}/rag-registry.json`,
};

const cache = {};

export async function fetchRegistry(type = 'skill') {
  if (cache[type]) return cache[type];

  const url = REGISTRY_URLS[type];
  if (!url) throw new Error(`Unknown type: ${type}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${type} registry (HTTP ${res.status})`);
  }
  cache[type] = await res.json();
  return cache[type];
}

function getCollection(registry) {
  return registry.skills || registry.servers || registry.templates || {};
}

export async function getItemNames(type = 'skill') {
  const registry = await fetchRegistry(type);
  return Object.keys(getCollection(registry));
}

export async function getItemInfo(type, name) {
  const registry = await fetchRegistry(type);
  return getCollection(registry)[name] || null;
}

export async function searchItems(type, query) {
  const registry = await fetchRegistry(type);
  const collection = getCollection(registry);
  const q = query.toLowerCase();

  return Object.values(collection).filter((item) => {
    return (
      (item.name || '').toLowerCase().includes(q) ||
      (item.role || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });
}

export async function searchAll(query) {
  const results = {};
  for (const type of ['skill', 'mcp', 'rag']) {
    try {
      results[type] = await searchItems(type, query);
    } catch {
      results[type] = [];
    }
  }
  return results;
}

export function clearCache() {
  for (const key of Object.keys(cache)) delete cache[key];
}
