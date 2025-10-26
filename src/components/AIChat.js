import React, { useState } from 'react';
import { aiService } from '../services/api';
import './css/AIChat.css';

const AIChat = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const result = await aiService.askQuestion(question);
      setResponse(result);
    } catch (error) {
      setResponse({ error: 'Erreur lors de la requête' });
    }

    setLoading(false);
  };

  return (
    <div className="ai-chat">
      <h2>🤖 Assistant IA Sémantique</h2>
      
      <div className="chat-container">
        <div className="input-section">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez votre question en français..."
            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
          />
          <button onClick={handleAskQuestion} disabled={loading}>
            {loading ? '⏳' : '🚀'} Demander
          </button>
        </div>

        {response && (
          <div className="response-section">
            {response.error ? (
              <div className="error">{response.error}</div>
            ) : (
              <>
                <div className="question">
                  <strong>Question:</strong> "{response.question}"
                </div>
                <div className="sparql-query">
                  <strong>Requête SPARQL générée:</strong>
                  <pre>{response.sparql_query}</pre>
                </div>
                <div className="results">
                  <strong>Résultats ({response.results.length}):</strong>
                  {response.results.length === 0 ? (
                    <div className="no-results">Aucun résultat trouvé</div>
                  ) : (
                    response.results.map((person, index) => (
                      <div key={index} className="person-card">
                        <h4>👤 {person.name}</h4>
                        <p><strong>Type:</strong> {person.type.split('#')[1] || person.type}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;