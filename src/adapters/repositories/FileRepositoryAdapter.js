import fs from 'node:fs/promises';
import { IFileRepository } from '../../usecases/ports/IFileRepository.js';

export class FileRepositoryAdapter extends IFileRepository {
  async readJson(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      if (!content || content.trim() === '') {
        throw new Error(`File is empty: ${filePath}`);
      }
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

  async writeJson(filePath, data) {
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write JSON file: ${filePath}. Reason: ${error.message}`);
    }
  }
}
