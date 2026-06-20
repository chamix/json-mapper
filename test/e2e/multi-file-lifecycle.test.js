import { test, before, after } from 'node:test';
import assert from 'node:assert';
import { fork } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, '../../src/infrastructure/cli/bin.js');
const outputDir = path.resolve(__dirname, '../output');
const fixturesDir = path.resolve(__dirname, '../fixtures');
const tempInputsDir = path.join(outputDir, 'temp_inputs');
const tempOutputsDir = path.join(outputDir, 'temp_outputs');

function runCLI(args) {
  return new Promise((resolve, reject) => {
    const child = fork(cliPath, args, { silent: true });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

before(async () => {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(tempInputsDir, { recursive: true });
  await fs.mkdir(tempOutputsDir, { recursive: true });

  // Prepare input files with array-wrapped records
  const rawFlat = await fs.readFile(path.join(fixturesDir, 'random_flat.json'), 'utf8');
  const recordFlat = JSON.parse(rawFlat);
  
  await fs.writeFile(path.join(tempInputsDir, 'file1.json'), JSON.stringify([recordFlat], null, 2), 'utf8');
  await fs.writeFile(path.join(tempInputsDir, 'file2.json'), JSON.stringify([recordFlat], null, 2), 'utf8');
});

after(async () => {
  // Wipe dynamic test artifacts
  try {
    await fs.rm(tempInputsDir, { recursive: true, force: true });
    await fs.rm(tempOutputsDir, { recursive: true, force: true });
    await fs.rm(path.join(outputDir, 'merged_output.json'), { force: true });
  } catch (error) {
    console.error('Environment cleanup failed:', error.message);
  }
});

test('E2E CLI - Multi-file mapping directory resolution (1:1 mode)', async () => {
  const dictPath = path.join(fixturesDir, 'dict_flat.json');

  const { code, stdout, stderr } = await runCLI([
    '-i', tempInputsDir,
    '-d', dictPath,
    '-o', tempOutputsDir,
    '-m', '1:1'
  ]);

  assert.strictEqual(code, 0, `Process exited with code ${code}. Stderr: ${stderr}`);

  // Assert both output files exist
  const out1 = await fs.readFile(path.join(tempOutputsDir, 'file1.json'), 'utf8');
  const out2 = await fs.readFile(path.join(tempOutputsDir, 'file2.json'), 'utf8');

  const data1 = JSON.parse(out1);
  const data2 = JSON.parse(out2);

  assert.strictEqual(data1.length, 1);
  assert.strictEqual(data2.length, 1);
  assert.strictEqual(data1[0].profile.fullName, 'Elowen Vance');

  // Verify aggregate metrics in stdout
  assert.match(stdout, /"telemetry":true/);
  assert.match(stdout, /"metric":"mapping_execution_telemetry"/);
  assert.match(stdout, /"processedFileCount":2/);
  assert.match(stdout, /"aggregateObjectCount":2/);
  assert.match(stdout, /"mode":"1:1"/);
  assert.match(stdout, /"durationUs":\d+/);
});

test('E2E CLI - Multi-file mapping glob expansion (many:1 mode)', async () => {
  const dictPath = path.join(fixturesDir, 'dict_flat.json');
  const mergedOutputPath = path.join(outputDir, 'merged_output.json');
  const globInput = path.join(tempInputsDir, '*.json');

  const { code, stdout, stderr } = await runCLI([
    '-i', globInput,
    '-d', dictPath,
    '-o', mergedOutputPath,
    '-m', 'many:1'
  ]);

  assert.strictEqual(code, 0, `Process exited with code ${code}. Stderr: ${stderr}`);

  // Assert single merged file exists and contains both records
  const mergedContent = await fs.readFile(mergedOutputPath, 'utf8');
  const data = JSON.parse(mergedContent);

  assert.ok(Array.isArray(data));
  assert.strictEqual(data.length, 2);
  assert.strictEqual(data[0].profile.fullName, 'Elowen Vance');
  assert.strictEqual(data[1].profile.fullName, 'Elowen Vance');

  // Verify aggregate metrics in stdout
  assert.match(stdout, /"processedFileCount":2/);
  assert.match(stdout, /"aggregateObjectCount":2/);
  assert.match(stdout, /"mode":"many:1"/);
});
