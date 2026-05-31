import { test } from 'node:test';
import assert from 'node:assert';
import { CLIController } from '../../src/adapters/controllers/CLIController.js';
import { CLIPresenter } from '../../src/adapters/presenters/CLIPresenter.js';

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
      inputFile: params.inputFile,
      dictionaryFile: params.dictionaryFile,
      outputFile: params.outputFile
    };
  }
}

test('CLIController - presents help when empty or requested', async () => {
  const consoleMock = new MockConsole();
  const presenter = new CLIPresenter(consoleMock);
  const controller = new CLIController(null, presenter);

  const exit1 = await controller.handle([]);
  assert.strictEqual(exit1, 0);
  assert.ok(consoleMock.logs[0].includes('⚡ High-Performance Patterns-Driven JSON Transformer CLI'));

  const consoleMock2 = new MockConsole();
  const presenter2 = new CLIPresenter(consoleMock2);
  const controller2 = new CLIController(null, presenter2);
  const exit2 = await controller2.handle(['--help']);
  assert.strictEqual(exit2, 0);
  assert.ok(consoleMock2.logs[0].includes('⚡ High-Performance Patterns-Driven JSON Transformer CLI'));
});

test('CLIController - maps parameters correctly and handles success', async () => {
  const consoleMock = new MockConsole();
  const presenter = new CLIPresenter(consoleMock);
  const useCaseMock = new MockMapJsonUseCase();
  const controller = new CLIController(useCaseMock, presenter);

  const exitCode = await controller.handle([
    '-i', 'input_src.json',
    '--dict', 'dict_src.json',
    '-o', 'output_src.json'
  ]);

  assert.strictEqual(exitCode, 0);

  assert.deepEqual(useCaseMock.calledWith, {
    inputFile: 'input_src.json',
    dictionaryFile: 'dict_src.json',
    outputFile: 'output_src.json'
  });

  assert.ok(consoleMock.logs[0].includes('✔ Mapping Process Completed Successfully!'));
  assert.ok(consoleMock.logs[0].includes('input_src.json'));
});

test('CLIController - handles errors gracefully', async () => {
  const consoleMock = new MockConsole();
  const presenter = new CLIPresenter(consoleMock);
  const useCaseMock = new MockMapJsonUseCase(true);
  const controller = new CLIController(useCaseMock, presenter);

  const exitCode = await controller.handle([
    '-i', 'input.json',
    '-d', 'dict.json',
    '-o', 'output.json'
  ]);

  assert.strictEqual(exitCode, 1);

  assert.ok(consoleMock.errors[0].includes('✖ Architectural Boundary Mapping Error:'));
  assert.ok(consoleMock.errors[0].includes('UseCase Failure'));
});
