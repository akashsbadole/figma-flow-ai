const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeader = () => {
  // First try to get from localStorage (set by AuthContext)
  let userId = '';
  try {
    const stored = localStorage.getItem('clerk_user');
    if (stored) {
      const user = JSON.parse(stored);
      userId = user.id || '';
    }
  } catch (e) {
    // Ignore parsing errors
  }
  
  // If no user ID, try to get from Clerk's window object
  if (!userId && typeof window !== 'undefined') {
    // @ts-ignore - Clerk exposes __clerk on window
    const clerk = window.__clerk;
    if (clerk?.userId) {
      userId = clerk.userId;
    }
  }
  
  return userId ? { 'x-user-id': userId } : {};
};

export const api = {
  async getProjects() {
    const res = await fetch(`${API_URL}/api/projects`, { headers: getAuthHeader() });
    return res.json();
  },

  async createProject(data: { name: string; description: string; type: string }) {
    const res = await fetch(`${API_URL}/api/projects`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteProject(id: string) {
    const res = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async getDesigns() {
    const res = await fetch(`${API_URL}/api/designs`, { headers: getAuthHeader() });
    return res.json();
  },

  async getDesign(id: string) {
    const res = await fetch(`${API_URL}/api/designs/${id}`, { headers: getAuthHeader() });
    return res.json();
  },

  async createDesign(data: { project_id?: string; prompt: string; html_code?: string; css_code?: string; svg_code?: string; image_url?: string }) {
    const res = await fetch(`${API_URL}/api/designs`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteDesign(id: string) {
    const res = await fetch(`${API_URL}/api/designs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async getTemplates() {
    const res = await fetch(`${API_URL}/api/templates`);
    return res.json();
  },

  async getTemplate(id: string) {
    const res = await fetch(`${API_URL}/api/templates/${id}`);
    return res.json();
  },

  async getSavedTemplates() {
    const res = await fetch(`${API_URL}/api/saved-templates`, { headers: getAuthHeader() });
    return res.json();
  },

  async saveTemplate(templateId: string) {
    const res = await fetch(`${API_URL}/api/saved-templates`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: templateId }),
    });
    return res.json();
  },

  async unsaveTemplate(templateId: string) {
    const res = await fetch(`${API_URL}/api/saved-templates/${templateId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async getDesignSystems() {
    const res = await fetch(`${API_URL}/api/design-systems`, { headers: getAuthHeader() });
    return res.json();
  },

  async createDesignSystem(data: { project_id?: string; name: string; colors?: object; typography?: object; spacing?: object; components?: object }) {
    const res = await fetch(`${API_URL}/api/design-systems`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getGenerationHistory() {
    const res = await fetch(`${API_URL}/api/generation-history`, { headers: getAuthHeader() });
    return res.json();
  },

  async createGenerationHistory(data: { type: string; prompt: string; result: object; metadata?: object }) {
    const res = await fetch(`${API_URL}/api/generation-history`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteGenerationHistory(id: string) {
    const res = await fetch(`${API_URL}/api/generation-history/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async getSubscription() {
    const res = await fetch(`${API_URL}/api/subscription`, { headers: getAuthHeader() });
    return res.json();
  },

  async incrementUsage() {
    const res = await fetch(`${API_URL}/api/increment-usage`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  async getAdminUsers() {
    const res = await fetch(`${API_URL}/api/admin/users`, { headers: getAuthHeader() });
    return res.json();
  },

  async updateUserRole(userId: string, role: string) {
    const res = await fetch(`${API_URL}/api/admin/update-role`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role }),
    });
    return res.json();
  },

  async updateSubscription(userId: string, data: { plan: string; status: string; generations_limit: number }) {
    const res = await fetch(`${API_URL}/api/admin/update-subscription`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...data }),
    });
    return res.json();
  },

  async toggleUser(userId: string, isEnabled: boolean) {
    const res = await fetch(`${API_URL}/api/admin/toggle-user`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, is_enabled: isEnabled }),
    });
    return res.json();
  },

  async updateProfile(data: { display_name?: string; avatar_url?: string }) {
    const res = await fetch(`${API_URL}/api/profile`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getProfile() {
    const res = await fetch(`${API_URL}/api/profile`, { headers: getAuthHeader() });
    return res.json();
  },

  async generateDesign(data: { prompt: string; deviceType: string; variantCount?: number; referenceImage?: string }) {
    const res = await fetch(`${API_URL}/api/ai/generate-design`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async generateDesignSystem(data: { prompt: string }) {
    const res = await fetch(`${API_URL}/api/ai/generate-design-system`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async generateTemplates(data: { prompt: string; deviceType: string }) {
    const res = await fetch(`${API_URL}/api/ai/generate-templates`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async imageToDesign(data: { image: string; prompt: string }) {
    const res = await fetch(`${API_URL}/api/ai/image-to-design`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
