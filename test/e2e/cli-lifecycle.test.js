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

// Helper to execute child process safely with stream intercepts
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

// Helper to prepare an array-wrapped temporary input file
async function prepareArrayInput(fixtureName) {
  const sourcePath = path.join(fixturesDir, fixtureName);
  const rawData = await fs.readFile(sourcePath, 'utf8');
  const sourceObject = JSON.parse(rawData);
  const arrayWrapped = [sourceObject];
  
  const tempInputPath = path.join(outputDir, `temp_array_${fixtureName}`);
  await fs.writeFile(tempInputPath, JSON.stringify(arrayWrapped, null, 2), 'utf8');
  return tempInputPath;
}

before(async () => {
  // Guarantee the sandboxed output folder is dynamically generated
  await fs.mkdir(outputDir, { recursive: true });
});

after(async () => {
  // Guarantee perfect cleanup by wiping dynamic test artifacts
  try {
    const files = await fs.readdir(outputDir);
    for (const file of files) {
      if (file !== '.gitkeep') {
        await fs.unlink(path.join(outputDir, file));
      }
    }
  } catch (error) {
    console.error('Environment cleanup failed:', error.message);
  }
});

test('E2E CLI - Raw single object input triggers exit code 1 with TypeError', async () => {
  const inputPath = path.join(fixturesDir, 'random_flat.json');
  const dictPath = path.join(fixturesDir, 'dict_flat.json');
  const outputPath = path.join(outputDir, 'transformed_should_fail.json');

  const { code, stderr } = await runCLI(['-i', inputPath, '-d', dictPath, '-o', outputPath]);

  // Assert expected exit code failure for single-object arrays constraint violation
  assert.strictEqual(code, 1, 'Process must exit with status 1 on raw single-object');
  assert.match(stderr, /TypeError|Source data must be an array of objects/, 'Stderr must report TypeError array constraint failure');
});

test('E2E CLI - Flat mapping lifecycle transformation success', async () => {
  const tempInputPath = await prepareArrayInput('random_flat.json');
  const dictPath = path.join(fixturesDir, 'dict_flat.json');
  const outputPath = path.join(outputDir, 'transformed_flat.json');

  const { code, stdout } = await runCLI(['-i', tempInputPath, '-d', dictPath, '-o', outputPath]);

  // 1. Assert exit code
  assert.strictEqual(code, 0, 'CLI must exit successfully with code 0');

  // 2. Assert output file correctness
  const rawOutput = await fs.readFile(outputPath, 'utf8');
  const outputData = JSON.parse(rawOutput);
  
  assert.ok(Array.isArray(outputData), 'Output must be a valid array');
  assert.strictEqual(outputData.length, 1, 'Output array must contain exactly 1 mapped object');
  
  assert.deepStrictEqual(outputData[0], {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    status: true,
    score: 88.42,
    profile: {
      fullName: 'Elowen Vance'
    },
    meta: {
      timestamp: 1774839201,
      legacyCode: 'USR-99421-X'
    }
  }, 'Flat transformation layout mapping must match target dictionary expectations');

  // 3. Assert telemetry logs emission in stdout
  assert.match(stdout, /"telemetry":true/, 'Stdout logs must contain telemetry marker');
  assert.match(stdout, /"metric":"mapping_execution_telemetry"/, 'Stdout logs must contain telemetry performance metric');
  assert.match(stdout, /"recordCount":1/, 'Telemetry metric recordCount must be 1');
  assert.match(stdout, /"durationMs":\d+(\.\d+)?/, 'Telemetry metric durationMs must be a positive numeric value');
});

test('E2E CLI - Deep nested mapping lifecycle transformation success', async () => {
  const tempInputPath = await prepareArrayInput('random_nested.json');
  const dictPath = path.join(fixturesDir, 'dict_nested.json');
  const outputPath = path.join(outputDir, 'transformed_nested.json');

  const { code, stdout } = await runCLI(['-i', tempInputPath, '-d', dictPath, '-o', outputPath]);

  // 1. Assert exit code
  assert.strictEqual(code, 0, 'CLI must exit successfully with code 0');

  // 2. Assert output file correctness
  const rawOutput = await fs.readFile(outputPath, 'utf8');
  const outputData = JSON.parse(rawOutput);
  
  assert.ok(Array.isArray(outputData), 'Output must be a valid array');
  assert.strictEqual(outputData.length, 1, 'Output array must contain exactly 1 mapped object');
  
  assert.deepStrictEqual(outputData[0], {
    transactionId: 'TXN-2026-88910',
    amount: 1450.50,
    taxRate: 0.15,
    currency: 'EUR',
    customer: {
      name: 'Gideon',
      surname: 'Thorne',
      age: 34
    },
    isVerified: false
  }, 'Deep nested transformation layout mapping must match target dictionary expectations');

  // 3. Assert telemetry logs emission in stdout
  assert.match(stdout, /"telemetry":true/, 'Stdout logs must contain telemetry marker');
  assert.match(stdout, /"metric":"mapping_execution_telemetry"/, 'Stdout logs must contain telemetry performance metric');
});

test('E2E CLI - Complex array collections lifecycle transformation success', async () => {
  const tempInputPath = await prepareArrayInput('random_complex_arrays.json');
  const dictPath = path.join(fixturesDir, 'dict_complex_arrays.json');
  const outputPath = path.join(outputDir, 'transformed_complex_arrays.json');

  const { code, stdout } = await runCLI(['-i', tempInputPath, '-d', dictPath, '-o', outputPath]);

  // 1. Assert exit code
  assert.strictEqual(code, 0, 'CLI must exit successfully with code 0');

  // 2. Assert output file correctness
  const rawOutput = await fs.readFile(outputPath, 'utf8');
  const outputData = JSON.parse(rawOutput);
  
  assert.ok(Array.isArray(outputData), 'Output must be a valid array');
  assert.strictEqual(outputData.length, 1, 'Output array must contain exactly 1 mapped object');
  
  assert.deepStrictEqual(outputData[0], {
    batchId: 'BATCH-XY-992',
    totalRecords: 2,
    environment: 'SANDBOX_NODE_26',
    items: [
      {
        index: 0,
        entityUuid: '4e1a1200-e29b-41d4-a716-446655440000',
        deviceInfo: {
          os_name: 'iOS',
          appVersion: 'v5.12.0'
        },
        telemetry_pings: [102, 98, 114]
      },
      {
        index: 1,
        entityUuid: '8f2b3411-fa1a-4c22-b883-998877665544',
        deviceInfo: {
          os_name: 'Android',
          appVersion: 'v5.11.2'
        },
        telemetry_pings: [85, 91]
      }
    ]
  }, 'Complex array transformation layout mapping must match target dictionary expectations');

  // 3. Assert telemetry logs emission in stdout
  assert.match(stdout, /"telemetry":true/, 'Stdout logs must contain telemetry marker');
  assert.match(stdout, /"metric":"mapping_execution_telemetry"/, 'Stdout logs must contain telemetry performance metric');
});
