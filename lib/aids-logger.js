/**
 * AIDs Logger System
 * Système de logs centralisé pour toutes les fonctionnalités AIDs
 */

class AIDsLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.logLevels = {
      DEBUG: 'DEBUG',
      INFO: 'INFO',
      WARNING: 'WARNING',
      ERROR: 'ERROR',
      CRITICAL: 'CRITICAL',
      SUCCESS: 'SUCCESS'
    };
    this.enableConsole = true;
    this.enableStorage = true;
  }

  /**
   * Format du timestamp
   */
  getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Obtenir l'info de la stack trace
   */
  getStackInfo() {
    const stack = new Error().stack;
    const lines = stack.split('\n');
    if (lines.length >= 4) {
      const callerLine = lines[3];
      const match = callerLine.match(/at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/);
      if (match) {
        return {
          function: match[1],
          file: match[2].split('/').pop(),
          line: match[3],
          column: match[4]
        };
      }
    }
    return null;
  }

  /**
   * Logger principal
   */
  log(level, category, message, data = {}, error = null) {
    const timestamp = this.getTimestamp();
    const stackInfo = this.getStackInfo();
    
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      data,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: error.code
      } : null,
      stackInfo,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server'
    };

    // Ajouter aux logs en mémoire
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console log avec couleurs
    if (this.enableConsole) {
      this.consoleLog(logEntry);
    }

    // Sauvegarder dans localStorage
    if (this.enableStorage && typeof window !== 'undefined') {
      this.saveToStorage(logEntry);
    }

    // Envoyer les erreurs critiques au serveur
    if (level === this.logLevels.CRITICAL || level === this.logLevels.ERROR) {
      this.sendToServer(logEntry);
    }

    return logEntry;
  }

  /**
   * Console log avec style
   */
  consoleLog(logEntry) {
    const styles = {
      DEBUG: 'color: #888; font-weight: normal;',
      INFO: 'color: #2196F3; font-weight: normal;',
      WARNING: 'color: #FF9800; font-weight: bold;',
      ERROR: 'color: #F44336; font-weight: bold;',
      CRITICAL: 'color: #FF0000; font-weight: bold; font-size: 14px;',
      SUCCESS: 'color: #4CAF50; font-weight: bold;'
    };

    const prefix = `[AIDs ${logEntry.level}] [${logEntry.category}]`;
    const style = styles[logEntry.level] || '';

    console.log(
      `%c${prefix} ${logEntry.message}`,
      style,
      {
        timestamp: logEntry.timestamp,
        data: logEntry.data,
        stack: logEntry.stackInfo,
        error: logEntry.error
      }
    );
  }

  /**
   * Sauvegarder dans localStorage
   */
  saveToStorage(logEntry) {
    try {
      const storageKey = 'aids_logs';
      let storedLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      storedLogs.push(logEntry);
      
      // Garder seulement les 500 derniers logs
      if (storedLogs.length > 500) {
        storedLogs = storedLogs.slice(-500);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(storedLogs));
    } catch (e) {
      console.error('Failed to save log to storage:', e);
    }
  }

  /**
   * Envoyer au serveur (pour les erreurs critiques)
   */
  async sendToServer(logEntry) {
    try {
      await fetch('/api/aids/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      });
    } catch (e) {
      console.error('Failed to send log to server:', e);
    }
  }

  // Méthodes raccourcies
  debug(category, message, data = {}) {
    return this.log(this.logLevels.DEBUG, category, message, data);
  }

  info(category, message, data = {}) {
    return this.log(this.logLevels.INFO, category, message, data);
  }

  warning(category, message, data = {}) {
    return this.log(this.logLevels.WARNING, category, message, data);
  }

  error(category, message, data = {}, error = null) {
    return this.log(this.logLevels.ERROR, category, message, data, error);
  }

  critical(category, message, data = {}, error = null) {
    return this.log(this.logLevels.CRITICAL, category, message, data, error);
  }

  success(category, message, data = {}) {
    return this.log(this.logLevels.SUCCESS, category, message, data);
  }

  /**
   * Obtenir tous les logs
   */
  getLogs(filter = {}) {
    let filteredLogs = [...this.logs];

    if (filter.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }

    if (filter.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filter.category);
    }

    if (filter.startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filter.startDate));
    }

    if (filter.endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filter.endDate));
    }

    return filteredLogs;
  }

  /**
   * Exporter les logs
   */
  exportLogs(format = 'json') {
    const logs = this.getLogs();
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }
    
    if (format === 'csv') {
      const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Data', 'Error', 'File', 'Line'];
      const rows = logs.map(log => [
        log.timestamp,
        log.level,
        log.category,
        log.message,
        JSON.stringify(log.data),
        log.error ? log.error.message : '',
        log.stackInfo ? log.stackInfo.file : '',
        log.stackInfo ? log.stackInfo.line : ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return logs;
  }

  /**
   * Nettoyer les logs
   */
  clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aids_logs');
    }
  }

  /**
   * Obtenir les statistiques des logs
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byCategory: {},
      errors: [],
      lastHour: 0,
      last24Hours: 0
    };

    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    this.logs.forEach(log => {
      // Par niveau
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      
      // Par catégorie
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      
      // Erreurs
      if (log.level === this.logLevels.ERROR || log.level === this.logLevels.CRITICAL) {
        stats.errors.push({
          timestamp: log.timestamp,
          message: log.message,
          category: log.category
        });
      }
      
      // Dernière heure
      if (new Date(log.timestamp) >= oneHourAgo) {
        stats.lastHour++;
      }
      
      // Dernières 24h
      if (new Date(log.timestamp) >= oneDayAgo) {
        stats.last24Hours++;
      }
    });

    return stats;
  }
}

// Créer une instance singleton
const aidsLogger = new AIDsLogger();

// Catégories de logs prédéfinies
export const LogCategories = {
  META_API: 'META_API',
  CAMPAIGN: 'CAMPAIGN',
  PROSPECT: 'PROSPECT',
  REVENUE: 'REVENUE',
  AUTH: 'AUTH',
  UI: 'UI',
  ANALYTICS: 'ANALYTICS',
  OCTAVIA_AI: 'OCTAVIA_AI',
  BUDGET: 'BUDGET',
  PERFORMANCE: 'PERFORMANCE',
  EXPORT: 'EXPORT',
  SYNC: 'SYNC',
  ERROR_HANDLER: 'ERROR_HANDLER'
};

export default aidsLogger;