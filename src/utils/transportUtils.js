// Utility helpers for transport modes

export function extractLocalName(uri) {
  if (!uri) return null;
  const parts = uri.split(/[#/]/);
  return parts.pop() || null;
}

export function extractTypeName(typeUri) {
  if (!typeUri) return null;
  const parts = typeUri.split(/[#/]/);
  return parts.pop() || null;
}

export function parseSpeed(speed) {
  if (speed == null) return null;
  const n = Number(speed);
  return Number.isFinite(n) ? n : null;
}

export function formatSpeed(num) {
  if (num == null) return '';
  return Number.isFinite(num) ? String(num) : '';
}

// Simple filter: supports text matching across id/type/name/speed and numeric comparisons like "> 10"
export function filterModes(modes = [], query = '') {
  if (!query || !query.trim()) return modes;
  const q = query.trim();
  const cmpMatch = q.match(/^([<>]=?)\s*([+-]?\d+(\.\d+)?)$/);
  if (cmpMatch) {
    const op = cmpMatch[1];
    const num = Number(cmpMatch[2]);
    return modes.filter(m => {
      const s = parseSpeed(m.speedRaw ?? m.speed);
      if (s == null) return false;
      if (op === '>') return s > num;
      if (op === '>=') return s >= num;
      if (op === '<') return s < num;
      if (op === '<=') return s <= num;
      return false;
    });
  }

  const qi = q.toLowerCase();
  return modes.filter(m => {
    const id = (m.id || '').toLowerCase();
    const type = (m.typeName || '').toLowerCase();
    const speed = (m.speed != null ? String(m.speed) : '').toLowerCase();
    const name = (m.name || '').toLowerCase();
    return id.includes(qi) || type.includes(qi) || speed.includes(qi) || name.includes(qi);
  });
}
