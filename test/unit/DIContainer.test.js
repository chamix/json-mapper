import { test } from 'node:test';
import assert from 'node:assert';
import { bootstrap } from '../../src/infrastructure/di/container.js';
import { CLIController } from '../../src/adapters/controllers/CLIController.js';
import { CLIPresenter } from '../../src/adapters/presenters/CLIPresenter.js';
import { MapJsonUseCase } from '../../src/usecases/MapJsonUseCase.js';
import { FileRepositoryAdapter } from '../../src/adapters/repositories/FileRepositoryAdapter.js';
import { StreamReaderAdapter } from '../../src/adapters/repositories/StreamReaderAdapter.js';
import { PinoLoggerAdapter } from '../../src/adapters/loggers/PinoLoggerAdapter.js';

test('DI Container - bootstraps all components and connects them correctly including PinoLoggerAdapter', () => {
  const container = bootstrap();

  assert.ok(container.fileRepository instanceof FileRepositoryAdapter);
  assert.ok(container.streamReader instanceof StreamReaderAdapter);
  assert.ok(container.cliPresenter instanceof CLIPresenter);
  assert.ok(container.mapJsonUseCase instanceof MapJsonUseCase);
  assert.ok(container.cliController instanceof CLIController);
  assert.ok(container.logger instanceof PinoLoggerAdapter);

  // Check wiring
  assert.strictEqual(container.mapJsonUseCase.fileRepository, container.fileRepository);
  assert.strictEqual(container.mapJsonUseCase.logger, container.logger);
  assert.strictEqual(container.mapJsonUseCase.streamReader, container.streamReader);
  assert.strictEqual(container.cliController.mapJsonUseCase, container.mapJsonUseCase);
  assert.strictEqual(container.cliController.cliPresenter, container.cliPresenter);
  assert.strictEqual(container.cliController.logger, container.logger);
});
