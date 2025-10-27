import { API_BASE_URL, safeFetch } from './api';
import {
  extractLocalName,
  extractTypeName,
  formatTime,
  formatBoolean,
} from '../utils/travelPlanUtils';

function transformPlan(raw) {
  if (!raw) return null;
  const uri = raw.uri || raw['@id'] || raw.id || null;
  const type = raw.type || raw['@type'] || raw.typeUri || null;
  const person = raw.person || null;
  const personName = raw.personName || null;
  const startStation = raw.startStation || null;
  const startStationName = raw.startStationName || null;
  const endStation = raw.endStation || null;
  const endStationName = raw.endStationName || null;
  const transportMode = raw.transportMode || null;
  const transportModeName = raw.transportModeName || null;
  const startTime = raw.startTime || null;
  const endTime = raw.endTime || null;
  const daysOfWeek = raw.daysOfWeek || null;
  const isActive = raw.isActive || null;

  const id = extractLocalName(uri) || raw.localName || null;
  const typeName = extractTypeName(type);

  return {
    uri,
    type,
    person,
    personName,
    startStation,
    startStationName,
    endStation,
    endStationName,
    transportMode,
    transportModeName,
    startTime: formatTime(startTime),
    endTime: formatTime(endTime),
    daysOfWeek,
    isActive: formatBoolean(isActive),
    isActiveRaw: isActive,
    id,
    typeName,
    // keep original raw for debug
    _raw: raw,
  };
}

function normalizePlansPayload(payload) {
  if (!payload) return [];
  // payload may be { plans: [...] } or [...] or { graph: [...] } or single object
  if (Array.isArray(payload)) return payload;
  if (payload.plans && Array.isArray(payload.plans)) return payload.plans;
  if (payload.graph && Array.isArray(payload.graph)) return payload.graph;
  // sometimes backend returns an object with items under result or data
  if (payload.result && Array.isArray(payload.result)) return payload.result;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  // fallback: if object looks like a single plan return [payload]
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
      attempts.push({
        url,
        error: {
          message: err.message,
          status: err.status,
          raw: err.raw || err.rawText || null,
        },
      });
      // continue to next url
    }
  }
  // none succeeded: return attempts (last attempt may have error)
  return { payload: null, attempts };
}

export const TravelPlanService = {
  async getAllPlans(debug = false) {
    // try both variants; if debug true append ?debug=1 to attempts
    const basePaths = [
      `${API_BASE_URL}/api/travel-plans`,
      `${API_BASE_URL}/api/travel-plans/`,
    ];
    // construct candidate urls; when debug flag not set we'll later retry with debug if empty
    const urls = basePaths.map((p) => p + (debug ? '?debug=1' : ''));
    console.debug(
      '[TravelPlanService] getAllPlans attempt urls:',
      urls,
      'debug=',
      debug
    );

    const firstTry = await tryUrls(urls);
    let payload = firstTry.payload;
    let attempts = firstTry.attempts || [];

    // if we got a payload but it contains empty plans, and debug was not requested, try again with debug to see server-side info
    const plansArray =
      payload?.plans ?? (Array.isArray(payload) ? payload : undefined);
    if (
      (!plansArray || (Array.isArray(plansArray) && plansArray.length === 0)) &&
      !debug
    ) {
      const debugUrls = basePaths.map((p) => p + '?debug=1');
      console.debug(
        '[TravelPlanService] getAllPlans empty result, retrying with debug urls:',
        debugUrls
      );
      const debugTry = await tryUrls(debugUrls);
      // merge attempts
      attempts = attempts.concat(debugTry.attempts || []);
      if (debugTry.payload) payload = debugTry.payload;
    }

    console.debug('[TravelPlanService] raw payloads attempts:', attempts);
    const rawPlans = normalizePlansPayload(payload);
    const plans = rawPlans.map(transformPlan);
    // return plans and a rich raw containing attempts for UI debug inspection
    return { plans, raw: { attempts, payload } };
  },

  async getPlanByLocalName(localName, debug = false) {
    if (!localName) throw new Error('localName required');
    const basePaths = [
      `${API_BASE_URL}/api/travel-plans/${encodeURIComponent(localName)}`,
      `${API_BASE_URL}/api/travel-plans/${encodeURIComponent(localName)}/`,
    ];
    const urls = basePaths.map((p) => p + (debug ? '?debug=1' : ''));
    console.debug('[TravelPlanService] getPlanByLocalName attempt urls:', urls);
    const firstTry = await tryUrls(urls);
    let payload = firstTry.payload;
    let attempts = firstTry.attempts || [];

    if ((!payload || Object.keys(payload).length === 0) && !debug) {
      const debugUrls = basePaths.map((p) => p + '?debug=1');
      console.debug(
        '[TravelPlanService] getPlanByLocalName empty result, retrying with debug urls:',
        debugUrls
      );
      const debugTry = await tryUrls(debugUrls);
      attempts = attempts.concat(debugTry.attempts || []);
      if (debugTry.payload) payload = debugTry.payload;
    }

    console.debug(
      '[TravelPlanService] getPlanByLocalName attempts:',
      attempts,
      'payload:',
      payload
    );
    const candidate = payload?.plan || payload;
    const plan = transformPlan(candidate);
    return { plan, raw: { attempts, payload } };
  },
};
