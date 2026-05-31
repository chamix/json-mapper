#!/usr/bin/env node

import { Command } from 'commander';
import { bootstrap } from '../di/container.js';

async function run() {
  const program = new Command();

  program
    .name('json-mapper')
    .description('⚡ High-Performance Patterns-Driven JSON Transformer CLI')
    .version('2.0.0');

  program
    .requiredOption('-i, --input <file>', 'Path to the source JSON dataset file (array format)')
    .requiredOption('-d, --dict <file>', 'Path to the mapping schema dictionary JSON file')
    .requiredOption('-o, --output <file>', 'Path to write the resulting transformed JSON output file');

  program.parse(process.argv);

  const options = program.opts();

  const container = bootstrap();

  const exitCode = await container.cliController.handle({
    inputFile: options.input,
    dictionaryFile: options.dict,
    outputFile: options.output
  });

  process.exitCode = exitCode;
}

run();
