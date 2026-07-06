import { test } from 'node:test';
import assert from 'node:assert';
import { Readable } from 'node:stream';
import { MapJsonUseCase } from '../../src/usecases/MapJsonUseCase.js';
import { IFileRepository } from '../../src/usecases/ports/IFileRepository.js';
import { ILogger } from '../../src/usecases/ports/ILogger.js';
import { IStreamReader } from '../../src/usecases/ports/IStreamReader.js';
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

class MockStreamReader extends IStreamReader {
  constructor(data) {
    super();
    this.data = data;
  }

  async readJson(stream) {
    return this.data;
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

test('MapJsonUseCase - successful execution with mock files and metrics telemetries', async () => {
  const files = {
    'input.json': [
      { propertya: 'A', propertyb: 10 },
      { propertya: 'B', propertyb: 20 }
    ],
    'dictionary.json': {
      outKey: 'propertya'
    }
  };

  const mockRepo = new MockFileRepository(files);
  const spyLogger = new SpyLogger();
  const usecase = new MapJsonUseCase(mockRepo, spyLogger);

  const result = await usecase.execute({
    inputFile: 'input.json',
    dictionaryFile: 'dictionary.json',
    outputFile: 'output.json'
  });

  // Verify business output
  assert.strictEqual(result.recordCount, 2);
  assert.strictEqual(typeof result.durationMs, 'number');
  assert.ok(result.durationMs >= 0);

  assert.deepEqual(mockRepo.written['output.json'], [
    { outKey: 'A' },
    { outKey: 'B' }
  ]);

  // Verify structured logging calls
  assert.ok(spyLogger.infos.some(log => log.message.includes('Starting JSON mapping execution flow')));
  assert.ok(spyLogger.infos.some(log => log.message.includes('Source dataset successfully loaded') && log.context.records === 2));
  assert.ok(spyLogger.infos.some(log => log.message.includes('JSON mapping execution flow completed successfully')));

  // Verify telemetries
  assert.strictEqual(spyLogger.telemetries.length, 1);
  const metricLog = spyLogger.telemetries[0];
  assert.strictEqual(metricLog.metricName, 'mapping_execution_telemetry');
  assert.strictEqual(metricLog.data.recordCount, 2);
  assert.strictEqual(typeof metricLog.data.durationMs, 'number');
  assert.strictEqual(metricLog.data.inputFile, 'input.json');
  assert.strictEqual(metricLog.data.outputFile, 'output.json');
});

test('MapJsonUseCase - throws error and logs error on missing parameters', async () => {
  const mockRepo = new MockFileRepository();
  const spyLogger = new SpyLogger();
  const usecase = new MapJsonUseCase(mockRepo, spyLogger);

  await assert.rejects(
    () => usecase.execute({ inputFile: 'input.json' }),
    /All parameters \(inputFile, dictionaryFile, outputFile\) are required/
  );

  assert.strictEqual(spyLogger.errors.length, 1);
  assert.strictEqual(spyLogger.errors[0].message, 'Invalid arguments provided to MapJsonUseCase');
  assert.ok(spyLogger.errors[0].error instanceof Error);
});

test('MapJsonUseCase - logs catastrophic failure when write fails', async () => {
  const files = {
    'input.json': [{ key: 'value' }],
    'dictionary.json': { out: 'key' }
  };
  const mockRepo = new MockFileRepository(files);
  // Corrupt write function to force error
  mockRepo.writeJson = async () => {
    throw new Error('Disk write failure');
  };

  const spyLogger = new SpyLogger();
  const usecase = new MapJsonUseCase(mockRepo, spyLogger);

  await assert.rejects(
    () => usecase.execute({
      inputFile: 'input.json',
      dictionaryFile: 'dictionary.json',
      outputFile: 'output.json'
    }),
    /Disk write failure/
  );

  assert.strictEqual(spyLogger.errors.length, 1);
  assert.strictEqual(spyLogger.errors[0].message, 'JSON mapping execution flow failed catastrophically');
  assert.strictEqual(spyLogger.errors[0].error.message, 'Disk write failure');
});

test('MapJsonUseCase - successful execution in stream input mode', async () => {
  const files = {
    'dictionary.json': {
      mappedVal: 'rawVal'
    }
  };
  const mockRepo = new MockFileRepository(files);
  const spyLogger = new SpyLogger();
  const mockStreamReader = new MockStreamReader([{ rawVal: 'hello' }, { rawVal: 'world' }]);
  
  const usecase = new MapJsonUseCase(mockRepo, spyLogger, undefined, mockStreamReader);
  
  const request = new RequestDTO({
    mode: '1:1',
    dictionaryFile: 'dictionary.json',
    files: [],
    outputFile: 'output_piped.json',
    inputStream: Readable.from('dummy')
  });

  const result = await usecase.execute(request);

  assert.strictEqual(result.recordCount, 2);
  assert.strictEqual(result.inputFile, '<stream>');
  assert.strictEqual(result.outputFile, 'output_piped.json');
  assert.deepEqual(mockRepo.written['output_piped.json'], [
    { mappedVal: 'hello' },
    { mappedVal: 'world' }
  ]);

  assert.strictEqual(spyLogger.telemetries.length, 1);
  const metricLog = spyLogger.telemetries[0];
  assert.strictEqual(metricLog.data.inputFile, '<stream>');
  assert.strictEqual(metricLog.data.outputFile, 'output_piped.json');
});

