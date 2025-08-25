import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Créer le dossier de logs s'il n'existe pas
const LOGS_DIR = path.join(process.cwd(), 'logs', 'aids');

async function ensureLogsDirectory() {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating logs directory:', error);
  }
}

export async function POST(request) {
  try {
    const logEntry = await request.json();
    
    // Ajouter des informations serveur
    const serverLog = {
      ...logEntry,
      serverTimestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent')
    };

    // Sauvegarder dans un fichier
    await ensureLogsDirectory();
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `aids-logs-${date}.json`;
    const filepath = path.join(LOGS_DIR, filename);
    
    try {
      // Lire les logs existants
      let logs = [];
      try {
        const existingData = await fs.readFile(filepath, 'utf-8');
        logs = JSON.parse(existingData);
      } catch (e) {
        // Le fichier n'existe pas encore
      }
      
      // Ajouter le nouveau log
      logs.push(serverLog);
      
      // Écrire les logs
      await fs.writeFile(filepath, JSON.stringify(logs, null, 2));
      
      // Si c'est une erreur critique, envoyer une alerte (webhook, email, etc.)
      if (logEntry.level === 'CRITICAL') {
        // TODO: Implémenter l'envoi d'alertes
        console.error('CRITICAL ERROR in AIDs:', logEntry);
      }
      
    } catch (error) {
      console.error('Error saving log to file:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing log:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await ensureLogsDirectory();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    
    const filename = `aids-logs-${date}.json`;
    const filepath = path.join(LOGS_DIR, filename);
    
    try {
      const data = await fs.readFile(filepath, 'utf-8');
      let logs = JSON.parse(data);
      
      // Filtrer par niveau si spécifié
      if (level) {
        logs = logs.filter(log => log.level === level);
      }
      
      // Filtrer par catégorie si spécifié
      if (category) {
        logs = logs.filter(log => log.category === category);
      }
      
      // Statistiques
      const stats = {
        total: logs.length,
        byLevel: {},
        byCategory: {},
        errors: logs.filter(l => l.level === 'ERROR' || l.level === 'CRITICAL').length
      };
      
      logs.forEach(log => {
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
        stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      });
      
      return NextResponse.json({
        success: true,
        date,
        logs,
        stats
      });
    } catch (error) {
      // Pas de logs pour cette date
      return NextResponse.json({
        success: true,
        date,
        logs: [],
        stats: {
          total: 0,
          byLevel: {},
          byCategory: {},
          errors: 0
        }
      });
    }
  } catch (error) {
    console.error('Error reading logs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}