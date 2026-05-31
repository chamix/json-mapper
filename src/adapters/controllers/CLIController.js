export class CLIController {
  constructor(mapJsonUseCase, cliPresenter, logger) {
    this.mapJsonUseCase = mapJsonUseCase;
    this.cliPresenter = cliPresenter;
    this.logger = logger;
  }

  async handle({ inputFile, dictionaryFile, outputFile }) {
    try {
      const resultMetrics = await this.mapJsonUseCase.execute({
        inputFile,
        dictionaryFile,
        outputFile
      });

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
