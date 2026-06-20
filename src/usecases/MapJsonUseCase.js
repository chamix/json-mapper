import { performance } from 'node:perf_hooks';
import { JSONMapper } from '../domain/services/JSONMapper.js';

export class MapJsonUseCase {
  constructor(fileRepository, logger, jsonMapper = new JSONMapper()) {
    this.fileRepository = fileRepository;
    this.logger = logger;
    this.jsonMapper = jsonMapper;
  }

  async execute(request) {
    let mode = '1:1';
    let files = [];
    let dictionaryFile;
    let outputFile;

    // Backward compatibility for old parameter layout
    if (request && request.inputFile && request.outputFile) {
      mode = '1:1';
      files = [{ input: request.inputFile, output: request.outputFile }];
      dictionaryFile = request.dictionaryFile;
    } else if (request) {
      mode = request.mode || '1:1';
      files = request.files || [];
      dictionaryFile = request.dictionaryFile;
      outputFile = request.outputFile;
    }

    if (!dictionaryFile || !files || files.length === 0 || (mode === 'many:1' && !outputFile)) {
      const paramError = new Error('All parameters (inputFile, dictionaryFile, outputFile) are required');
      if (this.logger) {
        this.logger.error('Invalid arguments provided to MapJsonUseCase', paramError);
      }
      throw paramError;
    }

    if (this.logger) {
      this.logger.info('Starting JSON mapping execution flow', { mode, fileCount: files.length, dictionaryFile });
    }
    const startTime = performance.now();

    try {
      const dictionarySchema = await this.fileRepository.readJson(dictionaryFile);

      let aggregateObjectCount = 0;
      const accumulatedResults = [];

      for (const filePair of files) {
        const sourceData = await this.fileRepository.readJson(filePair.input);
        if (this.logger) {
          this.logger.info('Source dataset successfully loaded', { records: sourceData.length });
        }
        aggregateObjectCount += sourceData.length;

        const transformed = this.jsonMapper.mapCollection(sourceData, dictionarySchema);

        if (mode === '1:1') {
          await this.fileRepository.writeJson(filePair.output, transformed);
        } else {
          accumulatedResults.push(...transformed);
        }
      }

      if (mode === 'many:1') {
        await this.fileRepository.writeJson(outputFile, accumulatedResults);
      }

      const durationMs = parseFloat((performance.now() - startTime).toFixed(2));
      const durationUs = Math.round(durationMs * 1000);
      const processedFileCount = files.length;

      const telemetryOutputFile = mode === 'many:1' ? outputFile : files[0]?.output;

      if (this.logger) {
        this.logger.info('JSON mapping execution flow completed successfully', { outputFile: telemetryOutputFile });
        this.logger.metrics('mapping_execution_telemetry', {
          durationUs,
          processedFileCount,
          aggregateObjectCount,
          mode,
          // Backward compatibility fields
          durationMs,
          recordCount: aggregateObjectCount,
          inputFile: files[0]?.input,
          outputFile: telemetryOutputFile
        });
      }

      return {
        recordCount: aggregateObjectCount,
        durationMs,
        inputFile: files[0]?.input,
        dictionaryFile,
        outputFile: telemetryOutputFile,
        durationUs,
        processedFileCount,
        aggregateObjectCount,
        mode
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('JSON mapping execution flow failed catastrophically', error, {
          dictionaryFile
        });
      }
      throw error;
    }
  }
}
