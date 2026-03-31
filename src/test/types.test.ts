import { describe, it, expect } from 'vitest';
import type { Project, Design, Template, DesignSystem, Subscription } from '../integrations/neon/client';

describe('TypeScript Types', () => {
  describe('Project', () => {
    it('should have correct structure', () => {
      const project: Project = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: 'user-123',
        name: 'Test Project',
        description: 'A test project',
        type: 'web',
        created_at: '2026-03-19T00:00:00.000Z',
        updated_at: '2026-03-19T00:00:00.000Z',
      };

      expect(project.id).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.type).toBe('web');
    });
  });

  describe('Design', () => {
    it('should have correct structure', () => {
      const design: Design = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: 'user-123',
        project_id: '123e4567-e89b-12d3-a456-426614174000',
        prompt: 'Create a landing page',
        html_code: '<div>Hello World</div>',
        css_code: 'body { margin: 0; }',
        svg_code: null,
        image_url: null,
        device_type: 'mobile',
        created_at: '2026-03-19T00:00:00.000Z',
        updated_at: '2026-03-19T00:00:00.000Z',
      };

      expect(design.id).toBeDefined();
      expect(design.prompt).toBe('Create a landing page');
      expect(design.html_code).toContain('Hello World');
    });

    it('should allow null optional fields', () => {
      const design: Design = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: 'user-123',
        project_id: null,
        prompt: 'Minimal design',
        html_code: null,
        css_code: null,
        svg_code: null,
        image_url: null,
        device_type: 'desktop',
        created_at: '2026-03-19T00:00:00.000Z',
        updated_at: '2026-03-19T00:00:00.000Z',
      };

      expect(design.project_id).toBeNull();
      expect(design.html_code).toBeNull();
    });
  });

  describe('Template', () => {
    it('should have correct structure', () => {
      const template: Template = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'E-commerce Template',
        description: 'A template for online stores',
        category: 'ecommerce',
        tags: ['shopping', 'product', 'cart'],
        html_code: '<div>E-commerce</div>',
        css_code: '.container { max-width: 1200px; }',
        preview_url: 'https://example.com/preview.jpg',
        created_at: '2026-03-19T00:00:00.000Z',
        is_premium: false,
      };

      expect(template.name).toBe('E-commerce Template');
      expect(template.tags).toContain('shopping');
      expect(template.is_premium).toBe(false);
    });
  });

  describe('DesignSystem', () => {
    it('should have correct color structure', () => {
      const designSystem: DesignSystem = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        user_id: 'user-123',
        project_id: null,
        name: 'Brand Design System',
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1e293b',
          textSecondary: '#64748b',
          border: '#e2e8f0',
          error: '#ef4444',
          success: '#22c55e',
          warning: '#f59e0b',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: { sm: '12px', base: '16px', lg: '20px' },
          fontWeight: { normal: 400, medium: 500, bold: 700 },
          lineHeight: { tight: '1.25', normal: '1.5' },
        },
        spacing: {
          base: 4,
          scale: 1.5,
          values: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        },
        components: {
          buttons: {},
          inputs: {},
          cards: {},
          navigation: {},
        },
        created_at: '2026-03-19T00:00:00.000Z',
        updated_at: '2026-03-19T00:00:00.000Z',
      };

      expect(designSystem.colors.primary).toBe('#6366f1');
      expect(designSystem.typography.fontWeight.bold).toBe(700);
      expect(designSystem.spacing.base).toBe(4);
    });
  });

  describe('Subscription', () => {
    it('should have correct plan values', () => {
      const subscription: Subscription = {
        id: '123e4567-e89b-12d3-a456-426614174004',
        user_id: 'user-123',
        plan: 'pro',
        status: 'active',
        generations_limit: 100,
        generations_used: 25,
        created_at: '2026-03-19T00:00:00.000Z',
        updated_at: '2026-03-19T00:00:00.000Z',
      };

      expect(subscription.plan).toBe('pro');
      expect(subscription.generations_limit).toBe(100);
      expect(subscription.generations_used).toBe(25);
      expect(subscription.generations_limit - subscription.generations_used).toBe(75);
    });
  });
});
