export class CLIPresenter {
  constructor(consoleLogger = console) {
    this.consoleLogger = consoleLogger;
  }

  presentHelp() {
    this.consoleLogger.log(`
\x1b[1m\x1b[36m      _ ____   ___  _   _     __  __   _   ____  ____  _____ ____  
     | / ___| / _ \\| \\ | |   |  \\/  | / \\ |  _ \\|  _ \\| ____|  _ \\ 
  _  | \\___ \\| | | |  \\| |   | |\\/| |/ _ \\| |_) | |_) |  _| | |_) |
 | |_| |___) | |_| | |\\  |   | |  | / ___ \\  __/|  __/| |___|  _ < 
  \\___/|____/ \\___/|_| \\_|   |_|  |/_/   \\_\\_|   |_|   |_____|_| \\_\\
\x1b[0m
\x1b[1m\x1b[33m⚡ High-Performance Patterns-Driven JSON Transformer CLI\x1b[0m

\x1b[1mUsage:\x1b[0m
  node src/infrastructure/cli/bin.js -i <inputFile> -d <dictionaryFile> -o <outputFile>

\x1b[1mOptions:\x1b[0m
  \x1b[32m-i, --input <file>\x1b[0m     Path to the source JSON dataset file (array format).
  \x1b[32m-d, --dict <file>\x1b[0m      Path to the mapping schema dictionary JSON file.
  \x1b[32m-o, --output <file>\x1b[0m     Path to write the resulting transformed JSON output file.
  \x1b[32m-h, --help\x1b[0m              Show this beautiful help description text.

\x1b[2mClean Architecture • SOLID Principles • Gang of Four Design Patterns\x1b[0m
`);
  }

  presentSuccess(metrics) {
    this.consoleLogger.log(`
\x1b[1m\x1b[32m✔ Mapping Process Completed Successfully!\x1b[0m

\x1b[1mTransform Summary:\x1b[0m
  \x1b[36m• Input File:\x1b[0m      ${metrics.inputFile}
  \x1b[36m• Dictionary:\x1b[0m      ${metrics.dictionaryFile}
  \x1b[36m• Output File:\x1b[0m     ${metrics.outputFile}
  \x1b[36m• Records Mapped:\x1b[0m  \x1b[1m\x1b[32m${metrics.recordCount}\x1b[0m records successfully processed.

\x1b[2mTransformation executed with Kent Beck TDD and zero-overhead performance caching.\x1b[0m
`);
  }

  presentError(error) {
    this.consoleLogger.error(`
\x1b[1m\x1b[31m✖ Architectural Boundary Mapping Error:\x1b[0m
  \x1b[33mReason:\x1b[0m ${error.message}
  \x1b[2m(Make sure input files exist and contain valid JSON formats)\x1b[0m
`);
  }
}
