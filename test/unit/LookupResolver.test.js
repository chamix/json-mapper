import { test } from 'node:test';
import assert from 'node:assert';
import { LookupPath } from '../../src/domain/model/LookupPath.js';
import { LookupResolver } from '../../src/domain/services/LookupResolver.js';

test('LookupResolver - simple key lookup', () => {
  const resolver = new LookupResolver();
  const source = { propertya: 'a', propertyb: 1 };
  const path = new LookupPath('propertya');
  assert.strictEqual(resolver.resolve(source, path), 'a');
});

test('LookupResolver - nested object lookup', () => {
  const resolver = new LookupResolver();
  const source = {
    propertyd: {
      propertyd1: 'camilo',
      propertyd2: 20
    }
  };
  const path = new LookupPath('propertyd.propertyd1');
  assert.strictEqual(resolver.resolve(source, path), 'camilo');
});

test('LookupResolver - array index lookup', () => {
  const resolver = new LookupResolver();
  const source = { propertyc: ['hola', 'mundo'] };
  const path = new LookupPath('propertyc[1]');
  assert.strictEqual(resolver.resolve(source, path), 'mundo');
});

test('LookupResolver - nested array index lookup', () => {
  const resolver = new LookupResolver();
  const source = {
    propertyd: {
      propertyd3: ['san', 'lorenzo', 'boedo']
    }
  };
  const path = new LookupPath('propertyd.propertyd3[1]');
  assert.strictEqual(resolver.resolve(source, path), 'lorenzo');
});

test('LookupResolver - returns undefined on non-existent properties', () => {
  const resolver = new LookupResolver();
  const source = { propertya: 'a' };
  const path = new LookupPath('nonexistent');
  assert.strictEqual(resolver.resolve(source, path), undefined);
});

test('LookupResolver - returns undefined on out of bounds index', () => {
  const resolver = new LookupResolver();
  const source = { propertyc: ['hola'] };
  const path = new LookupPath('propertyc[5]');
  assert.strictEqual(resolver.resolve(source, path), undefined);
});

test('LookupResolver - returns undefined on nested properties of null/undefined', () => {
  const resolver = new LookupResolver();
  const source = { propertya: null };
  const path = new LookupPath('propertya.nested');
  assert.strictEqual(resolver.resolve(source, path), undefined);
});
