import { FileRepositoryAdapter } from '../../adapters/repositories/FileRepositoryAdapter.js';
import { CLIPresenter } from '../../adapters/presenters/CLIPresenter.js';
import { MapJsonUseCase } from '../../usecases/MapJsonUseCase.js';
import { CLIController } from '../../adapters/controllers/CLIController.js';

export function bootstrap() {
  const fileRepository = new FileRepositoryAdapter();
  const cliPresenter = new CLIPresenter();

  const mapJsonUseCase = new MapJsonUseCase(fileRepository);

  const cliController = new CLIController(mapJsonUseCase, cliPresenter);

  return {
    fileRepository,
    cliPresenter,
    mapJsonUseCase,
    cliController
  };
}
