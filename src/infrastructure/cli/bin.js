#!/usr/bin/env node

import { bootstrap } from '../di/container.js';

async function run() {
  const container = bootstrap();
  const exitCode = await container.cliController.handle(process.argv.slice(2));
  process.exitCode = exitCode;
}

run();
