export class IFileRepository {
  async readJson(filePath) {
    throw new Error('Method "readJson(filePath)" must be implemented.');
  }

  async writeJson(filePath, data) {
    throw new Error('Method "writeJson(filePath, data)" must be implemented.');
  }
}
