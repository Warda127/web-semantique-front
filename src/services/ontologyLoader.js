import * as rdfParser from 'rdf-parse';

/**
 * OntologyLoader class for parsing WebSemEsprit-1.rdf file and extracting entities
 */
export class OntologyLoader {
  constructor() {
    this.entities = [];
    this.relationships = [];
    this.classes = new Map();
    this.properties = new Map();
    this.instances = new Map();
  }

  /**
   * Load and parse the RDF file from the public directory
   * @returns {Promise<{entities: Array, relationships: Array}>}
   */
  async loadOntology() {
    try {
      const response = await fetch('/WebSemEsprit-1.rdf');
      if (!response.ok) {
        throw new Error(`Failed to load RDF file: ${response.statusText}`);
      }
      
      const rdfContent = await response.text();
      await this.parseRDF(rdfContent);
      
      return {
        entities: this.entities,
        relationships: this.relationships
      };
    } catch (error) {
      console.error('Error loading ontology:', error);
      throw error;
    }
  }

  /**
   * Parse RDF content and extract entities and relationships
   * @param {string} rdfContent - The RDF/XML content
   */
  async parseRDF(rdfContent) {
    try {
      const quadStream = rdfParser.parse(rdfContent, { contentType: 'application/rdf+xml' });
      
      const quads = [];
      
      return new Promise((resolve, reject) => {
        quadStream.on('data', (quad) => {
          quads.push(quad);
        });
        
        quadStream.on('end', () => {
          try {
            this.processQuads(quads);
            this.buildEntities();
            this.buildRelationships();
            resolve();
          } catch (error) {
            reject(error);
          }
        });
        
        quadStream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      // Fallback for testing - simple RDF parsing
      this.parseRDFSimple(rdfContent);
    }
  }

  /**
   * Simple RDF parser for testing purposes
   * @param {string} rdfContent - The RDF/XML content
   */
  parseRDFSimple(rdfContent) {
    // Simple regex-based parsing for basic RDF structures
    const classMatches = rdfContent.match(/<owl:Class[^>]*rdf:about="([^"]*)"[^>]*>([\s\S]*?)<\/owl:Class>/g) || [];
    const labelMatches = rdfContent.match(/<rdfs:label>([^<]*)<\/rdfs:label>/g) || [];
    
    // Extract classes
    classMatches.forEach(match => {
      const uriMatch = match.match(/rdf:about="([^"]*)"/);
      const labelMatch = match.match(/<rdfs:label>([^<]*)<\/rdfs:label>/);
      
      if (uriMatch) {
        const uri = uriMatch[1];
        const label = labelMatch ? labelMatch[1] : this.getLocalName(uri);
        this.classes.set(uri, { uri, label, type: 'Class' });
      }
    });

    // Build basic entities and relationships
    this.buildEntities();
    this.buildRelationships();
  }

  /**
   * Process RDF quads and organize them by type
   * @param {Array} quads - Array of RDF quads
   */
  processQuads(quads) {
    quads.forEach(quad => {
      const subject = quad.subject.value;
      const predicate = quad.predicate.value;
      const object = quad.object.value || quad.object.id;
      
      // Store classes
      if (predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' && 
          object === 'http://www.w3.org/2002/07/owl#Class') {
        this.classes.set(subject, { uri: subject, type: 'Class' });
      }
      
      // Store properties
      if (predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' && 
          (object === 'http://www.w3.org/2002/07/owl#ObjectProperty' || 
           object === 'http://www.w3.org/2002/07/owl#DatatypeProperty')) {
        this.properties.set(subject, { uri: subject, type: 'Property' });
      }
      
      // Store instances (individuals)
      if (predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' && 
          !object.includes('owl#') && !object.includes('rdfs#')) {
        if (!this.instances.has(subject)) {
          this.instances.set(subject, { uri: subject, type: object, properties: new Map() });
        }
        this.instances.get(subject).type = object;
      }
      
      // Store labels
      if (predicate === 'http://www.w3.org/2000/01/rdf-schema#label') {
        const label = quad.object.value;
        if (this.classes.has(subject)) {
          this.classes.get(subject).label = label;
        }
        if (this.properties.has(subject)) {
          this.properties.get(subject).label = label;
        }
        if (this.instances.has(subject)) {
          this.instances.get(subject).label = label;
        }
      }
      
      // Store subclass relationships
      if (predicate === 'http://www.w3.org/2000/01/rdf-schema#subClassOf') {
        if (this.classes.has(subject)) {
          this.classes.get(subject).subClassOf = object;
        }
      }
      
      // Store property relationships for instances
      if (this.instances.has(subject) && !predicate.includes('rdf-syntax-ns#type') && !predicate.includes('rdfs#label')) {
        this.instances.get(subject).properties.set(predicate, object);
      }
    });
  }

  /**
   * Build entities array from parsed data
   */
  buildEntities() {
    this.entities = [];
    
    // Add classes as entities
    this.classes.forEach((classData, uri) => {
      const entityType = this.getEntityType(uri);
      this.entities.push({
        id: this.getLocalName(uri),
        uri: uri,
        label: classData.label || this.getLocalName(uri),
        type: entityType,
        subType: 'Class',
        properties: {
          subClassOf: classData.subClassOf
        },
        relationships: []
      });
    });
    
    // Add instances as entities
    this.instances.forEach((instanceData, uri) => {
      const entityType = this.getEntityType(instanceData.type);
      const properties = {};
      instanceData.properties.forEach((value, key) => {
        properties[this.getLocalName(key)] = value;
      });
      
      this.entities.push({
        id: this.getLocalName(uri),
        uri: uri,
        label: instanceData.label || this.getLocalName(uri),
        type: entityType,
        subType: 'Instance',
        properties: properties,
        relationships: []
      });
    });
  }

  /**
   * Build relationships array from parsed data
   */
  buildRelationships() {
    this.relationships = [];
    
    // Build relationships from instance properties
    this.instances.forEach((instanceData, subjectUri) => {
      instanceData.properties.forEach((objectUri, predicateUri) => {
        if (this.instances.has(objectUri) || this.classes.has(objectUri)) {
          this.relationships.push({
            id: `${this.getLocalName(subjectUri)}_${this.getLocalName(predicateUri)}_${this.getLocalName(objectUri)}`,
            source: this.getLocalName(subjectUri),
            target: this.getLocalName(objectUri),
            type: this.getLocalName(predicateUri),
            label: this.properties.get(predicateUri)?.label || this.getLocalName(predicateUri)
          });
        }
      });
    });
    
    // Build subclass relationships
    this.classes.forEach((classData, uri) => {
      if (classData.subClassOf) {
        this.relationships.push({
          id: `${this.getLocalName(uri)}_subClassOf_${this.getLocalName(classData.subClassOf)}`,
          source: this.getLocalName(uri),
          target: this.getLocalName(classData.subClassOf),
          type: 'subClassOf',
          label: 'is subclass of'
        });
      }
    });
    
    // Update entity relationships
    this.entities.forEach(entity => {
      entity.relationships = this.relationships.filter(rel => 
        rel.source === entity.id || rel.target === entity.id
      );
    });
  }

  /**
   * Extract local name from URI
   * @param {string} uri - Full URI
   * @returns {string} Local name
   */
  getLocalName(uri) {
    if (!uri) return '';
    const parts = uri.split(/[#\/]/);
    return parts[parts.length - 1];
  }

  /**
   * Determine entity type from URI
   * @param {string} uri - Entity URI
   * @returns {string} Entity type
   */
  getEntityType(uri) {
    if (!uri) return 'Unknown';
    
    const localName = this.getLocalName(uri);
    
    // Person types
    if (['Person', 'Citizen', 'Staff', 'Tourist'].includes(localName)) {
      return 'Person';
    }
    
    // Station types
    if (['Station', 'BikeStation', 'BusStation', 'MetroStation'].includes(localName)) {
      return 'Station';
    }
    
    // Transport mode types
    if (['TransportMode', 'Bike', 'Bus', 'Metro'].includes(localName)) {
      return 'TransportMode';
    }
    
    // Other types
    if (localName === 'Trip') return 'Trip';
    if (localName === 'Route') return 'Route';
    if (localName === 'Schedule') return 'Schedule';
    
    return 'Unknown';
  }

  /**
   * Get entities by type
   * @param {string} type - Entity type to filter by
   * @returns {Array} Filtered entities
   */
  getEntitiesByType(type) {
    return this.entities.filter(entity => entity.type === type);
  }

  /**
   * Get all entity types
   * @returns {Array} Array of unique entity types
   */
  getEntityTypes() {
    const types = new Set(this.entities.map(entity => entity.type));
    return Array.from(types);
  }
}