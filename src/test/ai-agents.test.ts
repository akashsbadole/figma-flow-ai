import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const API_PORT = 3001;
const API_URL = `http://localhost:${API_PORT}/api`;
const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

async function postRequest(path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: API_PORT,
      path: `/api/ai/${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-user-id': TEST_USER_ID
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ success: false, error: 'Invalid JSON response', data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

describe('AI Agent Verification', () => {
  // Assuming server is already running via npm run dev:all or similar in this environment

  it('should enhance a design prompt', async () => {
    const result = await postRequest('enhance-prompt', { prompt: 'landing page for a coffee shop' });
    expect(result.success).toBe(true);
    expect(result.data.enhancedPrompt).toBeDefined();
  }, 30000);

  it('should generate a design variant', async () => {
    const result = await postRequest('generate-design', {
      prompt: 'a simple button',
      variantCount: 1,
      deviceType: 'desktop'
    });
    expect(result.success).toBe(true);
    expect(result.data.variants).toBeDefined();
    expect(result.data.variants.length).toBe(1);
  }, 30000);

  it('should generate a full design package', async () => {
    const result = await postRequest('generate-full-design', {
      prompt: 'modern analytics dashboard',
      variantCount: 1,
      deviceType: 'desktop'
    });
    expect(result.success).toBe(true);
    expect(result.data.variants).toBeDefined();
    expect(result.data.designSystem).toBeDefined();
  }, 30000);

  it('should generate a design system', async () => {
    const result = await postRequest('generate-design-system', { prompt: 'minimalist tech brand' });
    expect(result.success).toBe(true);
    expect(result.data.designSystem).toBeDefined();
  }, 30000);

  it('should generate UI templates', async () => {
    const result = await postRequest('generate-templates', {
        prompt: 'ecommerce app',
        deviceType: 'mobile'
    });
    expect(result.success).toBe(true);
    expect(result.data.screens).toBeDefined();
  }, 30000);
});
