import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './css/PersonSearch.css';

const PersonSearch = () => {
  const [persons, setPersons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger toutes les personnes au démarrage
  useEffect(() => {
    loadAllPersons();
  }, []);

  const loadAllPersons = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getPersons();
      setPersons(data);
    } catch (err) {
      setError('Erreur lors du chargement des personnes');
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadAllPersons();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await apiService.searchPersons(searchTerm);
      setPersons(data);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    }
    setLoading(false);
  };

  const getTypeDisplay = (typeUri) => {
    const parts = typeUri.split('#');
    return parts.length > 1 ? parts[1] : typeUri;
  };

  return (
    <div className="person-search">
      <h1>🔍 Recherche Sémantique - Personnes</h1>
      
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une personne par nom..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? '⏳' : '🔍'} Rechercher
        </button>
        <button onClick={loadAllPersons} disabled={loading}>
          👥 Toutes les personnes
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : persons.length === 0 ? (
          <div className="no-results">Aucune personne trouvée</div>
        ) : (
          persons.map((person, index) => (
            <div key={index} className="person-card">
              <h3>👤 {person.name}</h3>
              <p><strong>Type:</strong> {getTypeDisplay(person.type)}</p>
              <p><strong>URI:</strong> <small>{person.uri}</small></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PersonSearch;