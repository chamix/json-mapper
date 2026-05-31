import { test } from 'node:test';
import assert from 'node:assert';
import { JSONMapper } from '../../src/domain/services/JSONMapper.js';

test('JSONMapper - compile schemas and map single objects', () => {
  const mapper = new JSONMapper();
  const schema = {
    prop1: 'propertya',
    prop2: {
      nested1: 'propertyc[0]'
    }
  };

  const compiled = mapper.compile(schema);
  const source = {
    propertya: 'valueA',
    propertyc: ['hola']
  };

  assert.deepEqual(compiled.resolve(source), {
    prop1: 'valueA',
    prop2: {
      nested1: 'hola'
    }
  });
});

test('JSONMapper - mapCollection on array of objects', () => {
  const mapper = new JSONMapper();
  const schema = {
    propiedad1: 'propertya',
    proiedad2: 'propertyb',
    propiedad3: {
      propiedad3_1: 'propertyc[1]',
      propiedad3_2: 'propertyc[0]'
    },
    propiedad4: [
      'propertyd.propertyd1',
      'propertyd.propertyd2',
      'propertyd.propertyd3[0]'
    ]
  };

  const sourceData = [
    {
      propertya: 'a',
      propertyb: 1,
      propertyc: ['hola', 'mundo'],
      propertyd: {
        propertyd1: 'camilo',
        propertyd2: 20,
        propertyd3: ['san', 'lorenzo']
      }
    },
    {
      propertya: 'b',
      propertyb: 2,
      propertyc: ['adios', 'mundo'],
      propertyd: {
        propertyd1: 'coco',
        propertyd2: 3,
        propertyd3: ['boedo', 'argentina']
      }
    }
  ];

  const result = mapper.mapCollection(sourceData, schema);
  assert.deepEqual(result, [
    {
      propiedad1: 'a',
      proiedad2: 1,
      propiedad3: {
        propiedad3_1: 'mundo',
        propiedad3_2: 'hola'
      },
      propiedad4: ['camilo', 20, 'san']
    },
    {
      propiedad1: 'b',
      proiedad2: 2,
      propiedad3: {
        propiedad3_1: 'mundo',
        propiedad3_2: 'adios'
      },
      propiedad4: ['coco', 3, 'boedo']
    }
  ]);
});

test('JSONMapper - throws TypeError if collection is not an array', () => {
  const mapper = new JSONMapper();
  assert.throws(() => mapper.mapCollection({}, {}), TypeError);
});
