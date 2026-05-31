import { test } from 'node:test';
import assert from 'node:assert';
import { LookupPath } from '../../src/domain/model/LookupPath.js';

test('LookupPath - simple key parsing', () => {
  const path = new LookupPath('propertya');
  assert.deepEqual(path.getSegments(), [
    { key: 'propertya', isIndexed: false, index: null }
  ]);
});

test('LookupPath - nested dot paths', () => {
  const path = new LookupPath('propertyd.propertyd1');
  assert.deepEqual(path.getSegments(), [
    { key: 'propertyd', isIndexed: false, index: null },
    { key: 'propertyd1', isIndexed: false, index: null }
  ]);
});

test('LookupPath - array indexed paths', () => {
  const path = new LookupPath('propertyc[1]');
  assert.deepEqual(path.getSegments(), [
    { key: 'propertyc', isIndexed: true, index: 1 }
  ]);
});

test('LookupPath - nested path with array index', () => {
  const path = new LookupPath('propertyd.propertyd3[0]');
  assert.deepEqual(path.getSegments(), [
    { key: 'propertyd', isIndexed: false, index: null },
    { key: 'propertyd3', isIndexed: true, index: 0 }
  ]);
});

test('LookupPath - validation of empty or invalid path', () => {
  assert.throws(() => new LookupPath(''), /Path cannot be empty/);
  assert.throws(() => new LookupPath(null), /Path must be a string/);
});
