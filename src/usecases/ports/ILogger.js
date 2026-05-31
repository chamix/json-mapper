/**
 * Abstract Port Interface for the Logging and Telemetry Subsystem.
 * Enforces strict Dependency Inversion (DIP) in Use Cases and Domain Layers.
 */
export class ILogger {
  info(message, context = {}) {
    throw new Error('Method "info(message, context)" must be implemented.');
  }

  warn(message, context = {}) {
    throw new Error('Method "warn(message, context)" must be implemented.');
  }

  error(message, error, context = {}) {
    throw new Error('Method "error(message, error, context)" must be implemented.');
  }

  metrics(metricName, data = {}) {
    throw new Error('Method "metrics(metricName, data)" must be implemented.');
  }
}
