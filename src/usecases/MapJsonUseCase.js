import { JSONMapper } from '../domain/services/JSONMapper.js';

export class MapJsonUseCase {
  constructor(fileRepository, jsonMapper = new JSONMapper()) {
    this.fileRepository = fileRepository;
    this.jsonMapper = jsonMapper;
  }

  async execute({ inputFile, dictionaryFile, outputFile }) {
    if (!inputFile || !dictionaryFile || !outputFile) {
      throw new Error('All parameters (inputFile, dictionaryFile, outputFile) are required');
    }

    const sourceData = await this.fileRepository.readJson(inputFile);
    const dictionarySchema = await this.fileRepository.readJson(dictionaryFile);

    const transformed = this.jsonMapper.mapCollection(sourceData, dictionarySchema);

    await this.fileRepository.writeJson(outputFile, transformed);

    return {
      recordCount: sourceData.length,
      inputFile,
      dictionaryFile,
      outputFile
    };
  }
}
