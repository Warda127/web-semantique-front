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