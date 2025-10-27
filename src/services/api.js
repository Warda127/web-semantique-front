const API_BASE_URL = 'http://localhost:5000';

export const apiService = {
  // Récupérer toutes les personnes
  async getPersons() {
    const response = await fetch(`${API_BASE_URL}/api/persons`);
    return await response.json();
  },

  // Rechercher des personnes
  async searchPersons(query) {
    const response = await fetch(`${API_BASE_URL}/api/search/persons?q=${encodeURIComponent(query)}`);
    return await response.json();
  }
};

export const aiService = {
  async askQuestion(question) {
    const response = await fetch('http://localhost:5000/api/ai/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question })
    });
    return await response.json();
  }
};

// Expose base URL and a robust safeFetch helper for services to consume
export { API_BASE_URL };

export async function safeFetch(url, options = {}) {
  console.debug('[safeFetch] Request:', { url, options });
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    const e = new Error(`Invalid JSON response from ${url}`);
    e.status = res.status;
    e.rawText = text;
    e.url = url;
    console.error('[safeFetch] Invalid JSON:', { url, status: res.status, text });
    throw e;
  }
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText || `Request failed: ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.raw = data;
    error.url = url;
    console.error('[safeFetch] HTTP error:', { url, status: res.status, data });
    throw error;
  }
  console.debug('[safeFetch] Response:', { url, status: res.status, data });
  return data;
}