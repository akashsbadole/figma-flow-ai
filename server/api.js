import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.VITE_DATABASE_URL,
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const getUserId = (req) => {
  return req.headers['x-user-id'] || req.headers['authorization']?.replace('Bearer ', '');
};

app.get('/api/projects', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const result = await pool.query(
      'SELECT * FROM public.projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { name, description, type } = req.body;
    const result = await pool.query(
      'INSERT INTO public.projects (user_id, name, description, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, description, type]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    await pool.query('DELETE FROM public.projects WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/designs', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const result = await pool.query(
      'SELECT * FROM public.designs WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/designs/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const result = await pool.query(
      'SELECT * FROM public.designs WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/designs', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { project_id, prompt, html_code, css_code, svg_code, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO public.designs (user_id, project_id, prompt, html_code, css_code, svg_code, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, project_id, prompt, html_code, css_code, svg_code, image_url]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/designs/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    await pool.query('DELETE FROM public.designs WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.templates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.templates WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/saved-templates', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const result = await pool.query(
      `SELECT t.* FROM public.templates t
       JOIN public.saved_templates st ON st.template_id = t.id
       WHERE st.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/saved-templates', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { template_id } = req.body;
    await pool.query(
      'INSERT INTO public.saved_templates (user_id, template_id) VALUES ($1, $2)',
      [userId, template_id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/saved-templates/:templateId', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    await pool.query(
      'DELETE FROM public.saved_templates WHERE user_id = $1 AND template_id = $2',
      [userId, req.params.templateId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/design-systems', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const result = await pool.query(
      'SELECT * FROM public.design_systems WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/design-systems', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { project_id, name, colors, typography, spacing, components } = req.body;
    const result = await pool.query(
      `INSERT INTO public.design_systems (user_id, project_id, name, colors, typography, spacing, components) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, project_id, name, colors, typography, spacing, components]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/generation-history', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const result = await pool.query(
      'SELECT * FROM public.generation_history WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generation-history', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { type, prompt, result, metadata } = req.body;
    const result_db = await pool.query(
      `INSERT INTO public.generation_history (user_id, type, prompt, result, metadata) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type, prompt, result, metadata]
    );
    res.json(result_db.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/generation-history/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    await pool.query('DELETE FROM public.generation_history WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/subscription', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const result = await pool.query(
      'SELECT * FROM public.user_subscriptions WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/increment-usage', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    await pool.query(
      'UPDATE public.user_subscriptions SET generations_used = generations_used + 1, updated_at = now() WHERE user_id = $1',
      [userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const adminUserId = getUserId(req);
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });
    
    const roleCheck = await pool.query(
      "SELECT * FROM public.user_roles WHERE user_id = $1 AND role = 'admin'",
      [adminUserId]
    );
    if (roleCheck.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    
    const profiles = await pool.query('SELECT * FROM public.profiles');
    const subscriptions = await pool.query('SELECT * FROM public.user_subscriptions');
    const roles = await pool.query('SELECT * FROM public.user_roles');
    
    res.json({ profiles: profiles.rows, subscriptions: subscriptions.rows, roles: roles.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/update-role', async (req, res) => {
  try {
    const adminUserId = getUserId(req);
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });
    
    const roleCheck = await pool.query(
      "SELECT * FROM public.user_roles WHERE user_id = $1 AND role = 'admin'",
      [adminUserId]
    );
    if (roleCheck.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    
    const { user_id, role } = req.body;
    await pool.query(
      'INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO UPDATE SET role = $2',
      [user_id, role]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/update-subscription', async (req, res) => {
  try {
    const adminUserId = getUserId(req);
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });
    
    const roleCheck = await pool.query(
      "SELECT * FROM public.user_roles WHERE user_id = $1 AND role = 'admin'",
      [adminUserId]
    );
    if (roleCheck.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    
    const { user_id, plan, status, generations_limit } = req.body;
    await pool.query(
      'UPDATE public.user_subscriptions SET plan = $1, status = $2, generations_limit = $3, updated_at = now() WHERE user_id = $4',
      [plan, status, generations_limit, user_id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/toggle-user', async (req, res) => {
  try {
    const adminUserId = getUserId(req);
    if (!adminUserId) return res.status(401).json({ error: 'Unauthorized' });
    
    const roleCheck = await pool.query(
      "SELECT * FROM public.user_roles WHERE user_id = $1 AND role = 'admin'",
      [adminUserId]
    );
    if (roleCheck.rows.length === 0) return res.status(403).json({ error: 'Forbidden' });
    
    const { user_id, is_enabled } = req.body;
    await pool.query(
      'UPDATE public.profiles SET is_enabled = $1, updated_at = now() WHERE user_id = $2',
      [is_enabled, user_id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { display_name, avatar_url } = req.body;
    
    const existing = await pool.query('SELECT * FROM public.profiles WHERE user_id = $1', [userId]);
    
    if (existing.rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO public.profiles (user_id, display_name, avatar_url) VALUES ($1, $2, $3) RETURNING *',
        [userId, display_name, avatar_url]
      );
      return res.json(result.rows[0]);
    }
    
    const result = await pool.query(
      'UPDATE public.profiles SET display_name = $1, avatar_url = $2, updated_at = now() WHERE user_id = $3 RETURNING *',
      [display_name, avatar_url, userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const result = await pool.query('SELECT * FROM public.profiles WHERE user_id = $1', [userId]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/generate-design', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { prompt, deviceType, variantCount = 4, referenceImage } = req.body;

    const deviceConfig = {
      mobile: { width: 390, height: 844, label: 'Mobile' },
      tablet: { width: 768, height: 1024, label: 'Tablet' },
      desktop: { width: 1280, height: 800, label: 'Desktop' },
    };
    const device = deviceConfig[deviceType] || deviceConfig.mobile;

    const systemPrompt = `You are an expert UI designer. Generate a beautiful, modern UI design based on the user's prompt. 
Return a JSON response with exactly ${variantCount} variants. Each variant should have:
- id: unique identifier
- name: descriptive name
- html: complete, semantic HTML with Tailwind-like classes
- css: additional custom CSS if needed

Focus on clean, modern designs with good contrast, proper spacing, and professional aesthetics.`;

    const userPrompt = `Create ${variantCount} UI design variants for: "${prompt}"
Device: ${device.label} (${device.width}x${device.height})

Respond in JSON format:
{
  "variants": [
    { "id": "variant-1", "name": "Variant Name", "html": "...", "css": "..." }
  ]
}`;

    const completion = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(completion.response.text());
    
    res.json({
      ...result,
      deviceType,
      deviceWidth: device.width,
      deviceHeight: device.height,
      deviceLabel: device.label,
    });
  } catch (error) {
    console.error('Generate design error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/generate-design-system', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { prompt } = req.body;

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

    const completion = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const designSystem = JSON.parse(completion.response.text());
    
    res.json({ designSystem });
  } catch (error) {
    console.error('Generate design system error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/generate-templates', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { prompt, deviceType } = req.body;

    const systemPrompt = `You are a UI template expert. Generate ready-to-use UI templates based on the user's request.`;

    const userPrompt = `Create UI templates for: "${prompt}" (${deviceType})

Return JSON with arrays of templates:
{
  "screens": [...],
  "components": [...],
  "pageLayouts": [...],
  "formPatterns": [...],
  "dataDisplay": [...],
  "navigationPatterns": [...]
}`;

    const completion = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(completion.response.text());
    
    res.json(result);
  } catch (error) {
    console.error('Generate templates error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/image-to-design', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { image, prompt } = req.body;

    const systemPrompt = `You are an expert UI designer. Analyze the provided image and convert it to clean, semantic HTML/CSS code.`;

    const userPrompt = `Analyze this design image and convert it to HTML/CSS code. ${prompt ? `Additional instructions: ${prompt}` : ''}

Return JSON:
{
  "html": "...",
  "css": "...",
  "react": "...",
  "tailwind": "..."
}`;

    // For Gemini, we need to handle image differently
    // Extract base64 data from the image URL
    const imageData = image.replace(/^data:image\/\w+;base64,/, '');
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg',
      },
    };

    const completion = await geminiModel.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [
          { text: systemPrompt + '\n\n' + userPrompt },
          imagePart
        ] 
      }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const result = JSON.parse(completion.response.text());
    
    res.json(result);
  } catch (error) {
    console.error('Image to design error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
