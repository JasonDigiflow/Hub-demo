// Système de logging centralisé pour AIDs
class AIDsLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Garder les 1000 derniers logs
  }

  log(context, message, data = null, level = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context,
      level,
      message,
      ...(data && { data })
    };
    
    this.logs.unshift(logEntry);
    
    // Limiter la taille des logs en mémoire
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Log aussi dans la console selon le niveau
    const logMessage = `[${context}] ${message}`;
    switch (level) {
      case 'error':
        console.error(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'debug':
        console.log(`🔍 ${logMessage}`, data || '');
        break;
      default:
        console.log(logMessage, data || '');
    }
    
    return logEntry;
  }

  info(context, message, data) {
    return this.log(context, message, data, 'info');
  }

  error(context, message, data) {
    return this.log(context, message, data, 'error');
  }

  warn(context, message, data) {
    return this.log(context, message, data, 'warn');
  }

  debug(context, message, data) {
    return this.log(context, message, data, 'debug');
  }

  getLogs(context = null, limit = 100) {
    let filteredLogs = this.logs;
    
    if (context) {
      filteredLogs = this.logs.filter(log => log.context === context);
    }
    
    return filteredLogs.slice(0, limit);
  }

  getRecentErrors(limit = 50) {
    return this.logs
      .filter(log => log.level === 'error')
      .slice(0, limit);
  }

  clear() {
    this.logs = [];
  }

  // Pour les opérations importantes, créer une session de log
  startSession(sessionName) {
    const sessionId = `${sessionName}_${Date.now()}`;
    this.info(sessionName, `=== DÉBUT SESSION: ${sessionId} ===`);
    return {
      id: sessionId,
      name: sessionName,
      log: (message, data) => this.info(sessionId, message, data),
      error: (message, data) => this.error(sessionId, message, data),
      warn: (message, data) => this.warn(sessionId, message, data),
      debug: (message, data) => this.debug(sessionId, message, data),
      end: (summary) => {
        this.info(sessionId, `=== FIN SESSION: ${sessionId} ===`, summary);
        return this.getLogs(sessionId);
      }
    };
  }
}

// Instance singleton
const logger = new AIDsLogger();

export default logger;