import { test } from 'node:test';
import assert from 'node:assert';
import { ILogger } from '../../src/usecases/ports/ILogger.js';
import { PinoLoggerAdapter } from '../../src/adapters/loggers/PinoLoggerAdapter.js';

test('PinoLoggerAdapter - implements ILogger interface and delegates calls to pino', () => {
  let loggedData = null;

  // We can pass a custom pino options and a mock stream to inspect logs in testing
  const mockStream = {
    write(str) {
      loggedData = JSON.parse(str);
    }
  };

  const adapter = new PinoLoggerAdapter({
    level: 'info',
    // Pino allows passing a custom destination stream
  }, mockStream);

  assert.ok(adapter instanceof ILogger, 'PinoLoggerAdapter must extend ILogger');

  // Test info
  adapter.info('test info message', { traceId: '123' });
  assert.ok(loggedData);
  assert.strictEqual(loggedData.msg, 'test info message');
  assert.strictEqual(loggedData.traceId, '123');
  assert.strictEqual(loggedData.level, 30); // 30 is pino info level

  // Test warn
  loggedData = null;
  adapter.warn('test warn message', { component: 'cli' });
  assert.ok(loggedData);
  assert.strictEqual(loggedData.msg, 'test warn message');
  assert.strictEqual(loggedData.component, 'cli');
  assert.strictEqual(loggedData.level, 40); // 40 is pino warn level

  // Test error
  loggedData = null;
  const testError = new Error('test rejection');
  adapter.error('test error occurred', testError, { contextId: '456' });
  assert.ok(loggedData);
  assert.strictEqual(loggedData.msg, 'test error occurred');
  assert.strictEqual(loggedData.level, 50); // 50 is pino error level
  assert.strictEqual(loggedData.err.message, 'test rejection');
  assert.strictEqual(loggedData.contextId, '456');

  // Test metrics
  loggedData = null;
  adapter.metrics('transformation_perf', { durationMs: 12.34, recordCount: 100 });
  assert.ok(loggedData);
  assert.strictEqual(loggedData.msg, 'Telemetry Metric: transformation_perf');
  assert.strictEqual(loggedData.metric, 'transformation_perf');
  assert.strictEqual(loggedData.telemetry, true);
  assert.strictEqual(loggedData.durationMs, 12.34);
  assert.strictEqual(loggedData.recordCount, 100);
});
