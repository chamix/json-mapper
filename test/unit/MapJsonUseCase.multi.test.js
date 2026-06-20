import { test } from 'node:test';
import assert from 'node:assert';
import { MapJsonUseCase } from '../../src/usecases/MapJsonUseCase.js';
import { IFileRepository } from '../../src/usecases/ports/IFileRepository.js';
import { ILogger } from '../../src/usecases/ports/ILogger.js';
import { RequestDTO } from '../../src/usecases/dto/RequestDTO.js';

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

class SpyLogger extends ILogger {
  constructor() {
    super();
    this.infos = [];
    this.warns = [];
    this.errors = [];
    this.telemetries = [];
  }

  info(message, context = {}) {
    this.infos.push({ message, context });
  }

  warn(message, context = {}) {
    this.warns.push({ message, context });
  }

  error(message, error, context = {}) {
    this.errors.push({ message, error, context });
  }

  metrics(metricName, data = {}) {
    this.telemetries.push({ metricName, data });
  }
}

test('MapJsonUseCase - Multi-File mapping in 1:1 mode', async () => {
  const files = {
    'input1.json': [{ id: 1, name: 'Alice' }],
    'input2.json': [{ id: 2, name: 'Bob' }],
    'dict.json': { userId: 'id', userName: 'name' }
  };

  const mockRepo = new MockFileRepository(files);
  const spyLogger = new SpyLogger();
  const usecase = new MapJsonUseCase(mockRepo, spyLogger);

  const request = new RequestDTO({
    mode: '1:1',
    dictionaryFile: 'dict.json',
    files: [
      { input: 'input1.json', output: 'out1.json' },
      { input: 'input2.json', output: 'out2.json' }
    ]
  });

  const metrics = await usecase.execute(request);

  // Assert output correctness
  assert.deepEqual(mockRepo.written['out1.json'], [{ userId: 1, userName: 'Alice' }]);
  assert.deepEqual(mockRepo.written['out2.json'], [{ userId: 2, userName: 'Bob' }]);

  // Assert metrics
  assert.strictEqual(metrics.processedFileCount, 2);
  assert.strictEqual(metrics.aggregateObjectCount, 2);
  assert.strictEqual(typeof metrics.durationUs, 'number');
  assert.ok(metrics.durationUs >= 0);

  // Assert telemetry logs
  assert.strictEqual(spyLogger.telemetries.length, 1);
  const telemetry = spyLogger.telemetries[0];
  assert.strictEqual(telemetry.metricName, 'mapping_execution_telemetry');
  assert.strictEqual(telemetry.data.processedFileCount, 2);
  assert.strictEqual(telemetry.data.aggregateObjectCount, 2);
  assert.strictEqual(telemetry.data.mode, '1:1');
  assert.strictEqual(typeof telemetry.data.durationUs, 'number');
});

test('MapJsonUseCase - Multi-File mapping in many:1 mode', async () => {
  const files = {
    'input1.json': [{ id: 1, name: 'Alice' }],
    'input2.json': [{ id: 2, name: 'Bob' }],
    'dict.json': { userId: 'id', userName: 'name' }
  };

  const mockRepo = new MockFileRepository(files);
  const spyLogger = new SpyLogger();
  const usecase = new MapJsonUseCase(mockRepo, spyLogger);

  const request = new RequestDTO({
    mode: 'many:1',
    dictionaryFile: 'dict.json',
    files: [
      { input: 'input1.json' },
      { input: 'input2.json' }
    ],
    outputFile: 'out_merged.json'
  });

  const metrics = await usecase.execute(request);

  // Assert output correctness (merged into single file)
  assert.deepEqual(mockRepo.written['out_merged.json'], [
    { userId: 1, userName: 'Alice' },
    { userId: 2, userName: 'Bob' }
  ]);

  // Assert metrics
  assert.strictEqual(metrics.processedFileCount, 2);
  assert.strictEqual(metrics.aggregateObjectCount, 2);
  assert.strictEqual(typeof metrics.durationUs, 'number');

  // Assert telemetry logs
  assert.strictEqual(spyLogger.telemetries.length, 1);
  const telemetry = spyLogger.telemetries[0];
  assert.strictEqual(telemetry.metricName, 'mapping_execution_telemetry');
  assert.strictEqual(telemetry.data.processedFileCount, 2);
  assert.strictEqual(telemetry.data.aggregateObjectCount, 2);
  assert.strictEqual(telemetry.data.mode, 'many:1');
});
