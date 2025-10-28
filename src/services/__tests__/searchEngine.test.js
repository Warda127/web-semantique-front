import { SearchEngine } from '../searchEngine';

describe('SearchEngine', () => {
  let searchEngine;
  let mockEntities;

  beforeEach(() => {
    searchEngine = new SearchEngine();
    
    // Mock entities data
    mockEntities = [
      {
        id: 'bus1',
        label: 'City Bus',
        type: 'TransportMode',
        subType: 'Instance',
        properties: { capacity: '50' },
        relationships: [
          { id: 'rel1', source: 'bus1', target: 'station1', type: 'connectsTo', label: 'connects to' }
        ]
      },
      {
        id: 'station1',
        label: 'Central Station',
        type: 'Station',
        subType: 'Instance',
        properties: { location: 'downtown' },
        relationships: [
          { id: 'rel1', source: 'bus1', target: 'station1', type: 'connectsTo', label: 'connects to' }
        ]
      },
      {
        id: 'citizen1',
        label: 'John Doe',
        type: 'Person',
        subType: 'Instance',
        properties: { age: '30' },
        relationships: []
      },
      {
        id: 'metro1',
        label: 'Metro Line A',
        type: 'TransportMode',
        subType: 'Instance',
        properties: { speed: 'fast' },
        relationships: []
      }
    ];

    searchEngine.initialize(mockEntities);
  });

  describe('initialize', () => {
    it('should initialize with entities data', () => {
      expect(searchEngine.entities).toEqual(mockEntities);
      expect(searchEngine.searchIndex.size).toBeGreaterThan(0);
      expect(searchEngine.typeFilters.size).toBeGreaterThan(0);
    });
  });

  describe('tokenize', () => {
    it('should tokenize text correctly', () => {
      const tokens = searchEngine.tokenize('City Bus Station');
      expect(tokens).toEqual(['city', 'bus', 'station']);
    });

    it('should handle special characters', () => {
      const tokens = searchEngine.tokenize('Metro-Line A (fast)');
      expect(tokens).toEqual(['metro', 'line', 'fast']);
    });

    it('should filter out single characters', () => {
      const tokens = searchEngine.tokenize('A B City');
      expect(tokens).toEqual(['city']);
    });

    it('should handle empty or null input', () => {
      expect(searchEngine.tokenize('')).toEqual([]);
      expect(searchEngine.tokenize(null)).toEqual([]);
      expect(searchEngine.tokenize(undefined)).toEqual([]);
    });
  });

  describe('search', () => {
    it('should return all entities for empty query', () => {
      const results = searchEngine.search('');
      expect(results.length).toBe(mockEntities.length);
    });

    it('should find exact matches', () => {
      const results = searchEngine.search('bus');
      expect(results.length).toBeGreaterThan(0);
      
      const busResult = results.find(r => r.id === 'bus1');
      expect(busResult).toBeDefined();
      expect(busResult.relevanceScore).toBeGreaterThan(0);
    });

    it('should find partial matches', () => {
      const results = searchEngine.search('cit');
      expect(results.length).toBeGreaterThan(0);
      
      // Should find both "City Bus" and "citizen1"
      const cityBus = results.find(r => r.id === 'bus1');
      const citizen = results.find(r => r.id === 'citizen1');
      expect(cityBus || citizen).toBeDefined();
    });

    it('should sort results by relevance score', () => {
      const results = searchEngine.search('city');
      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].relevanceScore).toBeGreaterThanOrEqual(results[i + 1].relevanceScore);
        }
      }
    });

    it('should filter by entity type', () => {
      const results = searchEngine.search('', ['TransportMode']);
      expect(results.length).toBe(2); // bus1 and metro1
      results.forEach(result => {
        expect(result.type).toBe('TransportMode');
      });
    });

    it('should combine search query with type filtering', () => {
      const results = searchEngine.search('bus', ['TransportMode']);
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('bus1');
    });

    it('should handle case-insensitive search', () => {
      const results = searchEngine.search('CITY');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getAllEntities', () => {
    it('should return all entities without filtering', () => {
      const results = searchEngine.getAllEntities();
      expect(results.length).toBe(mockEntities.length);
    });

    it('should filter by entity types', () => {
      const results = searchEngine.getAllEntities(['Person']);
      expect(results.length).toBe(1);
      expect(results[0].type).toBe('Person');
    });

    it('should sort results alphabetically', () => {
      const results = searchEngine.getAllEntities();
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].label.localeCompare(results[i + 1].label)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('getEntitiesByType', () => {
    it('should return entities of specific type', () => {
      const transportEntities = searchEngine.getEntitiesByType('TransportMode');
      expect(transportEntities.length).toBe(2);
      transportEntities.forEach(entity => {
        expect(entity.type).toBe('TransportMode');
      });
    });

    it('should return empty array for non-existent type', () => {
      const results = searchEngine.getEntitiesByType('NonExistentType');
      expect(results).toEqual([]);
    });
  });

  describe('getAvailableTypes', () => {
    it('should return sorted array of available types', () => {
      const types = searchEngine.getAvailableTypes();
      expect(types).toEqual(['Person', 'Station', 'TransportMode']);
    });
  });

  describe('getEntityById', () => {
    it('should return entity by ID', () => {
      const entity = searchEngine.getEntityById('bus1');
      expect(entity).toBeDefined();
      expect(entity.id).toBe('bus1');
      expect(entity.label).toBe('City Bus');
    });

    it('should return null for non-existent ID', () => {
      const entity = searchEngine.getEntityById('nonexistent');
      expect(entity).toBeNull();
    });
  });

  describe('getRelatedEntities', () => {
    it('should return related entities', () => {
      const relatedEntities = searchEngine.getRelatedEntities('bus1');
      expect(relatedEntities.length).toBe(1);
      expect(relatedEntities[0].id).toBe('station1');
    });

    it('should return empty array for entity with no relationships', () => {
      const relatedEntities = searchEngine.getRelatedEntities('citizen1');
      expect(relatedEntities).toEqual([]);
    });

    it('should return empty array for non-existent entity', () => {
      const relatedEntities = searchEngine.getRelatedEntities('nonexistent');
      expect(relatedEntities).toEqual([]);
    });

    it('should respect maxResults parameter', () => {
      const relatedEntities = searchEngine.getRelatedEntities('bus1', 1);
      expect(relatedEntities.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics', () => {
      const stats = searchEngine.getStatistics();
      
      expect(stats.totalEntities).toBe(4);
      expect(stats.entityTypes).toEqual(['Person', 'Station', 'TransportMode']);
      expect(stats.typeDistribution).toEqual({
        'TransportMode': 2,
        'Station': 1,
        'Person': 1
      });
      expect(typeof stats.totalRelationships).toBe('number');
    });
  });

  describe('buildSearchIndex', () => {
    it('should build search index with entity data', () => {
      expect(searchEngine.searchIndex.size).toBeGreaterThan(0);
      
      // Check if 'city' token is indexed
      expect(searchEngine.searchIndex.has('city')).toBe(true);
      
      // Check if entity index is stored correctly
      const cityIndices = searchEngine.searchIndex.get('city');
      expect(cityIndices.size).toBeGreaterThan(0);
    });

    it('should index entity labels, types, and properties', () => {
      // Should index label tokens
      expect(searchEngine.searchIndex.has('city')).toBe(true);
      expect(searchEngine.searchIndex.has('bus')).toBe(true);
      
      // Should index type tokens
      expect(searchEngine.searchIndex.has('transportmode')).toBe(true);
      expect(searchEngine.searchIndex.has('station')).toBe(true);
      
      // Should index property values
      expect(searchEngine.searchIndex.has('downtown')).toBe(true);
    });
  });
});