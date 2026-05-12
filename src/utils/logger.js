/**
 * Centralized logger for the CNAB Viewer.
 * Logs are only shown if the debug mode is active (can be tied to an environment variable or store setting).
 */

const IS_DEBUG = true; // No futuro pode ser: import.meta.env.VITE_DEBUG === 'true'

export const logger = {
  debug: (message, ...args) => {
    if (IS_DEBUG) {
      console.log(`%c[CNAB-DEBUG]%c ${message}`, 'color: #3b82f6; font-weight: bold;', 'color: inherit;', ...args);
    }
  },
  error: (message, ...args) => {
    console.error(`%c[CNAB-ERROR]%c ${message}`, 'color: #ef4444; font-weight: bold;', 'color: inherit;', ...args);
  },
  warn: (message, ...args) => {
    console.warn(`%c[CNAB-WARN]%c ${message}`, 'color: #f59e0b; font-weight: bold;', 'color: inherit;', ...args);
  },
  info: (message, ...args) => {
    console.info(`%c[CNAB-INFO]%c ${message}`, 'color: #10b981; font-weight: bold;', 'color: inherit;', ...args);
  }
};
