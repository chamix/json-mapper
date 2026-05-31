import { performance } from 'node:perf_hooks';
import { JSONMapper } from '../domain/services/JSONMapper.js';

export class MapJsonUseCase {
  constructor(fileRepository, logger, jsonMapper = new JSONMapper()) {
    this.fileRepository = fileRepository;
    this.logger = logger;
    this.jsonMapper = jsonMapper;
  }

  async execute({ inputFile, dictionaryFile, outputFile }) {
    if (!inputFile || !dictionaryFile || !outputFile) {
      const paramError = new Error('All parameters (inputFile, dictionaryFile, outputFile) are required');
      if (this.logger) {
        this.logger.error('Invalid arguments provided to MapJsonUseCase', paramError);
      }
      throw paramError;
    }

    if (this.logger) {
      this.logger.info('Starting JSON mapping execution flow', { inputFile, dictionaryFile, outputFile });
    }
    const startTime = performance.now();

    try {
      const sourceData = await this.fileRepository.readJson(inputFile);
      if (this.logger) {
        this.logger.info('Source dataset successfully loaded', { records: sourceData.length });
      }

      const dictionarySchema = await this.fileRepository.readJson(dictionaryFile);

      const transformed = this.jsonMapper.mapCollection(sourceData, dictionarySchema);

      await this.fileRepository.writeJson(outputFile, transformed);

      const durationMs = parseFloat((performance.now() - startTime).toFixed(2));
      const recordCount = sourceData.length;

      if (this.logger) {
        this.logger.info('JSON mapping execution flow completed successfully', { outputFile });
        this.logger.metrics('mapping_execution_telemetry', {
          durationMs,
          recordCount,
          inputFile,
          outputFile
        });
      }

      return {
        recordCount,
        durationMs,
        inputFile,
        dictionaryFile,
        outputFile
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('JSON mapping execution flow failed catastrophically', error, {
          inputFile,
          dictionaryFile,
          outputFile
        });
      }
      throw error;
    }
  }
}
