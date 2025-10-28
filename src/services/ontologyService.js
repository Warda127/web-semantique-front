import { OntologyLoader } from './ontologyLoader';
import { SearchEngine } from './searchEngine';

/**
 * OntologyService - Main service for RDF data processing and search functionality
 */
class OntologyService {
  constructor() {
    this.loader = new OntologyLoader();
    this.searchEngine = new SearchEngine();
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  /**
   * Initialize the ontology service by loading and parsing RDF data
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  /**
   * Internal method to perform the actual initialization
   * @private
   */
  async _performInitialization() {
    try {
      console.log('Loading ontology data...');
      const { entities, relationships } = await this.loader.loadOntology();
      
      console.log(`Loaded ${entities.length} entities and ${relationships.length} relationships`);
      
      // Initialize search engine with loaded data
      this.searchEngine.initialize(entities);
      
      this.isInitialized = true;
      console.log('Ontology service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ontology service:', error);
      this.initializationPromise = null;
      throw error;
    }
  }

  /**
   * Search entities by keyword with optional type filtering
   * @param {string} query - Search query
   * @param {Array} entityTypes - Optional array of entity types to filter by
   * @returns {Promise<Array>} Array of matching entities
   */
  async search(query, entityTypes = []) {
    await this.initialize();
    return this.searchEngine.search(query, entityTypes);
  }

  /**
   * Get all entities with optional type filtering
   * @param {Array} entityTypes - Optional array of entity types to filter by
   * @returns {Promise<Array>} Array of entities
   */
  async getAllEntities(entityTypes = []) {
    await this.initialize();
    return this.searchEngine.getAllEntities(entityTypes);
  }

  /**
   * Get entities by specific type
   * @param {string} entityType - Type of entities to retrieve
   * @returns {Promise<Array>} Array of entities of the specified type
   */
  async getEntitiesByType(entityType) {
    await this.initialize();
    return this.searchEngine.getEntitiesByType(entityType);
  }

  /**
   * Get available entity types for filtering
   * @returns {Promise<Array>} Array of available entity types
   */
  async getAvailableTypes() {
    await this.initialize();
    return this.searchEngine.getAvailableTypes();
  }

  /**
   * Get entity by ID
   * @param {string} entityId - ID of the entity
   * @returns {Promise<Object|null>} Entity object or null if not found
   */
  async getEntityById(entityId) {
    await this.initialize();
    return this.searchEngine.getEntityById(entityId);
  }

  /**
   * Get related entities for a given entity
   * @param {string} entityId - ID of the entity
   * @param {number} maxResults - Maximum number of related entities to return
   * @returns {Promise<Array>} Array of related entities
   */
  async getRelatedEntities(entityId, maxResults = 10) {
    await this.initialize();
    return this.searchEngine.getRelatedEntities(entityId, maxResults);
  }

  /**
   * Get statistics about the ontology
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    await this.initialize();
    return this.searchEngine.getStatistics();
  }

  /**
   * Get all relationships
   * @returns {Promise<Array>} Array of relationships
   */
  async getRelationships() {
    await this.initialize();
    return this.loader.relationships;
  }

  /**
   * Check if service is initialized
   * @returns {boolean} True if initialized
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Reset the service (useful for testing)
   */
  reset() {
    this.isInitialized = false;
    this.initializationPromise = null;
    this.loader = new OntologyLoader();
    this.searchEngine = new SearchEngine();
  }
}

// Export singleton instance
export const ontologyService = new OntologyService();
export default ontologyService;