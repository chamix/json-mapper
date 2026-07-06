export class IStreamReader {
  async readJson(stream) {
    throw new Error('Method "readJson(stream)" must be implemented.');
  }
}
