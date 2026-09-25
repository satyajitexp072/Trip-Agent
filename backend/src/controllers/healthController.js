import { getDbStatus } from '../config/db.js';
import { config } from '../config/env.js';

export const getHealth = (req, res) => {
  const dbStatus = getDbStatus();

  return res.status(200).json({
    status: 'ok',
    service: 'Trip-Agent backend',
    product: 'Trip Agent',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: config.nodeEnv,
    database: {
      status: dbStatus.connected ? 'connected' : 'disconnected (running in offline/mock mode)',
      details: dbStatus,
    },
    ai: {
      provider: config.llm.provider,
      hasOpenAiKey: Boolean(config.llm.openaiApiKey),
      hasGeminiKey: Boolean(config.llm.geminiApiKey),
    },
  });
};
