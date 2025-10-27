import React, { useState, useEffect } from 'react';
import * as apiModule from '../services/api';
const { stationService } = apiModule;

const StationSearch = () => {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load all stations on mount
  useEffect(() => {
    loadAllStations();
  }, []);

  const loadAllStations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await stationService.getStations();
      setStations(data);
    } catch (err) {
      setError('Erreur lors du chargement des stations');
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadAllStations();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await stationService.searchStations(searchTerm);
      setStations(data);
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
    <div className="station-search">
      <h1>🚉 Recherche Sémantique - Stations</h1>
      
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une station par nom..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? '⏳' : '🔍'} Rechercher
        </button>
        <button onClick={loadAllStations} disabled={loading}>
          🚉 Toutes les stations
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : stations.length === 0 ? (
          <div className="no-results">Aucune station trouvée</div>
        ) : (
          stations.map((station, index) => (
            <div key={index} className="station-card">
              <h3>🚉 {station.name}</h3>
              <p><strong>Type:</strong> {getTypeDisplay(station.type)}</p>
              <p><strong>Location:</strong> {station.location || 'N/A'}</p>
              <p><strong>Capacity:</strong> {station.capacity || 'N/A'}</p>
              <p><strong>URI:</strong> <small>{station.uri}</small></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StationSearch;
