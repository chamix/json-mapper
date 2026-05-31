import pino from 'pino';
import { ILogger } from '../../usecases/ports/ILogger.js';

/**
 * Concrete GoF Adapter implementing ILogger using pino.
 * Adapts Pino's structured logging features to our clean port interfaces.
 */
export class PinoLoggerAdapter extends ILogger {
  constructor(options = {}, stream) {
    super();
    const config = {
      level: options.level || 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
      ...options
    };
    
    // Inject custom testing streams if provided, otherwise default to pino standard output
    this.pinoInstance = stream ? pino(config, stream) : pino(config);
  }

  info(message, context = {}) {
    this.pinoInstance.info(context, message);
  }

  warn(message, context = {}) {
    this.pinoInstance.warn(context, message);
  }

  error(message, error, context = {}) {
    this.pinoInstance.error(
      {
        err: {
          message: error.message,
          stack: error.stack
        },
        ...context
      },
      message
    );
  }

  metrics(metricName, data = {}) {
    this.pinoInstance.info(
      {
        telemetry: true,
        metric: metricName,
        ...data
      },
      `Telemetry Metric: ${metricName}`
    );
  }
}
