import { test } from 'node:test';
import assert from 'node:assert';
import { LeafMappingNode, ObjectMappingNode, ArrayMappingNode } from '../../src/domain/model/MappingNode.js';

test('MappingNode - LeafMappingNode resolution', () => {
  const leaf = new LeafMappingNode('propertya');
  const source = { propertya: 'a' };
  assert.strictEqual(leaf.resolve(source), 'a');
});

test('MappingNode - ObjectMappingNode resolution with nested children', () => {
  const root = new ObjectMappingNode();
  root.addChild('propiedad1', new LeafMappingNode('propertya'));
  root.addChild('propiedad2', new LeafMappingNode('propertyb'));

  const source = { propertya: 'hello', propertyb: 'world' };
  assert.deepEqual(root.resolve(source), {
    propiedad1: 'hello',
    propiedad2: 'world'
  });
});

test('MappingNode - ArrayMappingNode resolution', () => {
  const arr = new ArrayMappingNode();
  arr.addChild(new LeafMappingNode('propertyc[0]'));
  arr.addChild(new LeafMappingNode('propertyc[1]'));

  const source = { propertyc: ['first', 'second'] };
  assert.deepEqual(arr.resolve(source), ['first', 'second']);
});

test('MappingNode - Mixed Composite structure resolution', () => {
  const root = new ObjectMappingNode();
  root.addChild('propiedad1', new LeafMappingNode('propertya'));
  
  const subObject = new ObjectMappingNode();
  subObject.addChild('sub1', new LeafMappingNode('propertyd.propertyd1'));
  root.addChild('propiedad3', subObject);

  const subArray = new ArrayMappingNode();
  subArray.addChild(new LeafMappingNode('propertyc[1]'));
  subArray.addChild(new LeafMappingNode('propertyc[0]'));
  root.addChild('propiedad4', subArray);

  const source = {
    propertya: 'valA',
    propertyc: ['item0', 'item1'],
    propertyd: {
      propertyd1: 'nestedVal'
    }
  };

  assert.deepEqual(root.resolve(source), {
    propiedad1: 'valA',
    propiedad3: {
      sub1: 'nestedVal'
    },
    propiedad4: ['item1', 'item0']
  });
});
