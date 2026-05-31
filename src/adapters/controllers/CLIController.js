export class CLIController {
  constructor(mapJsonUseCase, cliPresenter) {
    this.mapJsonUseCase = mapJsonUseCase;
    this.cliPresenter = cliPresenter;
  }

  async handle(args) {
    try {
      if (args.includes('-h') || args.includes('--help') || args.length === 0) {
        this.cliPresenter.presentHelp();
        return 0;
      }

      let inputFile = null;
      let dictionaryFile = null;
      let outputFile = null;

      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '-i' || arg === '--input') {
          inputFile = args[i + 1];
          i++;
        } else if (arg === '-d' || arg === '--dict') {
          dictionaryFile = args[i + 1];
          i++;
        } else if (arg === '-o' || arg === '--output') {
          outputFile = args[i + 1];
          i++;
        }
      }

      if (!inputFile || !dictionaryFile || !outputFile) {
        throw new Error('Missing required arguments. Please specify -i/--input, -d/--dict, and -o/--output.');
      }

      const metrics = await this.mapJsonUseCase.execute({
        inputFile,
        dictionaryFile,
        outputFile
      });

      this.cliPresenter.presentSuccess(metrics);
      return 0;
    } catch (error) {
      this.cliPresenter.presentError(error);
      return 1;
    }
  }
}
