import React from 'react';
import './css/Sidebar.css';

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <div className="sidebar">
      <h2>🔍 SmartCity</h2>
      <ul>
        <li
          className={activeTab === 'persons' ? 'active' : ''}
          onClick={() => onTabChange('persons')}
        >
          👥 Personnes
        </li>
        <li
          className={activeTab === 'ai' ? 'active' : ''} // ← AJOUTER CET ONGLET
          onClick={() => onTabChange('ai')}
        >
          🤖 Assistant IA
        </li>
        <li
          className={activeTab === 'stations' ? 'active' : ''}
          onClick={() => onTabChange('stations')}
        >
          🚉 Stations
        </li>
        <li
          className={activeTab === 'transports' ? 'active' : ''}
          onClick={() => onTabChange('transports')}
        >
          🚌 Transports
        </li>
        <li
          className={activeTab === 'travelplans' ? 'active' : ''}
          onClick={() => onTabChange('travelplans')}
        >
          🗺️ Travel Plans
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
