/**
 * Strategy resolving plain object properties.
 * @implements {IResolutionStrategy}
 */
export class ObjectPropertyStrategy {
  /**
   * Resolves a key property directly on the target object.
   * @param {any} target - The target object
   * @param {string} key - The object key
   * @returns {any} The resolved value, or undefined if target is empty
   */
  resolve(target, key) {
    if (target === null || target === undefined) {
      return undefined;
    }
    return target[key];
  }
}

/**
 * Strategy resolving array indexes on properties.
 * @implements {IResolutionStrategy}
 */
export class ArrayIndexStrategy {
  /**
   * Accesses an array property on the target and retrieves a specific index.
   * @param {any} target - The target object
   * @param {string} key - The property key containing the array
   * @param {number} index - The numeric index to extract
   * @returns {any} The indexed element, or undefined if target, property, or array index is invalid
   */
  resolve(target, key, index) {
    if (target === null || target === undefined) {
      return undefined;
    }
    const array = target[key];
    if (array === null || array === undefined || !Array.isArray(array)) {
      return undefined;
    }
    return array[index];
  }
}

/**
 * Strategy-driven service traversing source structures using segment arrays.
 */
export class LookupResolver {
  /**
   * Initializes a new instance of LookupResolver.
   * @param {ObjectPropertyStrategy} objectStrategy - The strategy to handle object keys
   * @param {ArrayIndexStrategy} arrayStrategy - The strategy to handle array subscript indexes
   */
  constructor(objectStrategy = new ObjectPropertyStrategy(), arrayStrategy = new ArrayIndexStrategy()) {
    this.objectStrategy = objectStrategy;
    this.arrayStrategy = arrayStrategy;
  }

  /**
   * Navigates the source object recursively using the segments parsed in lookupPath.
   * @param {any} source - The source data structure to traverse
   * @param {LookupPath} lookupPath - The parsed LookupPath entity containing target query segments
   * @returns {any} The resolved value, or undefined if the target path is not resolved
   */
  resolve(source, lookupPath) {
    if (!source || !lookupPath) {
      return undefined;
    }

    const segments = lookupPath.getSegments();
    let current = source;

    for (const segment of segments) {
      if (current === null || current === undefined) {
        return undefined;
      }

      if (segment.isIndexed) {
        current = this.arrayStrategy.resolve(current, segment.key, segment.index);
      } else {
        current = this.objectStrategy.resolve(current, segment.key);
      }
    }

    return current;
  }
}
