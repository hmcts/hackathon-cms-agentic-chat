import fs from 'fs';
import path from 'path';

export interface LogEntry {
  sessionId: string;
  ip: string;
  userAgent: string;
  event: string;
  data: any;
  timestamp?: string;
}

function getLogBase() {
  const azureLogDir = '/home/LogFiles';
  if (fs.existsSync(azureLogDir)) {
    return azureLogDir;
  }
  return path.join(process.cwd(), 'logs');
}

const LOG_BASE = getLogBase();
const LOG_DIR = path.join(LOG_BASE, 'cms-logs');

function getLogFilePath(sessionId: string) {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const dayDir = path.join(LOG_DIR, date);
  if (!fs.existsSync(dayDir)) {
    fs.mkdirSync(dayDir, { recursive: true });
  }
  return path.join(dayDir, `session-${sessionId}.log`);
}

export function logEvent(entry: LogEntry) {
  const logFile = getLogFilePath(entry.sessionId);
  const logLine = JSON.stringify({
    ...entry,
    timestamp: new Date().toISOString(),
  }) + '\n';
  fs.appendFile(logFile, logLine, err => {
    if (err) {
      // fallback to console if file write fails
      console.error('Log write failed:', err, logLine);
    }
  });
}
