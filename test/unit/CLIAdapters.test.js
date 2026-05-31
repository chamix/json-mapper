import { test } from 'node:test';
import assert from 'node:assert';
import { CLIController } from '../../src/adapters/controllers/CLIController.js';
import { CLIPresenter } from '../../src/adapters/presenters/CLIPresenter.js';
import { ILogger } from '../../src/usecases/ports/ILogger.js';

class MockConsole {
  constructor() {
    this.logs = [];
    this.errors = [];
  }
  log(msg) {
    this.logs.push(msg);
  }
  error(msg) {
    this.errors.push(msg);
  }
}

class MockMapJsonUseCase {
  constructor(shouldFail = false) {
    this.shouldFail = shouldFail;
    this.calledWith = null;
  }
  async execute(params) {
    this.calledWith = params;
    if (this.shouldFail) {
      throw new Error('UseCase Failure');
    }
    return {
      recordCount: 5,
      durationMs: 15.6,
      inputFile: params.inputFile,
      dictionaryFile: params.dictionaryFile,
      outputFile: params.outputFile
    };
  }
}

class SpyLogger extends ILogger {
  constructor() {
    super();
    this.warns = [];
  }
  warn(message, context = {}) {
    this.warns.push({ message, context });
  }
}

test('CLIController - maps parameters correctly and handles success', async () => {
  const consoleMock = new MockConsole();
  const presenter = new CLIPresenter(consoleMock);
  const useCaseMock = new MockMapJsonUseCase();
  const spyLogger = new SpyLogger();
  const controller = new CLIController(useCaseMock, presenter, spyLogger);

  const exitCode = await controller.handle({
    inputFile: 'input_src.json',
    dictionaryFile: 'dict_src.json',
    outputFile: 'output_src.json'
  });

  assert.strictEqual(exitCode, 0);

  assert.deepEqual(useCaseMock.calledWith, {
    inputFile: 'input_src.json',
    dictionaryFile: 'dict_src.json',
    outputFile: 'output_src.json'
  });

  assert.ok(consoleMock.logs[0].includes('✔ Mapping Process Completed Successfully!'));
  assert.ok(consoleMock.logs[0].includes('input_src.json'));
});

test('CLIController - handles errors gracefully and logs warnings', async () => {
  const consoleMock = new MockConsole();
  const presenter = new CLIPresenter(consoleMock);
  const useCaseMock = new MockMapJsonUseCase(true);
  const spyLogger = new SpyLogger();
  const controller = new CLIController(useCaseMock, presenter, spyLogger);

  const exitCode = await controller.handle({
    inputFile: 'input.json',
    dictionaryFile: 'dict.json',
    outputFile: 'output.json'
  });

  assert.strictEqual(exitCode, 1);

  assert.ok(consoleMock.errors[0].includes('✖ Architectural Boundary Mapping Error:'));
  assert.ok(consoleMock.errors[0].includes('UseCase Failure'));

  // Assert warning log
  assert.strictEqual(spyLogger.warns.length, 1);
  assert.strictEqual(spyLogger.warns[0].message, 'CLI Controller execution completed with failures');
  assert.strictEqual(spyLogger.warns[0].context.error, 'UseCase Failure');
});
