import { OntologyLoader } from '../ontologyLoader';

// Mock fetch for testing
global.fetch = jest.fn();

describe('OntologyLoader', () => {
  let loader;
  
  beforeEach(() => {
    loader = new OntologyLoader();
    fetch.mockClear();
  });

  const mockRdfContent = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
         xmlns:owl="http://www.w3.org/2002/07/owl#"
         xmlns:transport="http://example.org/transport#">

  <owl:Class rdf:about="http://example.org/transport#TransportMode">
    <rdfs:label>Transport Mode</rdfs:label>
  </owl:Class>

  <owl:Class rdf:about="http://example.org/transport#Bus">
    <rdfs:subClassOf rdf:resource="http://example.org/transport#TransportMode"/>
    <rdfs:label>Bus</rdfs:label>
  </owl:Class>

  <transport:Bus rdf:about="http://example.org/transport#bus1">
    <rdfs:label>City Bus</rdfs:label>
  </transport:Bus>

</rdf:RDF>`;

  describe('loadOntology', () => {
    it('should successfully load and parse RDF file', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockRdfContent)
      });

      const result = await loader.loadOntology();

      expect(fetch).toHaveBeenCalledWith('/WebSemEsprit-1.rdf');
      expect(result).toHaveProperty('entities');
      expect(result).toHaveProperty('relationships');
      expect(Array.isArray(result.entities)).toBe(true);
      expect(Array.isArray(result.relationships)).toBe(true);
    });

    it('should throw error when RDF file fails to load', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(loader.loadOntology()).rejects.toThrow('Failed to load RDF file: Not Found');
    });

    it('should throw error when fetch fails', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(loader.loadOntology()).rejects.toThrow('Network error');
    });
  });

  describe('getLocalName', () => {
    it('should extract local name from URI with hash', () => {
      const uri = 'http://example.org/transport#Bus';
      const localName = loader.getLocalName(uri);
      expect(localName).toBe('Bus');
    });

    it('should extract local name from URI with slash', () => {
      const uri = 'http://example.org/transport/Bus';
      const localName = loader.getLocalName(uri);
      expect(localName).toBe('Bus');
    });

    it('should handle empty or null URI', () => {
      expect(loader.getLocalName('')).toBe('');
      expect(loader.getLocalName(null)).toBe('');
      expect(loader.getLocalName(undefined)).toBe('');
    });
  });

  describe('getEntityType', () => {
    it('should correctly identify Person types', () => {
      expect(loader.getEntityType('http://example.org/transport#Person')).toBe('Person');
      expect(loader.getEntityType('http://example.org/transport#Citizen')).toBe('Person');
      expect(loader.getEntityType('http://example.org/transport#Staff')).toBe('Person');
      expect(loader.getEntityType('http://example.org/transport#Tourist')).toBe('Person');
    });

    it('should correctly identify Station types', () => {
      expect(loader.getEntityType('http://example.org/transport#Station')).toBe('Station');
      expect(loader.getEntityType('http://example.org/transport#BikeStation')).toBe('Station');
      expect(loader.getEntityType('http://example.org/transport#BusStation')).toBe('Station');
      expect(loader.getEntityType('http://example.org/transport#MetroStation')).toBe('Station');
    });

    it('should correctly identify TransportMode types', () => {
      expect(loader.getEntityType('http://example.org/transport#TransportMode')).toBe('TransportMode');
      expect(loader.getEntityType('http://example.org/transport#Bike')).toBe('TransportMode');
      expect(loader.getEntityType('http://example.org/transport#Bus')).toBe('TransportMode');
      expect(loader.getEntityType('http://example.org/transport#Metro')).toBe('TransportMode');
    });

    it('should correctly identify other types', () => {
      expect(loader.getEntityType('http://example.org/transport#Trip')).toBe('Trip');
      expect(loader.getEntityType('http://example.org/transport#Route')).toBe('Route');
      expect(loader.getEntityType('http://example.org/transport#Schedule')).toBe('Schedule');
    });

    it('should return Unknown for unrecognized types', () => {
      expect(loader.getEntityType('http://example.org/transport#UnknownType')).toBe('Unknown');
      expect(loader.getEntityType('')).toBe('Unknown');
      expect(loader.getEntityType(null)).toBe('Unknown');
    });
  });

  describe('entity extraction', () => {
    beforeEach(async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockRdfContent)
      });
      await loader.loadOntology();
    });

    it('should extract classes as entities', () => {
      const classEntities = loader.entities.filter(e => e.subType === 'Class');
      expect(classEntities.length).toBeGreaterThan(0);
      
      const transportModeEntity = classEntities.find(e => e.id === 'TransportMode');
      expect(transportModeEntity).toBeDefined();
      expect(transportModeEntity.label).toBe('Transport Mode');
      expect(transportModeEntity.type).toBe('TransportMode');
    });

    it('should extract instances as entities', () => {
      const instanceEntities = loader.entities.filter(e => e.subType === 'Instance');
      expect(instanceEntities.length).toBeGreaterThan(0);
      
      const busEntity = instanceEntities.find(e => e.id === 'bus1');
      expect(busEntity).toBeDefined();
      expect(busEntity.label).toBe('City Bus');
      expect(busEntity.type).toBe('TransportMode');
    });

    it('should build subclass relationships', () => {
      const subclassRels = loader.relationships.filter(r => r.type === 'subClassOf');
      expect(subclassRels.length).toBeGreaterThan(0);
      
      const busSubclassRel = subclassRels.find(r => r.source === 'Bus' && r.target === 'TransportMode');
      expect(busSubclassRel).toBeDefined();
      expect(busSubclassRel.label).toBe('is subclass of');
    });
  });

  describe('getEntitiesByType', () => {
    beforeEach(async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockRdfContent)
      });
      await loader.loadOntology();
    });

    it('should filter entities by type', () => {
      const transportEntities = loader.getEntitiesByType('TransportMode');
      expect(Array.isArray(transportEntities)).toBe(true);
      transportEntities.forEach(entity => {
        expect(entity.type).toBe('TransportMode');
      });
    });

    it('should return empty array for non-existent type', () => {
      const nonExistentEntities = loader.getEntitiesByType('NonExistentType');
      expect(nonExistentEntities).toEqual([]);
    });
  });

  describe('getEntityTypes', () => {
    beforeEach(async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockRdfContent)
      });
      await loader.loadOntology();
    });

    it('should return array of unique entity types', () => {
      const types = loader.getEntityTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
      
      // Check for uniqueness
      const uniqueTypes = [...new Set(types)];
      expect(types.length).toBe(uniqueTypes.length);
    });
  });
});