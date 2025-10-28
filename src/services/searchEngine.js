/**
 * SearchEngine class for building search index and handling queries
 */
export class SearchEngine {
  constructor() {
    this.entities = [];
    this.searchIndex = new Map();
    this.typeFilters = new Set();
  }

  /**
   * Initialize search engine with entities data
   * @param {Array} entities - Array of entities from ontology
   */
  initialize(entities) {
    this.entities = entities;
    this.buildSearchIndex();
    this.buildTypeFilters();
  }

  /**
   * Build inverted index for fast text search
   */
  buildSearchIndex() {
    this.searchIndex.clear();
    
    this.entities.forEach((entity, entityIndex) => {
      // Index entity label
      this.indexText(entity.label, entityIndex);
      
      // Index entity type
      this.indexText(entity.type, entityIndex);
      
      // Index entity subType
      if (entity.subType) {
        this.indexText(entity.subType, entityIndex);
      }
      
      // Index properties
      Object.keys(entity.properties).forEach(propKey => {
        this.indexText(propKey, entityIndex);
        const propValue = entity.properties[propKey];
        if (typeof propValue === 'string') {
          this.indexText(propValue, entityIndex);
        }
      });
      
      // Index relationship labels
      entity.relationships.forEach(rel => {
        this.indexText(rel.label, entityIndex);
        this.indexText(rel.type, entityIndex);
      });
    });
  }

  /**
   * Index text tokens for an entity
   * @param {string} text - Text to index
   * @param {number} entityIndex - Index of entity in entities array
   */
  indexText(text, entityIndex) {
    if (!text || typeof text !== 'string') return;
    
    // Normalize and tokenize text
    const tokens = this.tokenize(text);
    
    tokens.forEach(token => {
      if (!this.searchIndex.has(token)) {
        this.searchIndex.set(token, new Set());
      }
      this.searchIndex.get(token).add(entityIndex);
    });
  }

  /**
   * Tokenize text into searchable terms
   * @param {string} text - Text to tokenize
   * @returns {Array} Array of tokens
   */
  tokenize(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace non-word characters with spaces
      .split(/\s+/)
      .filter(token => token.length > 1) // Filter out single characters
      .map(token => token.trim())
      .filter(token => token.length > 0);
  }

  /**
   * Build available type filters
   */
  buildTypeFilters() {
    this.typeFilters.clear();
    this.entities.forEach(entity => {
      this.typeFilters.add(entity.type);
    });
  }

  /**
   * Search entities by keyword with optional type filtering
   * @param {string} query - Search query
   * @param {Array} entityTypes - Optional array of entity types to filter by
   * @returns {Array} Array of matching entities with relevance scores
   */
  search(query, entityTypes = []) {
    if (!query || query.trim().length === 0) {
      return this.getAllEntities(entityTypes);
    }

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return this.getAllEntities(entityTypes);
    }

    // Find entities matching query tokens
    const entityScores = new Map();
    
    queryTokens.forEach(token => {
      // Exact matches
      if (this.searchIndex.has(token)) {
        this.searchIndex.get(token).forEach(entityIndex => {
          const currentScore = entityScores.get(entityIndex) || 0;
          entityScores.set(entityIndex, currentScore + 2); // Higher score for exact matches
        });
      }
      
      // Partial matches (contains)
      this.searchIndex.forEach((entityIndices, indexedToken) => {
        if (indexedToken.includes(token) && indexedToken !== token) {
          entityIndices.forEach(entityIndex => {
            const currentScore = entityScores.get(entityIndex) || 0;
            entityScores.set(entityIndex, currentScore + 1); // Lower score for partial matches
          });
        }
      });
    });

    // Convert to results array with scores
    let results = Array.from(entityScores.entries()).map(([entityIndex, score]) => ({
      ...this.entities[entityIndex],
      relevanceScore: score
    }));

    // Apply type filtering
    if (entityTypes.length > 0) {
      results = results.filter(entity => entityTypes.includes(entity.type));
    }

    // Sort by relevance score (descending)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  }

  /**
   * Get all entities with optional type filtering
   * @param {Array} entityTypes - Optional array of entity types to filter by
   * @returns {Array} Array of entities
   */
  getAllEntities(entityTypes = []) {
    let results = [...this.entities];
    
    if (entityTypes.length > 0) {
      results = results.filter(entity => entityTypes.includes(entity.type));
    }
    
    // Sort alphabetically by label
    results.sort((a, b) => a.label.localeCompare(b.label));
    
    return results;
  }

  /**
   * Get entities by specific type
   * @param {string} entityType - Type of entities to retrieve
   * @returns {Array} Array of entities of the specified type
   */
  getEntitiesByType(entityType) {
    return this.entities.filter(entity => entity.type === entityType);
  }

  /**
   * Get available entity types for filtering
   * @returns {Array} Array of available entity types
   */
  getAvailableTypes() {
    return Array.from(this.typeFilters).sort();
  }

  /**
   * Get entity by ID
   * @param {string} entityId - ID of the entity
   * @returns {Object|null} Entity object or null if not found
   */
  getEntityById(entityId) {
    return this.entities.find(entity => entity.id === entityId) || null;
  }

  /**
   * Get related entities for a given entity
   * @param {string} entityId - ID of the entity
   * @param {number} maxResults - Maximum number of related entities to return
   * @returns {Array} Array of related entities
   */
  getRelatedEntities(entityId, maxResults = 10) {
    const entity = this.getEntityById(entityId);
    if (!entity) return [];

    const relatedEntityIds = new Set();
    
    // Add entities from relationships
    entity.relationships.forEach(rel => {
      if (rel.source === entityId) {
        relatedEntityIds.add(rel.target);
      } else if (rel.target === entityId) {
        relatedEntityIds.add(rel.source);
      }
    });

    // Convert to entity objects
    const relatedEntities = Array.from(relatedEntityIds)
      .map(id => this.getEntityById(id))
      .filter(entity => entity !== null)
      .slice(0, maxResults);

    return relatedEntities;
  }

  /**
   * Get statistics about the ontology
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const typeCount = {};
    this.entities.forEach(entity => {
      typeCount[entity.type] = (typeCount[entity.type] || 0) + 1;
    });

    return {
      totalEntities: this.entities.length,
      totalRelationships: this.entities.reduce((sum, entity) => sum + entity.relationships.length, 0) / 2, // Divide by 2 to avoid double counting
      entityTypes: this.getAvailableTypes(),
      typeDistribution: typeCount
    };
  }
}