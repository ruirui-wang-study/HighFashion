import { ConsoleLogger, type LoggerService } from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";

function resolveLogDir(): string {
  const configured = process.env.LOG_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
  }
  return path.resolve(process.cwd(), "..", "logs");
}

function resolveApiLogFile(): string {
  const dir = resolveLogDir();
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "api.log");
}

export class FileLogger extends ConsoleLogger implements LoggerService {
  private readonly logFile: string;

  constructor() {
    super();
    this.logFile = resolveApiLogFile();
  }

  private append(level: string, message: unknown, context?: string) {
    const text = typeof message === "string" ? message : JSON.stringify(message);
    const line = `[${new Date().toISOString()}] [${level}]${context ? ` [${context}]` : ""} ${text}\n`;
    fs.appendFile(this.logFile, line, () => undefined);
  }

  log(message: unknown, context?: string) {
    super.log(message, context);
    this.append("LOG", message, context);
  }

  error(message: unknown, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.append("ERROR", stack ? `${message}\n${stack}` : message, context);
  }

  warn(message: unknown, context?: string) {
    super.warn(message, context);
    this.append("WARN", message, context);
  }

  debug(message: unknown, context?: string) {
    super.debug(message, context);
    this.append("DEBUG", message, context);
  }

  verbose(message: unknown, context?: string) {
    super.verbose(message, context);
    this.append("VERBOSE", message, context);
  }
}
