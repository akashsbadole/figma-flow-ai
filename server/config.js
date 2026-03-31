import dotenv from 'dotenv';

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:8080', 'http://localhost:3000'],
  },

  database: {
    url: process.env.DATABASE_URL,
    neonUrl: process.env.NEON_DATABASE_URL,
    connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '2000', 10),
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    minimaxApiKey: process.env.MINIMAX_API_KEY,
    minimaxBaseUrl: process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1',
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
    retryDelayMs: parseInt(process.env.AI_RETRY_DELAY_MS || '1000', 10),
  },

  rateLimit: {
    apiWindowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS || '900000', 10),
    apiMax: parseInt(process.env.RATE_LIMIT_API_MAX || '100', 10),
    aiWindowMs: parseInt(process.env.RATE_LIMIT_AI_WINDOW_MS || '60000', 10),
    aiMax: parseInt(process.env.RATE_LIMIT_AI_MAX || '10', 10),
  },

  clerk: {
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    userIdMapping: process.env.CLERK_USER_ID_MAPPING || 'user_id',
  },

  api: {
    url: process.env.API_URL || process.env.VITE_API_URL || 'http://localhost:3001',
    clientUrl: process.env.CLIENT_URL || process.env.VITE_CLIENT_URL || 'http://localhost:8080',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },

  security: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  },
};

export default config;

export function validateConfig() {
  const required = [];
  
  if (!config.database.connectionString) {
    required.push('DATABASE_URL or NEON_DATABASE_URL');
  }
  
  if (!config.ai.geminiApiKey && !config.ai.openaiApiKey && !config.ai.minimaxApiKey) {
    required.push('At least one AI provider API key (GEMINI_API_KEY, OPENAI_API_KEY, or MINIMAX_API_KEY)');
  }
  
  if (required.length > 0) {
    throw new Error(`Missing required environment variables:\n${required.join('\n')}`);
  }
  
  return true;
}

export function getConfigSummary() {
  return {
    environment: config.env,
    serverPort: config.server.port,
    aiProvider: config.ai.provider,
    hasDatabase: !!config.database.connectionString,
    hasGemini: !!config.ai.geminiApiKey,
    hasOpenAI: !!config.ai.openaiApiKey,
    hasMiniMax: !!config.ai.minimaxApiKey,
    rateLimitApi: `${config.rateLimit.apiMax} requests per ${config.rateLimit.apiWindowMs / 60000} minutes`,
    rateLimitAi: `${config.rateLimit.aiMax} requests per ${config.rateLimit.aiWindowMs / 60000} minute(s)`,
  };
}
