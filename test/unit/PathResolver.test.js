import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PathResolver } from '../../src/infrastructure/cli/PathResolver.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempTestDir = path.resolve(__dirname, '../temp_path_resolver');

test('PathResolver - unit tests', async (t) => {
  // Setup temp directories and files
  await fs.mkdir(tempTestDir, { recursive: true });
  await fs.writeFile(path.join(tempTestDir, 'a.json'), '[]');
  await fs.writeFile(path.join(tempTestDir, 'b.json'), '[]');
  await fs.writeFile(path.join(tempTestDir, 'c.txt'), 'text'); // non-json

  t.after(async () => {
    // Cleanup
    await fs.rm(tempTestDir, { recursive: true, force: true });
  });

  await t.test('resolves a single JSON file correctly in 1:1 mode', async () => {
    const singleFile = path.join(tempTestDir, 'a.json');
    const result = await PathResolver.resolve({
      input: singleFile,
      output: path.join(tempTestDir, 'out_a.json'),
      mode: '1:1',
      dictionary: 'dict.json'
    });

    assert.strictEqual(result.mode, '1:1');
    assert.strictEqual(result.files.length, 1);
    assert.strictEqual(result.files[0].input, path.resolve(singleFile));
    assert.strictEqual(result.files[0].output, path.resolve(tempTestDir, 'out_a.json'));
    assert.strictEqual(result.dictionaryFile, path.resolve('dict.json'));
  });

  await t.test('resolves directory path into list of JSON files in 1:1 mode', async () => {
    const outDir = path.join(tempTestDir, 'out_dir');
    const result = await PathResolver.resolve({
      input: tempTestDir,
      output: outDir,
      mode: '1:1',
      dictionary: 'dict.json'
    });

    assert.strictEqual(result.mode, '1:1');
    assert.strictEqual(result.files.length, 2); // a.json, b.json (c.txt ignored)
    assert.strictEqual(result.files[0].input, path.resolve(tempTestDir, 'a.json'));
    assert.strictEqual(result.files[0].output, path.resolve(outDir, 'a.json'));
    assert.strictEqual(result.files[1].input, path.resolve(tempTestDir, 'b.json'));
    assert.strictEqual(result.files[1].output, path.resolve(outDir, 'b.json'));
  });

  await t.test('resolves glob patterns in many:1 mode', async () => {
    const globPattern = path.join(tempTestDir, '*.json');
    const result = await PathResolver.resolve({
      input: globPattern,
      output: path.join(tempTestDir, 'merged.json'),
      mode: 'many:1',
      dictionary: 'dict.json'
    });

    assert.strictEqual(result.mode, 'many:1');
    assert.strictEqual(result.files.length, 2);
    assert.strictEqual(result.files[0].input, path.resolve(tempTestDir, 'a.json'));
    assert.strictEqual(result.files[1].input, path.resolve(tempTestDir, 'b.json'));
    assert.strictEqual(result.outputFile, path.resolve(tempTestDir, 'merged.json'));
  });

  await t.test('throws validation error if multiple files resolved in 1:1 mode but output is a file path', async () => {
    await assert.rejects(
      () => PathResolver.resolve({
        input: tempTestDir,
        output: path.join(tempTestDir, 'not_a_dir.json'), // look like file path
        mode: '1:1',
        dictionary: 'dict.json'
      }),
      /In 1:1 mode with multiple files, output path must point to a directory/
    );
  });

  await t.test('throws descriptive error if wildcard pattern yields zero matches', async () => {
    await assert.rejects(
      () => PathResolver.resolve({
        input: path.join(tempTestDir, 'non_existent_*.json'),
        output: tempTestDir,
        mode: '1:1',
        dictionary: 'dict.json'
      }),
      /No input files found matching pattern/
    );
  });

  await t.test('throws descriptive error if directory contains no json files', async () => {
    const emptyDir = path.join(tempTestDir, 'empty_dir');
    await fs.mkdir(emptyDir, { recursive: true });
    await assert.rejects(
      () => PathResolver.resolve({
        input: emptyDir,
        output: tempTestDir,
        mode: '1:1',
        dictionary: 'dict.json'
      }),
      /No JSON files found in directory/
    );
  });
});
