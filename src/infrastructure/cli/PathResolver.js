import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'node:fs/promises';
import { RequestDTO } from '../../usecases/dto/RequestDTO.js';

export class PathResolver {
  /**
   * Resolves the input parameters and builds a standardized RequestDTO.
   *
   * @param {Object} params
   * @param {string} params.input - Single path, directory path, or glob pattern
   * @param {string} params.output - Single output path or output directory path
   * @param {string} params.mode - '1:1' | 'many:1'
   * @param {string} params.dictionary - Schema dictionary file path
   * @returns {Promise<RequestDTO>}
   */
  static async resolve({ input, output, mode, dictionary }) {
    if (!input || !output || !mode || !dictionary) {
      throw new Error('All parameters (input, output, mode, dictionary) are required');
    }

    let inputFiles = [];
    let isDir = false;

    try {
      const stats = await fs.stat(input);
      isDir = stats.isDirectory();
    } catch (e) {
      // Ignored: If it doesn't exist, it might be a glob pattern
    }

    if (isDir) {
      // It's a directory, scan for .json files
      const dirGlob = path.join(input, '*.json').replace(/\\/g, '/');
      for await (const file of glob(dirGlob)) {
        inputFiles.push(path.resolve(file));
      }
      if (inputFiles.length === 0) {
        throw new Error(`No JSON files found in directory: ${input}`);
      }
    } else if (input.includes('*') || input.includes('?')) {
      // It's a glob pattern
      const normalizedPattern = input.replace(/\\/g, '/');
      for await (const file of glob(normalizedPattern)) {
        inputFiles.push(path.resolve(file));
      }
      if (inputFiles.length === 0) {
        throw new Error(`No input files found matching pattern: ${input}`);
      }
    } else {
      // It's a single file
      try {
        const stats = await fs.stat(input);
        if (stats.isFile()) {
          inputFiles.push(path.resolve(input));
        } else {
          throw new Error(`Input path is not a file: ${input}`);
        }
      } catch (e) {
        if (e.code === 'ENOENT') {
          throw new Error(`Input path not found: ${input}`);
        }
        throw e;
      }
    }

    // Sort to guarantee deterministic order
    inputFiles.sort();

    let files = [];
    let resolvedOutputFile = undefined;

    if (mode === 'many:1') {
      files = inputFiles.map(file => ({ input: file }));
      resolvedOutputFile = path.resolve(output);
    } else if (mode === '1:1') {
      let isOutDir = false;
      try {
        const outStats = await fs.stat(output);
        isOutDir = outStats.isDirectory();
      } catch (e) {
        // If output directory doesn't exist, we deduce if it represents a directory
        const ext = path.extname(output);
        isOutDir = ext === '' || output.endsWith('/') || output.endsWith('\\');
      }

      if (inputFiles.length > 1 && !isOutDir) {
        throw new Error('In 1:1 mode with multiple files, output path must point to a directory.');
      }

      if (isOutDir) {
        files = inputFiles.map(file => {
          const base = path.basename(file);
          return {
            input: file,
            output: path.resolve(output, base)
          };
        });
      } else {
        files = [{
          input: inputFiles[0],
          output: path.resolve(output)
        }];
      }
    } else {
      throw new Error(`Unsupported mapping mode: ${mode}`);
    }

    return new RequestDTO({
      mode,
      dictionaryFile: path.resolve(dictionary),
      files,
      outputFile: resolvedOutputFile
    });
  }
}
