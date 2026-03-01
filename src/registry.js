const REGISTRY_URL =
  'https://raw.githubusercontent.com/boxclawai/skills/main/registry.json';

let cache = null;

export async function fetchRegistry() {
  if (cache) return cache;

  const res = await fetch(REGISTRY_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch skill registry (HTTP ${res.status})`);
  }
  cache = await res.json();
  return cache;
}

export async function getSkillNames() {
  const registry = await fetchRegistry();
  return Object.keys(registry.skills);
}

export async function getSkillInfo(name) {
  const registry = await fetchRegistry();
  return registry.skills[name] || null;
}

export async function searchSkills(query) {
  const registry = await fetchRegistry();
  const q = query.toLowerCase();

  return Object.values(registry.skills).filter((skill) => {
    return (
      skill.name.toLowerCase().includes(q) ||
      skill.role.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

export function clearCache() {
  cache = null;
}
