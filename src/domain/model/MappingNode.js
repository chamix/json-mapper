import { LookupPath } from './LookupPath.js';
import { LookupResolver } from '../services/LookupResolver.js';

/**
 * Abstract component base class in the GoF Composite Pattern.
 * Exposes the uniform interface 'resolve' implemented by both leaves and composite containers.
 */
export class MappingNode {
  /**
   * Abstract resolution method.
   * @param {any} sourceData - The source data structure to map
   * @returns {any} The resolved value
   * @abstract
   */
  resolve(sourceData) {
    throw new Error('Method "resolve(sourceData)" must be implemented.');
  }
}

/**
 * Leaf node representing a path expression lookup query.
 * @extends MappingNode
 */
export class LeafMappingNode extends MappingNode {
  /**
   * Initializes a new instance of LeafMappingNode.
   * @param {string|LookupPath} path - The query path string or LookupPath instance
   * @param {LookupResolver} resolver - The resolver engine to evaluate query strings
   */
  constructor(path, resolver = new LookupResolver()) {
    super();
    this.lookupPath = typeof path === 'string' ? new LookupPath(path) : path;
    this.resolver = resolver;
  }

  /**
   * Resolves the stored LookupPath against the provided source data.
   * @param {any} sourceData - The source data structure
   * @returns {any} The extracted value, or undefined
   */
  resolve(sourceData) {
    return this.resolver.resolve(sourceData, this.lookupPath);
  }
}

/**
 * Composite node containing key-mapped sub-nodes, representing objects.
 * @extends MappingNode
 */
export class ObjectMappingNode extends MappingNode {
  /**
   * Initializes a new instance of ObjectMappingNode.
   * @param {Object<string, MappingNode>} children - Sub-nodes mapped by property keys
   */
  constructor(children = {}) {
    super();
    this.children = children;
  }

  /**
   * Registers a child mapping node.
   * @param {string} key - The property key to assign the child result to
   * @param {MappingNode} node - The child mapping node to add
   */
  addChild(key, node) {
    this.children[key] = node;
  }

  /**
   * Evaluates all children recursively and assembles them into a resolved object structure.
   * @param {any} sourceData - The source data structure
   * @returns {Object<string, any>} The resolved sub-object
   */
  resolve(sourceData) {
    const result = {};
    for (const [key, node] of Object.entries(this.children)) {
      result[key] = node.resolve(sourceData);
    }
    return result;
  }
}

/**
 * Composite node containing an array sequence list of sub-nodes.
 * @extends MappingNode
 */
export class ArrayMappingNode extends MappingNode {
  /**
   * Initializes a new instance of ArrayMappingNode.
   * @param {Array<MappingNode>} children - The ordered child mapping nodes
   */
  constructor(children = []) {
    super();
    this.children = children;
  }

  /**
   * Appends a child mapping node.
   * @param {MappingNode} node - The child mapping node to append
   */
  addChild(node) {
    this.children.push(node);
  }

  /**
   * Evaluates all children recursively and returns them compiled in a native array.
   * @param {any} sourceData - The source data structure
   * @returns {Array<any>} The resolved array of elements
   */
  resolve(sourceData) {
    return this.children.map(node => node.resolve(sourceData));
  }
}
