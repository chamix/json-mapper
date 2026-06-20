#!/usr/bin/env node

import { Command } from 'commander';
import { bootstrap } from '../di/container.js';
import { PathResolver } from './PathResolver.js';

async function run() {
  const program = new Command();

  program
    .name('json-mapper')
    .description('⚡ High-Performance Patterns-Driven JSON Transformer CLI')
    .version('2.0.0');

  program
    .requiredOption('-i, --input <path>', 'Path to the source JSON file, directory, or wildcard pattern')
    .requiredOption('-d, --dict <file>', 'Path to the mapping schema dictionary JSON file')
    .requiredOption('-o, --output <path>', 'Path to write the resulting transformed JSON output file or directory')
    .option('-m, --mode <mode>', 'Mapping mode: "1:1" (default) or "many:1"', '1:1');

  program.parse(process.argv);

  const options = program.opts();

  const container = bootstrap();

  let requestDto;
  try {
    requestDto = await PathResolver.resolve({
      input: options.input,
      output: options.output,
      mode: options.mode,
      dictionary: options.dict
    });
  } catch (error) {
    console.error(`\x1b[1m\x1b[31m✖ Path Resolution Error:\x1b[0m ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const exitCode = await container.cliController.handle(requestDto);

  process.exitCode = exitCode;
}

run();
