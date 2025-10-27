import { API_BASE_URL, safeFetch } from './api';
import { extractLocalName, extractTypeName, parseSpeed } from '../utils/transportUtils';

function transformMode(raw) {
  if (!raw) return null;
  const uri = raw.uri || raw['@id'] || raw.id || null;
  const type = raw.type || raw['@type'] || raw.typeUri || null;
  const name = raw.name ?? raw.label ?? null;
  const speedRaw = raw.speed ?? raw.speedValue ?? raw['http://example.org/speed'] ?? null;
  const id = extractLocalName(uri) || raw.localName || null;
  const typeName = extractTypeName(type);
  const speed = parseSpeed(speedRaw);
  return {
    uri,
    type,
    name,
    speedRaw,
    speed,
    id,
    typeName,
    // keep original raw for debug
    _raw: raw
  };
}

function normalizeModesPayload(payload) {
  if (!payload) return [];
  // payload may be { modes: [...] } or [...] or { graph: [...] } or single object
  if (Array.isArray(payload)) return payload;
  if (payload.modes && Array.isArray(payload.modes)) return payload.modes;
  if (payload.graph && Array.isArray(payload.graph)) return payload.graph;
  // sometimes backend returns an object with items under result or data
  if (payload.result && Array.isArray(payload.result)) return payload.result;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  // fallback: if object looks like a single mode return [payload]
  if (typeof payload === 'object') return [payload];
  return [];
}

// New helper: attempt multiple URL forms and collect debug info
async function tryUrls(urls) {
  const attempts = [];
  for (const url of urls) {
    try {
      const payload = await safeFetch(url);
      attempts.push({ url, payload });
      return { payload, attempts }; // return on first successful fetch
    } catch (err) {
      // collect error payload info (if any) and continue
      attempts.push({ url, error: { message: err.message, status: err.status, raw: err.raw || err.rawText || null } });
      // continue to next url
    }
  }
  // none succeeded: return attempts (last attempt may have error)
  return { payload: null, attempts };
}

export const TransportModeService = {
  async getAllModes(debug = false) {
    // try both variants; if debug true append ?debug=1 to attempts
    const basePaths = [
      `${API_BASE_URL}/api/transport-modes`,
      `${API_BASE_URL}/api/transport-modes/`
    ];
    // construct candidate urls; when debug flag not set we'll later retry with debug if empty
    const urls = basePaths.map(p => p + (debug ? '?debug=1' : ''));
    console.debug('[TransportModeService] getAllModes attempt urls:', urls, 'debug=', debug);

    const firstTry = await tryUrls(urls);
    let payload = firstTry.payload;
    let attempts = firstTry.attempts || [];

    // if we got a payload but it contains empty modes, and debug was not requested, try again with debug to see server-side info
    const modesArray = payload?.modes ?? (Array.isArray(payload) ? payload : undefined);
    if ((!modesArray || (Array.isArray(modesArray) && modesArray.length === 0)) && !debug) {
      const debugUrls = basePaths.map(p => p + '?debug=1');
      console.debug('[TransportModeService] getAllModes empty result, retrying with debug urls:', debugUrls);
      const debugTry = await tryUrls(debugUrls);
      // merge attempts
      attempts = attempts.concat(debugTry.attempts || []);
      if (debugTry.payload) payload = debugTry.payload;
    }

    console.debug('[TransportModeService] raw payloads attempts:', attempts);
    const rawModes = normalizeModesPayload(payload);
    const modes = rawModes.map(transformMode);
    // return modes and a rich raw containing attempts for UI debug inspection
    return { modes, raw: { attempts, payload } };
  },

  async getModeByLocalName(localName, debug = false) {
    if (!localName) throw new Error('localName required');
    const basePaths = [
      `${API_BASE_URL}/api/transport-modes/${encodeURIComponent(localName)}`,
      `${API_BASE_URL}/api/transport-modes/${encodeURIComponent(localName)}/`
    ];
    const urls = basePaths.map(p => p + (debug ? '?debug=1' : ''));
    console.debug('[TransportModeService] getModeByLocalName attempt urls:', urls);
    const firstTry = await tryUrls(urls);
    let payload = firstTry.payload;
    let attempts = firstTry.attempts || [];

    if ((!payload || Object.keys(payload).length === 0) && !debug) {
      const debugUrls = basePaths.map(p => p + '?debug=1');
      console.debug('[TransportModeService] getModeByLocalName empty result, retrying with debug urls:', debugUrls);
      const debugTry = await tryUrls(debugUrls);
      attempts = attempts.concat(debugTry.attempts || []);
      if (debugTry.payload) payload = debugTry.payload;
    }

    console.debug('[TransportModeService] getModeByLocalName attempts:', attempts, 'payload:', payload);
    const candidate = payload?.mode || payload;
    const mode = transformMode(candidate);
    return { mode, raw: { attempts, payload } };
  }
};
