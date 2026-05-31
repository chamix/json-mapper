/**
 * Cache storage holding parsed lookup path segments to prevent redundant parses.
 * @type {Map<string, Array<{key: string, isIndexed: boolean, index: number|null}>>}
 */
const pathCache = new Map();

/**
 * Represents a parsed property query path.
 * Responsible for verifying the structure of path string inputs and mapping them into segments.
 */
export class LookupPath {
  /**
   * Initializes a new instance of LookupPath.
   * @param {string} pathStr - The dot-notation path to parse (e.g., 'propertya.propertyb[0]')
   * @throws {TypeError} Throws if pathStr is not a string
   * @throws {Error} Throws if pathStr is empty
   */
  constructor(pathStr) {
    if (pathStr === null || pathStr === undefined || typeof pathStr !== 'string') {
      throw new TypeError('Path must be a string');
    }
    if (pathStr.trim() === '') {
      throw new Error('Path cannot be empty');
    }
    this.pathStr = pathStr;
    this.segments = this._parse(pathStr);
  }

  /**
   * Retrieves the parsed segments representing this query path.
   * @returns {Array<{key: string, isIndexed: boolean, index: number|null}>}
   */
  getSegments() {
    return this.segments;
  }

  /**
   * Internal parser splitting path strings by period boundaries and resolving array subscripts.
   * @param {string} pathStr - The path string to parse
   * @returns {Array<{key: string, isIndexed: boolean, index: number|null}>}
   * @private
   */
  _parse(pathStr) {
    if (pathCache.has(pathStr)) {
      return pathCache.get(pathStr);
    }

    const segments = pathStr.split('.').map(part => {
      // Look for bracket notation like part[index]
      const match = part.match(/^([^\[\]]+)(?:\[(\d+)\])?$/);
      if (!match) {
        throw new Error(`Invalid path segment: ${part}`);
      }
      const [, key, indexStr] = match;
      const isIndexed = indexStr !== undefined;
      const index = isIndexed ? parseInt(indexStr, 10) : null;
      return { key, isIndexed, index };
    });

    pathCache.set(pathStr, segments);
    return segments;
  }
}
