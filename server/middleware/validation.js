import { z } from 'zod';

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.errors,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query validation failed',
          details: error.errors,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Params validation failed',
          details: error.errors,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
}

export const schemas = {
  generateDesign: z.object({
    prompt: z.string().min(1, 'Prompt is required').max(5000, 'Prompt must be less than 5000 characters'),
    deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional().default('mobile'),
    variantCount: z.number().int().min(1).max(8).optional().default(4),
    referenceImage: z.string().optional(),
  }),

  generateDesignSystem: z.object({
    prompt: z.string().min(1, 'Prompt is required').max(1000),
  }),

  generateTemplates: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
  }),

  imageToDesign: z.object({
    image: z.string().min(1, 'Image is required'),
    prompt: z.string().optional(),
  }),

  createProject: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().max(500).optional(),
    type: z.string().min(1).max(50),
  }),

  updateProject: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    type: z.string().min(1).max(50).optional(),
  }),

  createDesign: z.object({
    project_id: z.string().uuid().optional(),
    prompt: z.string().min(1, 'Prompt is required'),
    html_code: z.string().optional(),
    css_code: z.string().optional(),
    svg_code: z.string().optional(),
    image_url: z.string().url().optional(),
  }),

  createDesignSystem: z.object({
    project_id: z.string().uuid().optional(),
    name: z.string().min(1, 'Name is required'),
    colors: z.record(z.string()).optional(),
    typography: z.object({
      heading: z.string().optional(),
      body: z.string().optional(),
      mono: z.string().optional(),
    }).optional(),
    spacing: z.array(z.object({
      name: z.string(),
      value: z.string(),
    })).optional(),
    borderRadius: z.array(z.object({
      name: z.string(),
      value: z.string(),
    })).optional(),
    shadows: z.array(z.object({
      name: z.string(),
      value: z.string(),
    })).optional(),
    components: z.record(z.any()).optional(),
  }),

  saveTemplate: z.object({
    template_id: z.string().uuid('Invalid template ID'),
  }),

  updateProfile: z.object({
    display_name: z.string().min(1).max(100).optional(),
    avatar_url: z.string().url().optional(),
  }),

  updateRole: z.object({
    user_id: z.string().uuid('Invalid user ID'),
    role: z.enum(['admin', 'user']),
  }),

  updateSubscription: z.object({
    user_id: z.string().uuid('Invalid user ID'),
    plan: z.enum(['free', 'pro', 'enterprise']).optional(),
    status: z.enum(['active', 'inactive', 'cancelled']).optional(),
    generations_limit: z.number().int().positive().optional(),
  }),

  toggleUser: z.object({
    user_id: z.string().uuid('Invalid user ID'),
    is_enabled: z.boolean(),
  }),

  requestPasswordReset: z.object({
    email: z.string().email('Invalid email address'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  verifyEmail: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),

  createCheckoutSession: z.object({
    planId: z.enum(['pro', 'enterprise']),
  }),

  generationHistory: z.object({
    type: z.enum(['variant', 'design-system', 'template', 'image_to_design']),
    prompt: z.string().min(1),
    result: z.record(z.any()),
    metadata: z.record(z.any()).optional(),
  }),
};
