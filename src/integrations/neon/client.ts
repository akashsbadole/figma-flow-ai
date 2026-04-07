export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Design {
  id: string;
  user_id: string;
  project_id: string | null;
  prompt: string;
  html_code: string | null;
  css_code: string | null;
  svg_code: string | null;
  image_url: string | null;
  device_type: string;
  created_at: string;
  updated_at: string;
}

export interface DesignVariant {
  id: string;
  name: string;
  html: string;
  css: string;
  svg: string;
  metadata?: {
    extractedTokens?: {
      colors: string[];
      fonts: string[];
      fontSizes: string[];
    };
  };
}

export interface DesignResponse {
  variants: DesignVariant[];
  deviceType?: string;
  deviceWidth?: number;
  deviceHeight?: number;
  deviceLabel?: string;
  deviceInfo?: {
    width: number;
    height: number;
    label: string;
  };
  designSystem?: any;
  templates?: any;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  html_code: string | null;
  css_code: string | null;
  svg_code: string | null;
  preview_url: string;
  created_at: string;
  is_premium: boolean;
}

export interface SavedTemplate {
  id: string;
  user_id: string;
  template_id: string;
  created_at: string;
}

export interface DesignSystem {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  colors: DesignColors;
  typography: DesignTypography;
  spacing: DesignSpacing;
  components: DesignComponents;
  created_at: string;
  updated_at: string;
}

export interface DesignColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface DesignTypography {
  fontFamily: string;
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, string>;
}

export interface DesignSpacing {
  base: number;
  scale: number;
  values: Record<string, number>;
}

export interface DesignComponents {
  buttons: object;
  inputs: object;
  cards: object;
  navigation: object;
}

export interface GenerationHistory {
  id: string;
  user_id: string;
  type: string;
  prompt: string;
  result: object;
  metadata: object | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  generations_limit: number;
  generations_used: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  is_enabled: boolean;
  created_at: string;
  subscription: Subscription | null;
}

export interface ApiError {
  error: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to get auth header from Clerk
async function getAuthHeaderAsync(): Promise<{ 'x-user-id': string } | { authorization: string }> {
  if (typeof window !== 'undefined') {
    try {
      const clerk = (window as any).Clerk || (window as any).__clerk;
      if (clerk?.user?.id) {
        return { 'x-user-id': clerk.user.id };
      }
    } catch (e) {
      console.warn('Error accessing Clerk:', e);
    }
  }

  try {
    const stored = localStorage.getItem('clerk_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.id) {
        return { 'x-user-id': user.id };
      }
    }
  } catch (e) {
    console.warn('Error accessing localStorage:', e);
  }

  console.error('No authentication found');
  throw new Error('Authentication required. Please sign in.');
}

// Helper function to handle API responses
async function handleResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type');
  let body: any;

  try {
    if (contentType && contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
  } catch (e) {
    console.error('Failed to parse response:', e);
    throw new Error('Invalid response format');
  }

  if (!res.ok) {
    const errorMessage = body?.error?.message || body?.error || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMessage);
  }

  if (body && typeof body === 'object' && 'success' in body) {
    if (body.success) {
      return body.data;
    } else {
      throw new Error(body.error?.message || 'API request failed');
    }
  }

  return body;
}

export const api = {
  async getProjects(): Promise<Project[]> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/projects`, { headers: authHeader });
    return handleResponse(res) as Promise<Project[]>;
  },

  async createProject(data: { name: string; description: string; type: string }): Promise<Project> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<Project>;
  },

  async updateProject(id: string, data: { name?: string; description?: string; type?: string }): Promise<Project> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<Project>;
  },

  async deleteProject(id: string): Promise<{ id: string }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    return handleResponse(res) as Promise<{ id: string }>;
  },

  async getDesigns(): Promise<Design[]> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/designs`, { headers: authHeader });
    return handleResponse(res) as Promise<Design[]>;
  },

  async getDesign(id: string): Promise<Design | null> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/designs/${id}`, { headers: authHeader });
    return handleResponse(res) as Promise<Design | null>;
  },

  async createDesign(data: { project_id?: string; prompt: string; html_code?: string; css_code?: string; svg_code?: string; image_url?: string; metadata?: object }): Promise<Design> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/designs`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<Design>;
  },

  async updateDesign(id: string, data: { prompt?: string; html_code?: string; css_code?: string; svg_code?: string; image_url?: string; metadata?: object }): Promise<Design> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/designs/${id}`, {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<Design>;
  },

  async deleteDesign(id: string): Promise<{ id: string }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/designs/${id}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    return handleResponse(res) as Promise<{ id: string }>;
  },

  async getTemplates(): Promise<Template[]> {
    const res = await fetch(`${API_URL}/api/templates`);
    return handleResponse(res) as Promise<Template[]>;
  },

  async createTemplate(data: { name: string; description?: string; category: string; html_code?: string; css_code?: string; svg_code?: string; tags?: string[]; metadata?: object }): Promise<Template> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/templates`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<Template>;
  },

  async getTemplate(id: string): Promise<Template | null> {
    const res = await fetch(`${API_URL}/api/templates/${id}`);
    return handleResponse(res) as Promise<Template | null>;
  },

  async getSavedTemplates(): Promise<SavedTemplate[]> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/saved-templates`, { headers: authHeader });
    return handleResponse(res) as Promise<SavedTemplate[]>;
  },

  async saveTemplate(templateId: string): Promise<SavedTemplate> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/saved-templates`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId }),
    });
    return handleResponse(res) as Promise<SavedTemplate>;
  },

  async unsaveTemplate(templateId: string): Promise<{ template_id: string }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/saved-templates/${templateId}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    return handleResponse(res) as Promise<{ template_id: string }>;
  },

  async getDesignSystems(): Promise<DesignSystem[]> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/design-systems`, { headers: authHeader });
    return handleResponse(res) as Promise<DesignSystem[]>;
  },

  async getDesignSystem(id: string): Promise<DesignSystem | null> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/design-systems/${id}`, { headers: authHeader });
    return handleResponse(res) as Promise<DesignSystem | null>;
  },

  async createDesignSystem(data: { project_id?: string; name: string; colors?: object; typography?: object; spacing?: object; components?: object }): Promise<DesignSystem> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/design-systems`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<DesignSystem>;
  },

  async updateDesignSystem(id: string, data: { name?: string; colors?: object; typography?: object; spacing?: object; components?: object }): Promise<DesignSystem> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/design-systems/${id}`, {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<DesignSystem>;
  },

  async deleteDesignSystem(id: string): Promise<{ id: string }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/design-systems/${id}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    return handleResponse(res) as Promise<{ id: string }>;
  },

  async getGenerationHistory(): Promise<GenerationHistory[]> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/generation-history`, { headers: authHeader });
    return handleResponse(res) as Promise<GenerationHistory[]>;
  },

  async createGenerationHistory(data: { type: string; prompt: string; result: object; metadata?: object }): Promise<GenerationHistory> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/generation-history`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<GenerationHistory>;
  },

  async deleteGenerationHistory(id: string): Promise<{ id: string }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/generation-history/${id}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    return handleResponse(res) as Promise<{ id: string }>;
  },

  async getSubscription(): Promise<Subscription> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/subscription`, { headers: authHeader });
    return handleResponse(res) as Promise<Subscription>;
  },

  async incrementUsage(): Promise<null> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/increment-usage`, {
      method: 'POST',
      headers: authHeader,
    });
    return handleResponse(res) as Promise<null>;
  },

  async getAdminUsers(): Promise<{ profiles: any[]; subscriptions: any[]; roles: any[] }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/admin/users`, { headers: authHeader });
    return handleResponse(res) as Promise<{ profiles: any[]; subscriptions: any[]; roles: any[] }>;
  },

  async updateUserRole(userId: string, role: string): Promise<{ user_id: string; role: string }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/admin/update-role`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role }),
    });
    return handleResponse(res) as Promise<{ user_id: string; role: string }>;
  },

  async updateSubscription(userId: string, data: { plan: string; status: string; generations_limit: number }): Promise<AdminUser> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/admin/update-subscription`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...data }),
    });
    return handleResponse(res) as Promise<AdminUser>;
  },

  async toggleUser(userId: string, isEnabled: boolean): Promise<{ user_id: string; is_enabled: boolean }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/admin/toggle-user`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, is_enabled: isEnabled }),
    });
    return handleResponse(res) as Promise<{ user_id: string; is_enabled: boolean }>;
  },

  async updateProfile(data: { display_name?: string; avatar_url?: string }): Promise<UserProfile> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/profile`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<UserProfile>;
  },

  async getProfile(): Promise<UserProfile> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/profile`, { headers: authHeader });
    return handleResponse(res) as Promise<UserProfile>;
  },

  async submitFeedback(variantId: string, rating: number, feedback?: string): Promise<null> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/ai/feedback`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, rating, feedback }),
    });
    return handleResponse(res) as Promise<null>;
  },

  async enhancePrompt(prompt: string): Promise<{ enhancedPrompt: string; parameters: Array<{ label: string; value: string; type: string }> }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/ai/enhance-prompt`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    return handleResponse(res) as Promise<{ enhancedPrompt: string; parameters: Array<{ label: string; value: string; type: string }> }>;
  },

  async generateDesign(data: { prompt: string; deviceType: string; variantCount?: number; referenceImage?: string }): Promise<DesignResponse> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/ai/generate-design`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<DesignResponse>;
  },

  async generateDesignSystem(data: { prompt: string }): Promise<{ designSystem: any }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/ai/generate-design-system`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<{ designSystem: any }>;
  },

  async generateTemplates(data: { prompt: string; deviceType: string }): Promise<any> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/ai/generate-templates`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<any>;
  },

  async imageToDesign(data: { image: string; prompt: string }): Promise<DesignResponse> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/ai/image-to-design`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<DesignResponse>;
  },

  async generateFullDesign(data: { prompt: string; deviceType: string; variantCount?: number; referenceImage?: string }): Promise<DesignResponse> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/ai/generate-full-design`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<DesignResponse>;
  },

  async createCheckoutSession(planId: string): Promise<{ sessionUrl: string }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/payment/create-checkout-session`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    return handleResponse(res) as Promise<{ sessionUrl: string }>;
  },

  async createStripeCustomer(): Promise<{ customerId: string }> {
    const authHeader = await getAuthHeaderAsync();
    const res = await fetch(`${API_URL}/api/payment/create-customer`, {
      method: 'POST',
      headers: authHeader,
    });
    return handleResponse(res) as Promise<{ customerId: string }>;
  },

  async requestUsernameRecovery(displayName: string): Promise<null> {
    const res = await fetch(`${API_URL}/api/auth/forgot-username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName }),
    });
    return handleResponse(res) as Promise<null>;
  },

  async requestPasswordReset(email: string): Promise<null> {
    const res = await fetch(`${API_URL}/api/auth/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res) as Promise<null>;
  },

  async resetPassword(token: string, password: string): Promise<null> {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: password }),
    });
    return handleResponse(res) as Promise<null>;
  },

  async verifyEmail(token: string): Promise<{ email: string }> {
    const res = await fetch(`${API_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return handleResponse(res) as Promise<{ email: string }>;
  },
};
