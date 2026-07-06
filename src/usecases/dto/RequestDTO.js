export class RequestDTO {
  /**
   * @param {Object} params
   * @param {string} params.mode - '1:1' | 'many:1'
   * @param {string} params.dictionaryFile - Path to the schema dictionary
   * @param {Array<{input: string, output?: string}>} params.files - Resolved input/output file path pairs
   * @param {string} [params.outputFile] - Single target output path (only used in many:1 mode)
   * @param {Readable} [params.inputStream] - Optional input stream to read data from
   */
  constructor({ mode, dictionaryFile, files, outputFile, inputStream }) {
    this.mode = mode;
    this.dictionaryFile = dictionaryFile;
    this.files = files;
    this.outputFile = outputFile;
    this.inputStream = inputStream;
  }
}
