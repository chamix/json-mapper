import { test } from 'node:test';
import assert from 'node:assert';
import { MapJsonUseCase } from '../../src/usecases/MapJsonUseCase.js';
import { IFileRepository } from '../../src/usecases/ports/IFileRepository.js';

class MockFileRepository extends IFileRepository {
  constructor(files = {}) {
    super();
    this.files = files;
    this.written = {};
  }

  async readJson(filePath) {
    if (!(filePath in this.files)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return this.files[filePath];
  }

  async writeJson(filePath, data) {
    this.written[filePath] = data;
  }
}

test('MapJsonUseCase - successful execution with mock files', async () => {
  const files = {
    'input.json': [
      { propertya: 'A', propertyb: 10 }
    ],
    'dictionary.json': {
      outKey: 'propertya'
    }
  };

  const mockRepo = new MockFileRepository(files);
  const usecase = new MapJsonUseCase(mockRepo);

  const result = await usecase.execute({
    inputFile: 'input.json',
    dictionaryFile: 'dictionary.json',
    outputFile: 'output.json'
  });

  assert.deepEqual(result, {
    recordCount: 1,
    inputFile: 'input.json',
    dictionaryFile: 'dictionary.json',
    outputFile: 'output.json'
  });

  assert.deepEqual(mockRepo.written['output.json'], [
    { outKey: 'A' }
  ]);
});

test('MapJsonUseCase - throws error on missing parameters', async () => {
  const mockRepo = new MockFileRepository();
  const usecase = new MapJsonUseCase(mockRepo);

  await assert.rejects(
    () => usecase.execute({ inputFile: 'input.json' }),
    /All parameters \(inputFile, dictionaryFile, outputFile\) are required/
  );
});
