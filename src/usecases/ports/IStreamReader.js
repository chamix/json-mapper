// Port boundary: stream input abstraction (see functional_domain.md §6.1)
export class IStreamReader {
  async readJson(stream) {
    throw new Error('Method "readJson(stream)" must be implemented.');
  }
}
