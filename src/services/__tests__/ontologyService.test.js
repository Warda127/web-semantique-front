import ontologyService from '../ontologyService';

// Mock the OntologyLoader and SearchEngine
jest.mock('../ontologyLoader');
jest.mock('../searchEngine');

describe('OntologyService', () => {
  beforeEach(() => {
    ontologyService.reset();
  });

  describe('initialization', () => {
    it('should initialize only once', async () => {
      const mockEntities = [
        { id: 'test1', label: 'Test Entity', type: 'Test', relationships: [] }
      ];
      
      // Mock the loader
      ontologyService.loader.loadOntology = jest.fn().mockResolvedValue({
        entities: mockEntities,
        relationships: []
      });
      
      ontologyService.searchEngine.initialize = jest.fn();

      // First initialization
      await ontologyService.initialize();
      expect(ontologyService.loader.loadOntology).toHaveBeenCalledTimes(1);
      
      // Second initialization should not call loader again
      await ontologyService.initialize();
      expect(ontologyService.loader.loadOntology).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization errors', async () => {
      ontologyService.loader.loadOntology = jest.fn().mockRejectedValue(new Error('Load failed'));

      await expect(ontologyService.initialize()).rejects.toThrow('Load failed');
      expect(ontologyService.isReady()).toBe(false);
    });
  });

  describe('search methods', () => {
    beforeEach(async () => {
      ontologyService.loader.loadOntology = jest.fn().mockResolvedValue({
        entities: [],
        relationships: []
      });
      ontologyService.searchEngine.initialize = jest.fn();
      await ontologyService.initialize();
    });

    it('should call search engine search method', async () => {
      const mockResults = [{ id: 'test1', label: 'Test' }];
      ontologyService.searchEngine.search = jest.fn().mockReturnValue(mockResults);

      const results = await ontologyService.search('test', ['TestType']);
      
      expect(ontologyService.searchEngine.search).toHaveBeenCalledWith('test', ['TestType']);
      expect(results).toEqual(mockResults);
    });
  });
});