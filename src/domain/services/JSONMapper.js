import { LeafMappingNode, ObjectMappingNode, ArrayMappingNode } from '../model/MappingNode.js';

export class JSONMapper {
  compile(schema) {
    if (schema === null || schema === undefined) {
      throw new Error('Schema cannot be null or undefined');
    }

    if (typeof schema === 'string') {
      return new LeafMappingNode(schema);
    }

    if (Array.isArray(schema)) {
      const arrayNode = new ArrayMappingNode();
      for (const item of schema) {
        arrayNode.addChild(this.compile(item));
      }
      return arrayNode;
    }

    if (typeof schema === 'object') {
      const objectNode = new ObjectMappingNode();
      for (const [key, val] of Object.entries(schema)) {
        objectNode.addChild(key, this.compile(val));
      }
      return objectNode;
    }

    throw new Error(`Unsupported schema node type: ${typeof schema}`);
  }

  mapCollection(sourceArray, schema) {
    if (!Array.isArray(sourceArray)) {
      throw new TypeError('Source data must be an array of objects');
    }

    const compiledAst = this.compile(schema);
    return sourceArray.map(item => compiledAst.resolve(item));
  }
}
