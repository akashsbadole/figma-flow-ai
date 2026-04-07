import express from 'express';
import cors from 'cors';
import pg from 'pg';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { processSVG, extractTokensFromSVG } from './utils/svg_processor.js';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.VITE_DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many AI requests, please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);

// Standardized API Response Format
class ApiError extends Error {
  constructor(statusCode, message, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

function errorResponse(res, statusCode, message, code = 'ERROR') {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
    },
  });
}

function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

// Centralized Auth Middleware
async function authMiddleware(req, res, next) {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return errorResponse(res, 401, 'Unauthorized - Authentication required', 'UNAUTHORIZED');
    }

    const userId = await resolveUserId(rawUserId, req);
    if (!userId) {
      return errorResponse(res, 401, 'Unauthorized - User not found', 'UNAUTHORIZED');
    }

    // Check if user is enabled
    const profileResult = await pool.query(
      'SELECT is_enabled FROM public.profiles WHERE user_id = $1',
      [userId]
    );

    if (profileResult.rows.length > 0 && profileResult.rows[0].is_enabled === false) {
      return errorResponse(res, 403, 'Your account has been disabled. Please contact support.', 'ACCOUNT_DISABLED');
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 401, 'Authentication failed', 'AUTH_FAILED');
  }
}

// Admin Auth Middleware
async function adminAuthMiddleware(req, res, next) {
  try {
    const rawUserId = getUserId(req);
    if (!rawUserId) {
      return errorResponse(res, 401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const userId = await resolveUserId(rawUserId, req);
    if (!userId) {
      return errorResponse(res, 401, 'Unauthorized', 'UNAUTHORIZED');
    }

    // Check if user is enabled
    const profileResult = await pool.query(
      'SELECT is_enabled FROM public.profiles WHERE user_id = $1',
      [userId]
    );

    if (profileResult.rows.length > 0 && profileResult.rows[0].is_enabled === false) {
      return errorResponse(res, 403, 'Your account has been disabled. Please contact support.', 'ACCOUNT_DISABLED');
    }

    // Check if user is an admin in users table
    const adminCheck = await pool.query(
      'SELECT role FROM public.users WHERE id = $1',
      [userId]
    );

    let isAdmin = adminCheck.rows.length > 0 && adminCheck.rows[0].role === 'admin';

    if (!isAdmin) {
      // Check user_roles table as well
      const roleCheck = await pool.query(
        "SELECT role FROM public.user_roles WHERE user_id = $1 AND role = 'admin'",
        [userId]
      );
      isAdmin = roleCheck.rows.length > 0;
    }
    
    if (!isAdmin) {
      return errorResponse(res, 403, 'Forbidden - Admin access required', 'FORBIDDEN');
    }
    
    req.userId = userId;
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return errorResponse(res, 500, 'Admin verification failed', 'ADMIN_CHECK_FAILED');
  }
}

// AI Provider Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // Options: 'gemini', 'openai', 'minimax'

// Initialize AI clients
let geminiModel = null;
let openAIClient = null;
let miniMaxClient = null;

// Initialize Gemini
if (process.env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Use gemini-1.5-flash as the default stable model
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  geminiModel = genAI.getGenerativeModel({ model: modelName });
}

// Initialize OpenAI (also works for Claude via OpenAI-compatible APIs)
if (process.env.OPENAI_API_KEY) {
  openAIClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// MiniMax (uses OpenAI-compatible API)
if (process.env.MINIMAX_API_KEY) {
  miniMaxClient = new OpenAI({
    apiKey: process.env.MINIMAX_API_KEY,
    baseURL: process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1',
  });
}

// Unified AI chat function
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function chatWithAI(messages, options = {}) {
  const { temperature = 0.7, model = 'gpt-4o' } = options;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      switch (AI_PROVIDER) {
        case 'gemini':
          if (!geminiModel) throw new Error('Gemini not configured');
          const prompt = messages.map(m => m.content).join('\n\n');
          const result = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature, responseMimeType: 'application/json' },
          });
          const text = result.response.text();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          return JSON.parse(jsonMatch ? jsonMatch[0] : text);

        case 'minimax':
          if (!miniMaxClient) throw new Error('MiniMax not configured');
          const miniResponse = await miniMaxClient.chat.completions.create({
            model: model,
            messages,
            temperature,
            response_format: { type: 'json_object' },
          });
          return JSON.parse(miniResponse.choices[0].message.content);

        case 'openai':
        default:
          if (!openAIClient) throw new Error('OpenAI not configured');
          const openaiResponse = await openAIClient.chat.completions.create({
            model: model,
            messages,
            temperature,
            response_format: { type: 'json_object' },
          });
          return JSON.parse(openaiResponse.choices[0].message.content);
      }
    } catch (error) {
      lastError = error;
      console.error(`AI Provider (${AI_PROVIDER}) Error (attempt ${attempt}/${MAX_RETRIES}):`, error.message);
      
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        await sleep(RETRY_DELAY * attempt);
      } else {
        break;
      }
    }
  }
  
  throw new Error(`AI request failed after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`);
}

function isRetryableError(error) {
  const retryableMessages = ['timeout', 'ECONNRESET', 'ETIMEDOUT', 'rate limit', '429', '503', '502'];
  return retryableMessages.some(msg => error.message?.toLowerCase().includes(msg.toLowerCase()));
}

// Image analysis with AI
async function analyzeImageWithAI(image, prompt, options = {}) {
  const { temperature = 0.7, systemPrompt } = options;

  switch (AI_PROVIDER) {
    case 'gemini':
      if (!geminiModel) throw new Error('Gemini not configured');
      const imageData = image.replace(/^data:image\/\w+;base64,/, '');
      const result = await geminiModel.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: `${systemPrompt ? `${systemPrompt}\n\n` : ""}${prompt}` },
            { inlineData: { data: imageData, mimeType: 'image/jpeg' } }
          ]
        }],
        generationConfig: { temperature, responseMimeType: 'application/json' },
      });
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);

    case 'minimax':
    case 'openai':
    default:
      // For OpenAI/MiniMax, we'll send the image URL or base64
      const client = AI_PROVIDER === 'minimax' ? miniMaxClient : openAIClient;
      if (!client) throw new Error(`${AI_PROVIDER} not configured`);
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image } }
          ]
        }],
        temperature,
        response_format: { type: 'json_object' },
      });
      return JSON.parse(response.choices[0].message.content);
  }
}

console.log(`AI Provider: ${AI_PROVIDER}`);


const getUserId = (req) => {
  return req.headers['x-user-id'] || req.headers['authorization']?.replace('Bearer ', '');
};

// Check if a user ID is a Clerk ID (starts with "user_")
const isClerkId = (userId) => {
  return userId && userId.startsWith('user_');
};

// Check if a user ID is a valid UUID
const isUUID = (userId) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return userId && uuidRegex.test(userId);
};

// Look up Supabase UUID from Clerk ID
const getSupabaseIdFromClerkId = async (clerkId) => {
  try {
    const result = await pool.query(
      'SELECT supabase_id FROM clerk_id_mapping WHERE clerk_id = $1',
      [clerkId]
    );
    if (result.rows.length > 0) {
      return result.rows[0].supabase_id;
    }
    return null;
  } catch (error) {
    console.error('Error looking up Clerk ID mapping:', error);
    return null;
  }
};

// Create a new Supabase user and mapping for a Clerk user
const createSupabaseUserForClerkUser = async (clerkId, email = null) => {
  try {
    // Generate a new UUID for the Supabase user using PostgreSQL's built-in function
    const result = await pool.query('SELECT gen_random_uuid() as uuid');
    const supabaseId = result.rows[0].uuid;

    // Create entry in users table first to satisfy foreign key constraints
    await pool.query(
      'INSERT INTO public.users (id, email, role) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email WHERE public.users.email IS NULL',
      [supabaseId, email, 'user']
    );

    // Insert the mapping
    await pool.query(
      'INSERT INTO clerk_id_mapping (clerk_id, supabase_id) VALUES ($1, $2) ON CONFLICT (clerk_id) DO UPDATE SET supabase_id = $2',
      [clerkId, supabaseId]
    );

    console.log(`Created new Supabase user mapping: Clerk ${clerkId} -> Supabase ${supabaseId}${email ? ` (${email})` : ''}`);
    return supabaseId;
  } catch (error) {
    console.error('Error creating Supabase user for Clerk user:', error);
    return null;
  }
};

// Get the resolved user ID (translates Clerk ID to Supabase UUID if needed)
const resolveUserId = async (userId, req = null) => {
  if (!userId) return null;

  // If it's already a UUID, return it directly
  if (isUUID(userId)) {
    return userId;
  }

  // If it's a Clerk ID, look up or create the mapping
  if (isClerkId(userId)) {
    try {
      // First try to find existing mapping
      let supabaseId = await getSupabaseIdFromClerkId(userId);

      // If no mapping exists, create a new Supabase user
      if (!supabaseId) {
        // Try to get email from request headers if provided
        const email = req?.headers?.['x-user-email'];
        supabaseId = await createSupabaseUserForClerkUser(userId, email);
      }

      return supabaseId;
    } catch (e) {
      console.error('resolveUserId error:', e);
      return null;
    }
  }

  // If it's not a Clerk ID and not a UUID, return as-is (fallback)
  return userId;
};

app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM public.projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    successResponse(res, result.rows, 'Projects retrieved');
  } catch (error) {
    console.error('API Error - /api/projects:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/templates', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, html_code, css_code, svg_code, tags, metadata } = req.body;
    if (!name || !category) {
      return errorResponse(res, 400, 'Name and category are required', 'VALIDATION_ERROR');
    }

    const result = await pool.query(
      `INSERT INTO public.templates (name, description, category, html_code, css_code, svg_code, tags, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description, category, html_code || '', css_code || '', svg_code, tags || [], metadata || {}]
    );
    successResponse(res, result.rows[0], 'Template created', 201);
  } catch (error) {
    console.error('API Error - /api/templates (POST):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description, type } = req.body;

    const result = await pool.query(
      `UPDATE public.projects
       SET name = COALESCE($1, name), description = COALESCE($2, description),
           type = COALESCE($3, type), updated_at = NOW()
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [name, description, type, req.params.id, userId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Project not found', 'NOT_FOUND');
    }

    successResponse(res, result.rows[0], 'Project updated');
  } catch (error) {
    console.error('API Error - /api/projects/:id (PUT):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { name, description, type } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return errorResponse(res, 400, 'Project name is required', 'VALIDATION_ERROR');
    }

    const result = await pool.query(
      'INSERT INTO public.projects (user_id, name, description, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name.trim(), description, type]
    );
    successResponse(res, result.rows[0], 'Project created', 201);
  } catch (error) {
    console.error('API Error - /api/projects (POST):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.put('/api/designs/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt, html_code, css_code, svg_code, image_url, metadata } = req.body;

    const result = await pool.query(
      `UPDATE public.designs
       SET prompt = COALESCE($1, prompt), html_code = COALESCE($2, html_code),
           css_code = COALESCE($3, css_code), svg_code = COALESCE($4, svg_code),
           image_url = COALESCE($5, image_url), metadata = COALESCE($6, metadata),
           updated_at = NOW()
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [prompt, html_code, css_code, svg_code, image_url, metadata, req.params.id, userId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Design not found', 'NOT_FOUND');
    }

    successResponse(res, result.rows[0], 'Design updated');
  } catch (error) {
    console.error('API Error - /api/designs/:id (PUT):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'DELETE FROM public.projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, userId]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Project not found', 'NOT_FOUND');
    }
    
    successResponse(res, { id: req.params.id }, 'Project deleted');
  } catch (error) {
    console.error('API Error - /api/projects/:id (DELETE):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/designs', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM public.designs WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    successResponse(res, result.rows, 'Designs retrieved');
  } catch (error) {
    console.error('API Error - /api/designs:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/designs/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM public.designs WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Design not found', 'NOT_FOUND');
    }
    
    successResponse(res, result.rows[0], 'Design retrieved');
  } catch (error) {
    console.error('API Error - /api/designs/:id:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/designs', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { project_id, prompt, html_code, css_code, svg_code, image_url, metadata } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return errorResponse(res, 400, 'Prompt is required', 'VALIDATION_ERROR');
    }

    if (project_id) {
      const projectCheck = await pool.query(
        'SELECT id FROM public.projects WHERE id = $1 AND user_id = $2',
        [project_id, userId]
      );
      if (projectCheck.rows.length === 0) {
        return errorResponse(res, 403, 'Forbidden - Project not found or access denied', 'FORBIDDEN');
      }
    }

    const result = await pool.query(
      `INSERT INTO public.designs (user_id, project_id, prompt, html_code, css_code, svg_code, image_url, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, project_id, prompt, html_code, css_code, svg_code, image_url, metadata]
    );
    successResponse(res, result.rows[0], 'Design created', 201);
  } catch (error) {
    console.error('API Error - /api/designs (POST):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.delete('/api/designs/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'DELETE FROM public.designs WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, userId]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Design not found', 'NOT_FOUND');
    }
    
    successResponse(res, { id: req.params.id }, 'Design deleted');
  } catch (error) {
    console.error('API Error - /api/designs/:id (DELETE):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/templates', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.templates ORDER BY created_at DESC');
    successResponse(res, result.rows, 'Templates retrieved');
  } catch (error) {
    console.error('API Error - /api/templates:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/templates/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.templates WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Template not found', 'NOT_FOUND');
    }
    
    successResponse(res, result.rows[0], 'Template retrieved');
  } catch (error) {
    console.error('API Error - /api/templates/:id:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/saved-templates', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT t.* FROM public.templates t
       JOIN public.saved_templates st ON st.template_id = t.id
       WHERE st.user_id = $1`,
      [userId]
    );
    successResponse(res, result.rows, 'Saved templates retrieved');
  } catch (error) {
    console.error('API Error - /api/saved-templates:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/saved-templates', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { template_id } = req.body;
    
    if (!template_id) {
      return errorResponse(res, 400, 'Template ID is required', 'VALIDATION_ERROR');
    }

    await pool.query(
      'INSERT INTO public.saved_templates (user_id, template_id) VALUES ($1, $2)',
      [userId, template_id]
    );
    successResponse(res, { template_id }, 'Template saved');
  } catch (error) {
    console.error('API Error - /api/saved-templates (POST):', error);
    if (error.code === '23505') {
      return errorResponse(res, 409, 'Template already saved', 'DUPLICATE');
    }
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.delete('/api/saved-templates/:templateId', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'DELETE FROM public.saved_templates WHERE user_id = $1 AND template_id = $2 RETURNING id',
      [userId, req.params.templateId]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Saved template not found', 'NOT_FOUND');
    }
    
    successResponse(res, { template_id: req.params.templateId }, 'Template removed from saved');
  } catch (error) {
    console.error('API Error - /api/saved-templates/:templateId (DELETE):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/design-systems', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'SELECT * FROM public.design_systems WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    successResponse(res, result.rows, 'Design systems retrieved');
  } catch (error) {
    console.error('API Error - /api/design-systems:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/design-systems/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'SELECT * FROM public.design_systems WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Design system not found', 'NOT_FOUND');
    }
    successResponse(res, result.rows[0], 'Design system retrieved');
  } catch (error) {
    console.error('API Error - /api/design-systems/:id:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/design-systems', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { project_id, name, colors, typography, spacing, components } = req.body;
    if (!name || typeof name !== 'string') {
      return errorResponse(res, 400, 'Design system name is required', 'VALIDATION_ERROR');
    }

    if (project_id) {
      const projectCheck = await pool.query(
        'SELECT id FROM public.projects WHERE id = $1 AND user_id = $2',
        [project_id, userId]
      );
      if (projectCheck.rows.length === 0) {
        return errorResponse(res, 403, 'Forbidden - Project not found or access denied', 'FORBIDDEN');
      }
    }

    const result = await pool.query(
      `INSERT INTO public.design_systems (user_id, project_id, name, colors, typography, spacing, components) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, project_id, name, colors, typography, spacing, components]
    );
    successResponse(res, result.rows[0], 'Design system created', 201);
  } catch (error) {
    console.error('API Error - /api/design-systems (POST):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.put('/api/design-systems/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, colors, typography, spacing, components } = req.body;
    const result = await pool.query(
      `UPDATE public.design_systems
       SET name = COALESCE($1, name), colors = COALESCE($2, colors),
           typography = COALESCE($3, typography), spacing = COALESCE($4, spacing),
           components = COALESCE($5, components), updated_at = NOW()
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [name, colors, typography, spacing, components, req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Design system not found', 'NOT_FOUND');
    }
    successResponse(res, result.rows[0], 'Design system updated');
  } catch (error) {
    console.error('API Error - /api/design-systems (PUT):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/generation-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM public.generation_history WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    successResponse(res, result.rows, 'Generation history retrieved');
  } catch (error) {
    console.error('API Error - /api/generation-history:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/generation-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { type, prompt, result, metadata } = req.body;
    
    if (!type || !prompt) {
      return errorResponse(res, 400, 'Type and prompt are required', 'VALIDATION_ERROR');
    }

    const result_db = await pool.query(
      `INSERT INTO public.generation_history (user_id, type, prompt, result, metadata) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type, prompt, result, metadata]
    );
    successResponse(res, result_db.rows[0], 'Generation history entry created', 201);
  } catch (error) {
    console.error('API Error - /api/generation-history (POST):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.delete('/api/design-systems/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'DELETE FROM public.design_systems WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, userId]
    );
    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Design system not found', 'NOT_FOUND');
    }
    successResponse(res, { id: req.params.id }, 'Design system deleted');
  } catch (error) {
    console.error('API Error - /api/design-systems (DELETE):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.delete('/api/generation-history/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'DELETE FROM public.generation_history WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, userId]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'History entry not found', 'NOT_FOUND');
    }
    
    successResponse(res, { id: req.params.id }, 'History entry deleted');
  } catch (error) {
    console.error('API Error - /api/generation-history/:id (DELETE):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/subscription', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    let result = await pool.query(
      'SELECT * FROM public.user_subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      try {
        result = await pool.query(
          'INSERT INTO public.user_subscriptions (user_id, plan, status, generations_limit) VALUES ($1, $2, $3, $4) RETURNING *',
          [userId, 'free', 'active', 5]
        );
      } catch (insertError) {
        if (insertError.code === '23505') {
          result = await pool.query(
            'SELECT * FROM public.user_subscriptions WHERE user_id = $1',
            [userId]
          );
        } else {
          throw insertError;
        }
      }
    }

    successResponse(res, result.rows[0], 'Subscription retrieved');
  } catch (error) {
    console.error('API Error - /api/subscription:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/increment-usage', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    await pool.query(
      'UPDATE public.user_subscriptions SET generations_used = generations_used + 1, updated_at = now() WHERE user_id = $1',
      [userId]
    );
    successResponse(res, null, 'Usage incremented');
  } catch (error) {
    console.error('API Error - /api/increment-usage:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/admin/users', adminAuthMiddleware, async (req, res) => {
  try {
    const profiles = await pool.query('SELECT * FROM public.profiles');
    const subscriptions = await pool.query('SELECT * FROM public.user_subscriptions');
    const roles = await pool.query('SELECT * FROM public.user_roles');

    successResponse(res, { profiles: profiles.rows, subscriptions: subscriptions.rows, roles: roles.rows }, 'Admin data retrieved');
  } catch (error) {
    console.error('API Error - /api/admin/users:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/admin/update-role', adminAuthMiddleware, async (req, res) => {
  try {
    const { user_id, role } = req.body;
    
    if (!user_id || !role) {
      return errorResponse(res, 400, 'User ID and role are required', 'VALIDATION_ERROR');
    }

    await pool.query(
      'INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO UPDATE SET role = $2',
      [user_id, role]
    );
    successResponse(res, { user_id, role }, 'User role updated');
  } catch (error) {
    console.error('API Error - /api/admin/update-role:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/admin/update-subscription', adminAuthMiddleware, async (req, res) => {
  try {
    const { user_id, plan, status, generations_limit } = req.body;
    
    if (!user_id) {
      return errorResponse(res, 400, 'User ID is required', 'VALIDATION_ERROR');
    }

    await pool.query(
      'UPDATE public.user_subscriptions SET plan = $1, status = $2, generations_limit = $3, updated_at = now() WHERE user_id = $4',
      [plan, status, generations_limit, user_id]
    );
    successResponse(res, { user_id, plan, status, generations_limit }, 'Subscription updated');
  } catch (error) {
    console.error('API Error - /api/admin/update-subscription:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/admin/toggle-user', adminAuthMiddleware, async (req, res) => {
  try {
    const { user_id, is_enabled } = req.body;
    
    if (!user_id || typeof is_enabled !== 'boolean') {
      return errorResponse(res, 400, 'User ID and is_enabled are required', 'VALIDATION_ERROR');
    }

    await pool.query(
      'UPDATE public.profiles SET is_enabled = $1, updated_at = now() WHERE user_id = $2',
      [is_enabled, user_id]
    );
    successResponse(res, { user_id, is_enabled }, 'User status toggled');
  } catch (error) {
    console.error('API Error - /api/admin/toggle-user:', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { display_name, avatar_url } = req.body;

    const existing = await pool.query('SELECT * FROM public.profiles WHERE user_id = $1', [userId]);

    let result;
    if (existing.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO public.profiles (user_id, display_name, avatar_url) VALUES ($1, $2, $3) RETURNING *',
        [userId, display_name || 'User', avatar_url]
      );
      return successResponse(res, result.rows[0], 'Profile created', 201);
    }

    result = await pool.query(
      'UPDATE public.profiles SET display_name = $1, avatar_url = $2, updated_at = now() WHERE user_id = $3 RETURNING *',
      [display_name, avatar_url, userId]
    );
    successResponse(res, result.rows[0], 'Profile updated');
  } catch (error) {
    console.error('API Error - /api/profile (POST):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    let result = await pool.query('SELECT * FROM public.profiles WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      try {
        result = await pool.query(
          'INSERT INTO public.profiles (user_id, display_name) VALUES ($1, $2) RETURNING *',
          [userId, 'User']
        );
      } catch (insertError) {
        if (insertError.code === '23505') {
          result = await pool.query('SELECT * FROM public.profiles WHERE user_id = $1', [userId]);
        } else {
          throw insertError;
        }
      }
    }

    successResponse(res, result.rows[0], 'Profile retrieved');
  } catch (error) {
    console.error('API Error - /api/profile (GET):', error);
    errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.post('/api/ai/feedback', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { variantId, rating, feedback } = req.body;

    if (!variantId || rating === undefined) {
      return errorResponse(res, 400, 'Variant ID and rating are required', 'VALIDATION_ERROR');
    }

    // Store feedback in generation_history as a special type or a dedicated table if available
    // For now, let's use generation_history with type 'user-feedback'
    await pool.query(
      `INSERT INTO public.generation_history (user_id, type, prompt, result, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, 'user-feedback', variantId, { rating }, { feedback }]
    );

    successResponse(res, null, 'Feedback submitted');
  } catch (error) {
    console.error('Feedback error:', error);
    errorResponse(res, 500, error.message, 'INTERNAL_ERROR');
  }
});

app.post('/api/ai/enhance-prompt', authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return errorResponse(res, 400, 'Prompt is required', 'VALIDATION_ERROR');
    }

    const systemPrompt = `You are an expert prompt engineer for a UI design AI.
Your goal is to take a simple user prompt and enhance it into a detailed, professional design brief.
Also, identify 2-4 key parameters that can be adjusted (e.g., "Primary Color", "Corner Radius", "Number of Columns").

## SCHEMA
{
  "enhancedPrompt": "...",
  "parameters": [
    { "label": "Primary Color", "value": "#...", "type": "color" },
    { "label": "Columns", "value": "3", "type": "number" }
  ]
}`;

    const userPrompt = `Enhance this UI design prompt: "${prompt}"`;

    const result = await chatWithAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    successResponse(res, result, 'Prompt enhanced');
  } catch (error) {
    console.error('Enhance prompt error:', error);
    errorResponse(res, 500, error.message, 'AI_ERROR');
  }
});

app.post('/api/ai/generate-design', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { prompt, deviceType, variantCount = 4, referenceImage } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return errorResponse(res, 400, 'Prompt is required and must be a non-empty string', 'VALIDATION_ERROR');
    }

    if (prompt.length > 5000) {
      return errorResponse(res, 400, 'Prompt must be less than 5000 characters', 'VALIDATION_ERROR');
    }

    const validVariantCounts = [1, 2, 4, 6, 8];
    if (!validVariantCounts.includes(variantCount)) {
      return errorResponse(res, 400, 'Variant count must be 1, 2, 4, 6, or 8', 'VALIDATION_ERROR');
    }

    const validDeviceTypes = ['mobile', 'tablet', 'desktop'];
    if (deviceType && !validDeviceTypes.includes(deviceType)) {
      return errorResponse(res, 400, 'Device type must be mobile, tablet, or desktop', 'VALIDATION_ERROR');
    }

    const deviceConfig = {
      mobile: { width: 390, height: 844, label: 'Mobile' },
      tablet: { width: 768, height: 1024, label: 'Tablet' },
      desktop: { width: 1280, height: 800, label: 'Desktop' },
    };
    const device = deviceConfig[deviceType] || deviceConfig.mobile;

    const systemPrompt = `You are an expert UI designer. Generate beautiful, modern designs based on the user's prompt.
Return a JSON response with exactly ${variantCount} variants.

## DESIGN CATEGORIES
- UI_COMPONENT (button, input, card, etc.)
- PAGE_LAYOUT (landing, dashboard, settings)
- SYSTEM_DESIGN (architecture, flowcharts, ERD)
- DATA_VIZ (bar charts, line charts, pie charts)
- INFOGRAPHIC (timelines, process steps)
- ICON_SET (24x24 grid icons)
- LOGO (wordmarks, monograms)
- WIREFRAME (grayscale, low-fidelity)

## SVG RULES (CRITICAL)
- Standalone SVGs with xmlns and viewBox="0 0 ${device.width} ${device.height}".
- Use native SVG elements ONLY: <rect>, <text>, <circle>, <path>, <g>, <linearGradient>.
- NO foreignObject, NO embedded HTML, NO <style> tags.
- All colors must be hex codes.
- Use <text> with font-family, font-size, font-weight, fill, and x/y/text-anchor.
- Manual text wrapping: use <tspan> with dy for multi-line text.
- Group logical components with descriptive ids.
- IMPORTANT: Use consistent 'id' or 'data-name' attributes for key UI elements in BOTH the HTML and SVG code to ensure synchronization between the preview and layers.

## SCHEMA
{
  "variants": [
    { "id": "v1", "name": "Name", "html": "...", "css": "...", "svg": "..." }
  ]
}`;

    const userPrompt = `Create ${variantCount} UI design variants for: "${prompt}"
Device: ${device.label} (${device.width}x${device.height})
${referenceImage ? "I have also provided a reference image to guide the style and layout." : ""}

Respond in JSON format:
{
  "variants": [
    { "id": "variant-1", "name": "Variant Name", "html": "...", "css": "...", "svg": "<svg viewBox=\\"0 0 ${device.width} ${device.height}\\" xmlns=\\"http://www.w3.org/2000/svg\\">...</svg>" }
  ]
}

Make sure each SVG is valid, complete, and will paste directly into Figma as editable vector layers.`;

    let result;
    if (referenceImage) {
      result = await analyzeImageWithAI(referenceImage, userPrompt, { systemPrompt });
    } else {
      result = await chatWithAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);
    }

    // Post-process SVGs
    if (result.variants && Array.isArray(result.variants)) {
      result.variants = result.variants.map(v => {
        v.svg = processSVG(v.svg, v.name);
        return v;
      });
    }

    successResponse(res, {
      ...result,
      deviceType,
      deviceWidth: device.width,
      deviceHeight: device.height,
      deviceLabel: device.label,
    }, 'Design generated successfully');
  } catch (error) {
    console.error('Generate design error:', error);
    errorResponse(res, 500, error.message, 'AI_ERROR');
  }
});

app.post('/api/ai/generate-full-design', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { prompt, deviceType = 'desktop', variantCount = 4, referenceImage } = req.body;

    const deviceConfig = {
      mobile: { width: 390, height: 844, label: 'Mobile' },
      tablet: { width: 768, height: 1024, label: 'Tablet' },
      desktop: { width: 1440, height: 900, label: 'Desktop' },
    };
    const device = deviceConfig[deviceType] || deviceConfig.desktop;

    const systemPrompt = `You are an expert AI design system and UI generator.
Your goal is to produce a complete design package that imports perfectly into Figma as clean, editable vectors.

## OUTPUT FORMAT
Return a JSON object containing variants, a design system, and template suggestions.

## SVG RULES (CRITICAL)
- Standalone SVGs with xmlns and viewBox="0 0 ${device.width} ${device.height}".
- Use native SVG elements ONLY: <rect>, <text>, <circle>, <path>, <g>, <linearGradient>.
- NO foreignObject, NO embedded HTML, NO <style> tags.
- All colors must be hex codes.
- Use <text> with font-family, font-size, font-weight, fill, and x/y/text-anchor.
- Manual text wrapping: use <tspan> with dy for multi-line text.
- Group logical components with descriptive ids (e.g., id="Navbar", id="Hero-Section").
- IMPORTANT: Use consistent 'id' or 'data-name' attributes for key UI elements in BOTH the HTML and SVG code to ensure synchronization between the preview and layers.

## DESIGN STYLES
- SYSTEM_DESIGN: Diagrams with services, databases, arrows, and labels.
- DATA_VIZ: Charts with axes, bars/lines, grid lines, and legends.
- INFOGRAPHIC: Timelines, roadmaps, or process steps with icons and text.
- UI_COMPONENT/PAGE_LAYOUT: Modern web/mobile interfaces with proper spacing and hierarchy.

## SCHEMA
{
  "variants": [
    { "id": "v1", "name": "Minimalist", "svg": "...", "html": "...", "css": "...", "metadata": { "type": "PAGE_LAYOUT", "extractedTokens": { "colors": [], "fonts": [] } } }
  ],
  "designSystem": {
    "name": "Brand Design System",
    "colors": { "primary": "#...", "secondary": "#...", "neutral": "#..." },
    "typography": { "fontFamily": "Inter, sans-serif", "scale": [12, 14, 16, 20, 24, 32] },
    "spacing": [4, 8, 12, 16, 24, 32, 48, 64]
  },
  "templates": {
    "screens": [],
    "components": [],
    "layouts": [],
    "formPatterns": [],
    "dataDisplay": [],
    "navigationPatterns": []
  }
}`;

    const userPrompt = `Generate a full design package for: "${prompt}"
Device: ${device.label} (${device.width}x${device.height})
Variant Count: ${variantCount}
${referenceImage ? "Use the provided reference image for layout and aesthetic guidance." : ""}

Produce ${variantCount} high-quality design variants. Ensure SVGs are Figma-optimized.
Also identify the primary design category for this request (e.g., UI_COMPONENT, PAGE_LAYOUT, SYSTEM_DESIGN, DATA_VIZ, INFOGRAPHIC).`;

    let result;
    if (referenceImage) {
      result = await analyzeImageWithAI(referenceImage, userPrompt, { systemPrompt });
    } else {
      result = await chatWithAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.8 });
    }

    // Post-process SVGs and extract tokens if not already provided by AI
    if (result.variants && Array.isArray(result.variants)) {
      result.variants = result.variants.map(v => {
        v.svg = processSVG(v.svg, v.name);
        if (!v.metadata) v.metadata = {};
        v.metadata.extractedTokens = extractTokensFromSVG(v.svg);
        return v;
      });
    }

    // Fetch relevant templates from database to augment the AI response
    // This reduces the reliance on AI for standard templates
    let dbTemplates = [];
    try {
      const category = result.variants?.[0]?.metadata?.type || 'PAGE_LAYOUT';
      const templateResult = await pool.query(
        'SELECT id, name, category, html_code, css_code, svg_code, metadata FROM public.templates WHERE metadata->>\'type\' = $1 OR category ILIKE $2 LIMIT 6',
        [category, `%${category}%`]
      );

      dbTemplates = templateResult.rows.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        html: t.html_code || '',
        css: t.css_code || '',
        svg: t.svg_code,
        metadata: t.metadata
      }));
    } catch (dbError) {
      console.error('Error fetching augmented templates:', dbError);
    }

    // Merge DB templates into the response if AI didn't provide enough or as additional options
    if (result.templates) {
      const existingScreens = result.templates.screens || [];
      result.templates.screens = [...existingScreens, ...dbTemplates.filter(t => t.metadata?.type === 'PAGE_LAYOUT')].slice(0, 8);

      const existingComps = result.templates.components || [];
      result.templates.components = [...existingComps, ...dbTemplates.filter(t => t.metadata?.type === 'UI_COMPONENT')].slice(0, 8);
    } else {
      result.templates = {
        screens: dbTemplates.filter(t => t.metadata?.type === 'PAGE_LAYOUT'),
        components: dbTemplates.filter(t => t.metadata?.type === 'UI_COMPONENT'),
        layouts: [],
        formPatterns: dbTemplates.filter(t => t.metadata?.subtype === 'form'),
        dataDisplay: dbTemplates.filter(t => t.metadata?.type === 'DATA_VIZ'),
        navigationPatterns: dbTemplates.filter(t => t.category === 'Navigation')
      };
    }

    successResponse(res, {
      ...result,
      deviceInfo: device
    }, 'Full design package generated');
  } catch (error) {
    console.error('Full design generation error:', error);
    errorResponse(res, 500, error.message, 'AI_ERROR');
  }
});

app.post('/api/ai/generate-design-system', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return errorResponse(res, 400, 'Prompt is required', 'VALIDATION_ERROR');
    }

    const systemPrompt = `You are a design system expert. Create a comprehensive design system based on the user's brand description.
Return a JSON object with all design tokens needed for a complete design system.`;

    const userPrompt = `Create a design system for: "${prompt}"

Return JSON with:
{
  "name": "Brand Name",
  "colors": { "primary": "#hex", "secondary": "#hex", ... },
  "typography": { "fontFamily": "...", "headings": {...}, "body": {...} },
  "spacing": { "xs": "4px", "sm": "8px", "md": "16px", ... },
  "components": { "button": {...}, "card": {...}, ... },
  "breakpoints": [...],
  "shadows": {...},
  "borderRadius": {...}
}`;

    const designSystem = await chatWithAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    successResponse(res, { designSystem }, 'Design system generated');
  } catch (error) {
    console.error('Generate design system error:', error);
    errorResponse(res, 500, error.message, 'AI_ERROR');
  }
});

app.post('/api/ai/generate-templates', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { prompt, deviceType } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return errorResponse(res, 400, 'Prompt is required', 'VALIDATION_ERROR');
    }

    const systemPrompt = `You are a UI template expert. Generate ready-to-use UI templates based on the user's request.`;

    const userPrompt = `Create UI templates for: "${prompt}" (${deviceType || 'desktop'})

Return JSON with arrays of templates:
{
  "screens": [...],
  "components": [...],
  "pageLayouts": [...],
  "formPatterns": [...],
  "dataDisplay": [...],
  "navigationPatterns": [...]
}`;

    const result = await chatWithAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    successResponse(res, result, 'Templates generated');
  } catch (error) {
    console.error('Generate templates error:', error);
    errorResponse(res, 500, error.message, 'AI_ERROR');
  }
});

app.post('/api/ai/image-to-design', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { image, prompt } = req.body;

    if (!image) {
      return errorResponse(res, 400, 'Image is required', 'MISSING_IMAGE');
    }

    const systemPrompt = `You are an expert UI designer. Analyze the provided image and convert it to clean, semantic HTML/CSS code.`;

    const userPrompt = `Analyze this design image and convert it to HTML/CSS code. ${prompt ? `Additional instructions: ${prompt}` : ''}

Return JSON:
{
  "html": "...",
  "css": "...",
  "react": "...",
  "tailwind": "..."
}`;

    const result = await analyzeImageWithAI(image, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    successResponse(res, result, 'Design converted from image');
  } catch (error) {
    console.error('Image to design error:', error);
    errorResponse(res, 500, error.message, 'AI_ERROR');
  }
});

// Email Service Configuration
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@figmaflow.ai';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

async function sendEmail({ to, subject, html }) {
  if (EMAIL_PROVIDER === 'resend' && RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject,
          html,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Resend API error:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return false;
    }
  }
  
  console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
  return true;
}

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

function generateVerificationToken() {
  return Buffer.from(`${Date.now()}-${Math.random().toString(36).substr(2)}`).toString('base64url');
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Create email verification table if not exists
async function ensureAuthTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.email_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        last_activity TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_token ON public.password_reset_tokens(token)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_email_verification_token ON public.email_verifications(token)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_session_token ON public.user_sessions(token)`);
    
    console.log('Auth tables ensured');
  } catch (error) {
    console.error('Failed to ensure auth tables:', error);
  }
}

ensureAuthTables();

// Auth Endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required', 'VALIDATION_ERROR');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM public.users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return errorResponse(res, 400, 'User already exists', 'USER_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(password);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO public.users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [normalizedEmail, passwordHash]
    );

    const userId = userResult.rows[0].id;

    // Create profile
    await pool.query(
      'INSERT INTO public.profiles (user_id, display_name) VALUES ($1, $2)',
      [userId, displayName || normalizedEmail.split('@')[0]]
    );

    // Create subscription
    await pool.query(
      'INSERT INTO public.user_subscriptions (user_id, plan, status, generations_limit) VALUES ($1, $2, $3, $4)',
      [userId, 'free', 'active', 5]
    );

    // Create user role
    await pool.query(
      'INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)',
      [userId, 'user']
    );

    successResponse(res, { id: userId, email: normalizedEmail }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    errorResponse(res, 500, 'Failed to register user', 'INTERNAL_ERROR');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required', 'VALIDATION_ERROR');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userResult = await pool.query(
      'SELECT id, email, password_hash FROM public.users WHERE email = $1',
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const user = userResult.rows[0];

    if (!user.password_hash) {
      return errorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return errorResponse(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Get profile data
    const profileResult = await pool.query(
      'SELECT display_name, avatar_url FROM public.profiles WHERE user_id = $1',
      [user.id]
    );

    const profile = profileResult.rows[0] || {};

    successResponse(res, {
      id: user.id,
      email: user.email,
      display_name: profile.display_name,
      imageUrl: profile.avatar_url
    }, 'Logged in successfully');
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 500, 'Failed to login', 'INTERNAL_ERROR');
  }
});

app.post('/api/auth/forgot-username', async (req, res) => {
  try {
    const { display_name } = req.body;

    if (!display_name || typeof display_name !== 'string') {
      return errorResponse(res, 400, 'Display name is required', 'VALIDATION_ERROR');
    }

    const profileResult = await pool.query(
      'SELECT p.user_id, u.email FROM public.profiles p JOIN public.users u ON p.user_id = u.id WHERE p.display_name = $1',
      [display_name.trim()]
    );

    if (profileResult.rows.length === 0) {
      return successResponse(res, null, 'If an account exists with this name, recovery info has been sent');
    }

    const email = profileResult.rows[0].email;

    if (!email) {
      return successResponse(res, null, 'If an account exists with this name, recovery info has been sent');
    }

    const html = `
      <h1>Username Recovery</h1>
      <p>You requested recovery for your Figma Flow AI account.</p>
      <p>The email associated with the display name "<strong>${display_name}</strong>" is: <strong>${email}</strong></p>
      <p>You can use this email to sign in or reset your password.</p>
    `;

    await sendEmail({
      to: email,
      subject: 'Username Recovery - Figma Flow AI',
      html,
    });

    successResponse(res, null, 'If an account exists with this name, recovery info has been sent');
  } catch (error) {
    console.error('Forgot username error:', error);
    errorResponse(res, 500, 'Failed to process request', 'INTERNAL_ERROR');
  }
});

app.post('/api/auth/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return errorResponse(res, 400, 'Email is required', 'VALIDATION_ERROR');
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    const userResult = await pool.query(
      'SELECT id FROM public.users WHERE email = $1',
      [normalizedEmail]
    );
    
    if (userResult.rows.length === 0) {
      return successResponse(res, null, 'If an account exists with this email, a reset link has been sent');
    }
    
    const userId = userResult.rows[0].id;
    
    const existingToken = await pool.query(
      'SELECT id FROM public.password_reset_tokens WHERE user_id = $1 AND used = FALSE AND expires_at > NOW()',
      [userId]
    );
    
    if (existingToken.rows.length > 0) {
      return successResponse(res, null, 'If an account exists with this email, a reset link has been sent');
    }
    
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    await pool.query(
      'INSERT INTO public.password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
    
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your Figma Flow AI account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:8px;">Reset Password</a>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    
    await sendEmail({
      to: normalizedEmail,
      subject: 'Password Reset - Figma Flow AI',
      html,
    });
    
    successResponse(res, null, 'If an account exists with this email, a reset link has been sent');
  } catch (error) {
    console.error('Password reset request error:', error);
    errorResponse(res, 500, 'Failed to process request', 'INTERNAL_ERROR');
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || typeof token !== 'string') {
      return errorResponse(res, 400, 'Reset token is required', 'VALIDATION_ERROR');
    }
    
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return errorResponse(res, 400, 'Password must be at least 8 characters', 'VALIDATION_ERROR');
    }
    
    const tokenResult = await pool.query(
      'SELECT user_id FROM public.password_reset_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
      [token]
    );
    
    if (tokenResult.rows.length === 0) {
      return errorResponse(res, 400, 'Invalid or expired reset token', 'INVALID_TOKEN');
    }
    
    const userId = tokenResult.rows[0].user_id;
    
    const passwordHash = await hashPassword(newPassword);
    
    await pool.query(
      'UPDATE public.users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
    
    await pool.query(
      'UPDATE public.password_reset_tokens SET used = TRUE WHERE token = $1',
      [token]
    );
    
    await pool.query(
      'DELETE FROM public.user_sessions WHERE user_id = $1',
      [userId]
    );
    
    successResponse(res, null, 'Password has been reset successfully');
  } catch (error) {
    console.error('Password reset error:', error);
    errorResponse(res, 500, 'Failed to reset password', 'INTERNAL_ERROR');
  }
});

app.post('/api/auth/request-email-verification', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const userResult = await pool.query(
      'SELECT email FROM public.users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return errorResponse(res, 404, 'User not found', 'NOT_FOUND');
    }
    
    const email = userResult.rows[0].email;
    
    await pool.query(
      'DELETE FROM public.email_verifications WHERE user_id = $1',
      [userId]
    );
    
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await pool.query(
      'INSERT INTO public.email_verifications (user_id, email, token, expires_at) VALUES ($1, $2, $3, $4)',
      [userId, email, token, expiresAt]
    );
    
    const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
    
    const html = `
      <h1>Email Verification</h1>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:8px;">Verify Email</a>
      <p>Or copy this link: ${verifyUrl}</p>
      <p>This link expires in 24 hours.</p>
    `;
    
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - Figma Flow AI',
      html,
    });
    
    successResponse(res, null, 'Verification email sent');
  } catch (error) {
    console.error('Email verification request error:', error);
    errorResponse(res, 500, 'Failed to send verification email', 'INTERNAL_ERROR');
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token || typeof token !== 'string') {
      return errorResponse(res, 400, 'Verification token is required', 'VALIDATION_ERROR');
    }
    
    const tokenResult = await pool.query(
      'SELECT user_id, email FROM public.email_verifications WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    
    if (tokenResult.rows.length === 0) {
      return errorResponse(res, 400, 'Invalid or expired verification token', 'INVALID_TOKEN');
    }
    
    const { user_id, email } = tokenResult.rows[0];
    
    await pool.query(
      'UPDATE public.email_verifications SET verified = TRUE WHERE token = $1',
      [token]
    );
    
    await pool.query(
      'UPDATE public.profiles SET email_verified = TRUE, updated_at = NOW() WHERE user_id = $1',
      [user_id]
    );
    
    successResponse(res, { email }, 'Email verified successfully');
  } catch (error) {
    console.error('Email verification error:', error);
    errorResponse(res, 500, 'Failed to verify email', 'INTERNAL_ERROR');
  }
});

app.get('/api/auth/check-verification', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await pool.query(
      'SELECT email_verified FROM public.profiles WHERE user_id = $1',
      [userId]
    );
    
    const verified = result.rows.length > 0 && result.rows[0].email_verified === true;
    
    successResponse(res, { verified });
  } catch (error) {
    console.error('Check verification error:', error);
    errorResponse(res, 500, 'Failed to check verification status', 'INTERNAL_ERROR');
  }
});

// Session Management
app.post('/api/auth/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      await pool.query('DELETE FROM public.user_sessions WHERE token = $1', [token]);
    }
    successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    successResponse(res, null, 'Logged out');
  }
});

app.get('/api/auth/sessions', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await pool.query(
      'SELECT id, created_at, last_activity, expires_at FROM public.user_sessions WHERE user_id = $1 AND expires_at > NOW() ORDER BY last_activity DESC',
      [userId]
    );
    
    successResponse(res, { sessions: result.rows });
  } catch (error) {
    console.error('Sessions error:', error);
    errorResponse(res, 500, 'Failed to fetch sessions', 'INTERNAL_ERROR');
  }
});

app.delete('/api/auth/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    await pool.query(
      'DELETE FROM public.user_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    
    successResponse(res, null, 'Session deleted');
  } catch (error) {
    console.error('Delete session error:', error);
    errorResponse(res, 500, 'Failed to delete session', 'INTERNAL_ERROR');
  }
});

// Payment Endpoints
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;

app.get('/api/payment/config', (req, res) => {
  successResponse(res, { 
    publicKey: STRIPE_PUBLIC_KEY || null,
    plans: [
      { id: 'free', name: 'Free', price: 0, generationsLimit: 5 },
      { id: 'pro', name: 'Pro', price: 19, generationsLimit: 100 },
      { id: 'enterprise', name: 'Enterprise', price: 79, generationsLimit: -1 },
    ]
  });
});

app.post('/api/payment/create-customer', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const userResult = await pool.query('SELECT email FROM public.users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return errorResponse(res, 404, 'User not found', 'NOT_FOUND');
    }

    const email = userResult.rows[0].email;
    
    const existingCustomer = await pool.query(
      'SELECT stripe_customer_id FROM public.user_subscriptions WHERE user_id = $1 AND stripe_customer_id IS NOT NULL',
      [userId]
    );

    if (existingCustomer.rows.length > 0) {
      return successResponse(res, { customerId: existingCustomer.rows[0].stripe_customer_id });
    }

    if (!STRIPE_PUBLIC_KEY) {
      return errorResponse(res, 500, 'Stripe not configured', 'STRIPE_NOT_CONFIGURED');
    }

    const { createStripeCustomer } = await import('./services/stripe.js');
    const customerId = await createStripeCustomer(email, userId);

    await pool.query(
      'UPDATE public.user_subscriptions SET stripe_customer_id = $1 WHERE user_id = $2',
      [customerId, userId]
    );

    successResponse(res, { customerId });
  } catch (error) {
    console.error('Create customer error:', error);
    errorResponse(res, 500, error.message, 'PAYMENT_ERROR');
  }
});

app.post('/api/payment/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { planId } = req.body;
    if (!planId || !['pro', 'enterprise'].includes(planId)) {
      return errorResponse(res, 400, 'Invalid plan', 'VALIDATION_ERROR');
    }

    const subscriptionResult = await pool.query(
      'SELECT stripe_customer_id FROM public.user_subscriptions WHERE user_id = $1',
      [userId]
    );

    if (subscriptionResult.rows.length === 0 || !subscriptionResult.rows[0].stripe_customer_id) {
      return errorResponse(res, 400, 'No Stripe customer found', 'NO_CUSTOMER');
    }

    if (!STRIPE_PUBLIC_KEY) {
      return errorResponse(res, 500, 'Stripe not configured', 'STRIPE_NOT_CONFIGURED');
    }

    const priceIds = {
      pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    };

    const APP_URL = process.env.APP_URL || 'http://localhost:5173';
    const { createCheckoutSession } = await import('./services/stripe.js');
    
    const sessionUrl = await createCheckoutSession(
      subscriptionResult.rows[0].stripe_customer_id,
      priceIds[planId],
      `${APP_URL}/subscription?success=true`,
      `${APP_URL}/subscription?cancelled=true`
    );

    successResponse(res, { sessionUrl });
  } catch (error) {
    console.error('Create checkout session error:', error);
    errorResponse(res, 500, error.message, 'PAYMENT_ERROR');
  }
});

app.post('/api/payment/cancel-subscription', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const subscriptionResult = await pool.query(
      'SELECT stripe_subscription_id FROM public.user_subscriptions WHERE user_id = $1 AND stripe_subscription_id IS NOT NULL',
      [userId]
    );

    if (subscriptionResult.rows.length === 0) {
      return errorResponse(res, 404, 'No active subscription', 'NO_SUBSCRIPTION');
    }

    if (!STRIPE_PUBLIC_KEY) {
      return errorResponse(res, 500, 'Stripe not configured', 'STRIPE_NOT_CONFIGURED');
    }

    const { cancelSubscription } = await import('./services/stripe.js');
    await cancelSubscription(subscriptionResult.rows[0].stripe_subscription_id);

    successResponse(res, null, 'Subscription will be cancelled at period end');
  } catch (error) {
    console.error('Cancel subscription error:', error);
    errorResponse(res, 500, error.message, 'PAYMENT_ERROR');
  }
});

app.post('/api/payment/reactivate-subscription', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const subscriptionResult = await pool.query(
      'SELECT stripe_subscription_id FROM public.user_subscriptions WHERE user_id = $1 AND stripe_subscription_id IS NOT NULL',
      [userId]
    );

    if (subscriptionResult.rows.length === 0) {
      return errorResponse(res, 404, 'No subscription found', 'NO_SUBSCRIPTION');
    }

    if (!STRIPE_PUBLIC_KEY) {
      return errorResponse(res, 500, 'Stripe not configured', 'STRIPE_NOT_CONFIGURED');
    }

    const { reactivateSubscription } = await import('./services/stripe.js');
    await reactivateSubscription(subscriptionResult.rows[0].stripe_subscription_id);

    successResponse(res, null, 'Subscription reactivated');
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    errorResponse(res, 500, error.message, 'PAYMENT_ERROR');
  }
});

app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!endpointSecret) {
    return errorResponse(res, 500, 'Webhook secret not configured', 'WEBHOOK_NOT_CONFIGURED');
  }

  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return errorResponse(res, 400, 'Missing stripe-signature header', 'INVALID_SIGNATURE');
  }

  try {
    const crypto = await import('crypto');
    const timestamp = req.body.toString().slice(0, req.body.toString().indexOf('{'));
    const payload = req.body.toString().slice(req.body.toString().indexOf('{'));
    
    const computedSignature = crypto
      .createHmac('sha256', endpointSecret)
      .update(`${timestamp}${payload}`)
      .digest('hex');
    
    if (computedSignature !== signature) {
      return errorResponse(res, 400, 'Invalid signature', 'INVALID_SIGNATURE');
    }

    const event = JSON.parse(payload);
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const userResult = await pool.query(
          'SELECT user_id FROM public.user_subscriptions WHERE stripe_customer_id = $1',
          [customerId]
        );
        
        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].user_id;
          const planMap = {
            [process.env.STRIPE_PRO_PRICE_ID || 'price_pro']: 'pro',
            [process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise']: 'enterprise',
          };
          const plan = planMap[subscription.items.data[0]?.price?.id] || 'free';
          
          await pool.query(
            `UPDATE public.user_subscriptions 
             SET plan = $1, status = $2, stripe_subscription_id = $3, 
                 generations_limit = $4, updated_at = NOW()
             WHERE user_id = $5`,
            [plan, subscription.status, subscription.id, 
             plan === 'pro' ? 100 : plan === 'enterprise' ? -1 : 5, userId]
          );
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userResult = await pool.query(
          'SELECT user_id FROM public.user_subscriptions WHERE stripe_customer_id = $1',
          [subscription.customer]
        );
        
        if (userResult.rows.length > 0) {
          await pool.query(
            `UPDATE public.user_subscriptions 
             SET plan = 'free', status = 'cancelled', stripe_subscription_id = NULL,
                 generations_limit = 5, updated_at = NOW()
             WHERE user_id = $1`,
            [userResult.rows[0].user_id]
          );
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const userResult = await pool.query(
          'SELECT user_id FROM public.user_subscriptions WHERE stripe_customer_id = $1',
          [invoice.customer]
        );
        
        if (userResult.rows.length > 0) {
          await pool.query(
            'UPDATE public.user_subscriptions SET status = $1 WHERE user_id = $2',
            ['past_due', userResult.rows[0].user_id]
          );
        }
        break;
      }
    }

    successResponse(res, { received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    errorResponse(res, 500, error.message, 'WEBHOOK_ERROR');
  }
});

// Admin Analytics Endpoints
app.get('/api/admin/analytics/overview', adminAuthMiddleware, async (req, res) => {
  try {

    const [
      totalUsers,
      activeUsers,
      totalDesigns,
      totalGenerations,
      subscriptionStats,
      recentSignups,
      topUsers,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM public.profiles'),
      pool.query('SELECT COUNT(*) as count FROM public.profiles WHERE is_enabled = TRUE'),
      pool.query('SELECT COUNT(*) as count FROM public.designs'),
      pool.query('SELECT COUNT(*) as count FROM public.generation_history'),
      pool.query(`
        SELECT 
          plan, 
          COUNT(*) as count,
          SUM(generations_used) as total_usage
        FROM public.user_subscriptions 
        GROUP BY plan
      `),
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM public.profiles 
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at) 
        ORDER BY date
      `),
      pool.query(`
        SELECT 
          p.id, 
          p.display_name, 
          p.email,
          COUNT(DISTINCT d.id) as designs_count,
          COUNT(DISTINCT gh.id) as generations_count,
          COALESCE(SUM(us.generations_used), 0) as total_usage
        FROM public.profiles p
        LEFT JOIN public.designs d ON d.user_id = p.user_id
        LEFT JOIN public.generation_history gh ON gh.user_id = p.user_id
        LEFT JOIN public.user_subscriptions us ON us.user_id = p.user_id
        GROUP BY p.id, p.display_name, p.email
        ORDER BY generations_count DESC
        LIMIT 10
      `),
    ]);

    successResponse(res, {
      overview: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        activeUsers: parseInt(activeUsers.rows[0].count),
        totalDesigns: parseInt(totalDesigns.rows[0].count),
        totalGenerations: parseInt(totalGenerations.rows[0].count),
      },
      subscriptions: subscriptionStats.rows,
      recentSignups: recentSignups.rows,
      topUsers: topUsers.rows,
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    errorResponse(res, 500, error.message, 'INTERNAL_ERROR');
  }
});

app.get('/api/admin/analytics/usage', adminAuthMiddleware, async (req, res) => {
  try {

    const { period = '7d' } = req.query;
    let interval;
    switch (period) {
      case '24h': interval = '1 day'; break;
      case '30d': interval = '30 days'; break;
      default: interval = '7 days';
    }

    const [
      dailyUsage,
      generationByType,
      templateUsage,
      deviceBreakdown,
    ] = await Promise.all([
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM public.generation_history
        WHERE created_at > NOW() - INTERVAL '${interval}'
        GROUP BY DATE(created_at)
        ORDER BY date
      `),
      pool.query(`
        SELECT type, COUNT(*) as count
        FROM public.generation_history
        WHERE created_at > NOW() - INTERVAL '${interval}'
        GROUP BY type
      `),
      pool.query(`
        SELECT t.name, COUNT(st.id) as saves
        FROM public.templates t
        LEFT JOIN public.saved_templates st ON st.template_id = t.id
        GROUP BY t.id, t.name
        ORDER BY saves DESC
        LIMIT 10
      `),
      pool.query(`
        SELECT metadata->>'deviceType' as device, COUNT(*) as count
        FROM public.generation_history
        WHERE created_at > NOW() - INTERVAL '${interval}'
          AND metadata->>'deviceType' IS NOT NULL
        GROUP BY metadata->>'deviceType'
      `),
    ]);

    successResponse(res, {
      dailyUsage: dailyUsage.rows,
      generationByType: generationByType.rows,
      topTemplates: templateUsage.rows,
      deviceBreakdown: deviceBreakdown.rows,
    });
  } catch (error) {
    console.error('Analytics usage error:', error);
    errorResponse(res, 500, error.message, 'INTERNAL_ERROR');
  }
});

app.get('/api/admin/analytics/revenue', adminAuthMiddleware, async (req, res) => {
  try {

    const [
      subscriptionCounts,
      revenueByPlan,
      mrr,
    ] = await Promise.all([
      pool.query(`
        SELECT 
          plan,
          COUNT(*) as subscribers,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
        FROM public.user_subscriptions
        GROUP BY plan
      `),
      pool.query(`
        SELECT 
          plan,
          COUNT(*) as count
        FROM public.user_subscriptions
        WHERE status = 'active'
        GROUP BY plan
      `),
      pool.query(`
        SELECT 
          SUM(
            CASE 
              WHEN plan = 'pro' THEN 19
              WHEN plan = 'enterprise' THEN 79
              ELSE 0
            END
          ) as monthly_revenue
        FROM public.user_subscriptions
        WHERE status = 'active'
      `),
    ]);

    const planPrices = { free: 0, pro: 19, enterprise: 79 };
    let arr = 0;
    revenueByPlan.rows.forEach(row => {
      arr += planPrices[row.plan] * parseInt(row.count);
    });

    successResponse(res, {
      subscriptions: subscriptionCounts.rows,
      mrr: parseFloat(mrr.rows[0].monthly_revenue) || 0,
      arr: arr * 12,
    });
  } catch (error) {
    console.error('Analytics revenue error:', error);
    errorResponse(res, 500, error.message, 'INTERNAL_ERROR');
  }
});

app.get('/api/admin/system/health', adminAuthMiddleware, async (req, res) => {
  try {

    const dbResult = await pool.query('SELECT 1 as status');
    const dbHealthy = dbResult.rows.length > 0;

    successResponse(res, {
      database: { healthy: dbHealthy },
      version: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('System health error:', error);
    errorResponse(res, 500, error.message, 'INTERNAL_ERROR');
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err instanceof ApiError) {
    return errorResponse(res, err.statusCode, err.message, err.code);
  }
  
  if (err.name === 'ValidationError') {
    return errorResponse(res, 400, err.message, 'VALIDATION_ERROR');
  }
  
  if (err.type === 'entity.parse.failed') {
    return errorResponse(res, 400, 'Invalid JSON in request body', 'INVALID_JSON');
  }
  
  return errorResponse(res, 500, 'Internal server error', 'INTERNAL_ERROR');
});

// 404 Handler
app.use((req, res) => {
  errorResponse(res, 404, `Route ${req.method} ${req.path} not found`, 'NOT_FOUND');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));