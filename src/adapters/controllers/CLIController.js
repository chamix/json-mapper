export class CLIController {
  constructor(mapJsonUseCase, cliPresenter, logger) {
    this.mapJsonUseCase = mapJsonUseCase;
    this.cliPresenter = cliPresenter;
    this.logger = logger;
  }

  async handle(requestDto) {
    try {
      if (!requestDto) {
        throw new Error('RequestDTO is required');
      }

      // Convert old parameter format to RequestDTO format for backward compatibility
      let executionDto = requestDto;
      if (requestDto.inputFile && requestDto.outputFile) {
        executionDto = {
          mode: '1:1',
          dictionaryFile: requestDto.dictionaryFile,
          files: [{ input: requestDto.inputFile, output: requestDto.outputFile }]
        };
      }

      const isStream = !!executionDto.inputStream;
      if (isStream) {
        if (!executionDto.dictionaryFile || !executionDto.outputFile) {
          throw new Error('All parameters (dictionaryFile, outputFile) are required for stream mapping');
        }
      } else if (!executionDto.dictionaryFile || !executionDto.files || executionDto.files.length === 0) {
        throw new Error('All parameters (inputFile, dictionaryFile, outputFile) are required');
      }

      const resultMetrics = await this.mapJsonUseCase.execute(executionDto);

      this.cliPresenter.presentSuccess(resultMetrics);
      return 0;
    } catch (error) {
      if (this.logger) {
        this.logger.warn('CLI Controller execution completed with failures', { error: error.message });
      }
      this.cliPresenter.presentError(error);
      return 1;
    }
  }
}
