import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { FileRepositoryAdapter } from '../../src/adapters/repositories/FileRepositoryAdapter.js';

test('FileRepositoryAdapter - write and read JSON files successfully', async () => {
  const adapter = new FileRepositoryAdapter();
  const testFilePath = path.join(process.cwd(), 'temp_test_file.json');

  try {
    const testData = { hello: 'world', count: 42 };
    await adapter.writeJson(testFilePath, testData);

    const readData = await adapter.readJson(testFilePath);
    assert.deepEqual(readData, testData);
  } finally {
    try {
      await fs.unlink(testFilePath);
    } catch {
      // Ignore
    }
  }
});

test('FileRepositoryAdapter - read throws descriptive error when file is missing', async () => {
  const adapter = new FileRepositoryAdapter();
  const missingPath = path.join(process.cwd(), 'does_not_exist_xyz.json');

  await assert.rejects(
    () => adapter.readJson(missingPath),
    /File not found/
  );
});
