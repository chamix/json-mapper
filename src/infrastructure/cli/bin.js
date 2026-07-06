#!/usr/bin/env node

import { Command } from 'commander';
import path from 'node:path';
import fs from 'node:fs/promises';
import { bootstrap } from '../di/container.js';
import { PathResolver } from './PathResolver.js';
import { RequestDTO } from '../../usecases/dto/RequestDTO.js';

async function run() {
  const program = new Command();

  program
    .name('json-mapper')
    .description('⚡ High-Performance Patterns-Driven JSON Transformer CLI')
    .version('2.0.0');

  program
    .option('-i, --input <path>', 'Path to the source JSON file, directory, or wildcard pattern')
    .requiredOption('-d, --dict <file>', 'Path to the mapping schema dictionary JSON file')
    .requiredOption('-o, --output <path>', 'Path to write the resulting transformed JSON output file or directory')
    .option('-m, --mode <mode>', 'Mapping mode: "1:1" (default) or "many:1"', '1:1')
    .option('-s, --stream', 'Read source JSON from standard input stream');

  program.parse(process.argv);

  const options = program.opts();

  // Validate option constraints
  if (options.stream) {
    if (options.input) {
      console.error(`\x1b[1m\x1b[31m✖ Path Resolution Error:\x1b[0m Cannot specify both --input and --stream`);
      process.exitCode = 1;
      return;
    }
  } else {
    if (!options.input) {
      console.error(`\x1b[1m\x1b[31m✖ Path Resolution Error:\x1b[0m Either --input or --stream option must be specified`);
      process.exitCode = 1;
      return;
    }
  }

  const container = bootstrap();

  let requestDto;
  if (options.stream) {
    let isOutDir = false;
    try {
      const stats = await fs.stat(options.output);
      isOutDir = stats.isDirectory();
    } catch (e) {
      isOutDir = options.output.endsWith('/') || options.output.endsWith('\\');
    }
    if (isOutDir) {
      console.error(`\x1b[1m\x1b[31m✖ Path Resolution Error:\x1b[0m Output path must point to a file, not a directory, when reading from a stream.`);
      process.exitCode = 1;
      return;
    }

    requestDto = new RequestDTO({
      mode: options.mode,
      dictionaryFile: path.resolve(options.dict),
      files: [],
      outputFile: path.resolve(options.output),
      inputStream: process.stdin
    });
  } else {
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
  }

  const exitCode = await container.cliController.handle(requestDto);

  process.exitCode = exitCode;
}

run();
