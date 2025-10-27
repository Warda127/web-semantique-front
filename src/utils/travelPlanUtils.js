// Utility helpers for travel plans

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

export function formatTime(time) {
  if (!time) return '';
  // time might be in format "08:00:00" or "08:00:00Z" or other xsd:time formats
  return time.replace(/Z$/, '');
}

export function formatBoolean(bool) {
  if (bool == null) return '';
  if (typeof bool === 'boolean') return bool ? 'Yes' : 'No';
  if (typeof bool === 'string') {
    const lower = bool.toLowerCase();
    if (lower === 'true' || lower === '1') return 'Yes';
    if (lower === 'false' || lower === '0') return 'No';
  }
  return String(bool);
}

// Simple filter: supports text matching across various fields
export function filterPlans(plans = [], query = '') {
  if (!query || !query.trim()) return plans;
  const qi = query.trim().toLowerCase();

  return plans.filter((p) => {
    const id = (p.id || '').toLowerCase();
    const typeName = (p.typeName || '').toLowerCase();
    const personName = (p.personName || '').toLowerCase();
    const startStationName = (p.startStationName || '').toLowerCase();
    const endStationName = (p.endStationName || '').toLowerCase();
    const transportModeName = (p.transportModeName || '').toLowerCase();
    const daysOfWeek = (p.daysOfWeek || '').toLowerCase();

    return (
      id.includes(qi) ||
      typeName.includes(qi) ||
      personName.includes(qi) ||
      startStationName.includes(qi) ||
      endStationName.includes(qi) ||
      transportModeName.includes(qi) ||
      daysOfWeek.includes(qi)
    );
  });
}
