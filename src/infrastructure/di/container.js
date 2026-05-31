import { FileRepositoryAdapter } from '../../adapters/repositories/FileRepositoryAdapter.js';
import { CLIPresenter } from '../../adapters/presenters/CLIPresenter.js';
import { PinoLoggerAdapter } from '../../adapters/loggers/PinoLoggerAdapter.js';
import { MapJsonUseCase } from '../../usecases/MapJsonUseCase.js';
import { CLIController } from '../../adapters/controllers/CLIController.js';

export function bootstrap() {
  const fileRepository = new FileRepositoryAdapter();
  const cliPresenter = new CLIPresenter();
  const logger = new PinoLoggerAdapter();

  const mapJsonUseCase = new MapJsonUseCase(fileRepository, logger);

  const cliController = new CLIController(mapJsonUseCase, cliPresenter, logger);

  return {
    fileRepository,
    cliPresenter,
    logger,
    mapJsonUseCase,
    cliController
  };
}
