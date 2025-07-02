import { logStore } from './logStore';

interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

class ConsoleLogger implements Logger {
  private isDevelopment = __DEV__;
  private prefix = '[PolarH10Monitor]';

  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(`${this.prefix}[DEBUG] ${message}`, ...args);
      logStore.addLog('DEBUG', message, args.length > 0 ? args[0] : undefined);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.info(`${this.prefix}[INFO] ${message}`, ...args);
      logStore.addLog('INFO', message, args.length > 0 ? args[0] : undefined);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`${this.prefix}[WARN] ${message}`, ...args);
    logStore.addLog('WARN', message, args.length > 0 ? args[0] : undefined);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`${this.prefix}[ERROR] ${message}`, ...args);
    logStore.addLog('ERROR', message, args.length > 0 ? args[0] : undefined);
  }
}

export const logger = new ConsoleLogger();
export type { Logger };
