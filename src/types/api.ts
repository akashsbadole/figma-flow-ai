export interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
  email?: string;
  is_enabled: boolean;
  email_verified?: boolean;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  generations_used: number;
  generations_limit: number;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Design {
  id: string;
  user_id: string;
  project_id?: string;
  prompt: string;
  html_code?: string;
  css_code?: string;
  svg_code?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface DesignSystem {
  id: string;
  user_id: string;
  project_id?: string;
  name: string;
  colors: Record<string, string>;
  typography: {
    heading: string;
    body: string;
    mono: string;
    scale?: { name: string; size: string; lineHeight: string; letterSpacing: string }[];
    weights?: { name: string; value: number }[];
  };
  spacing?: { name: string; value: string }[];
  borderRadius?: { name: string; value: string }[];
  shadows?: { name: string; value: string }[];
  gradients?: { name: string; value: string }[];
  breakpoints?: { name: string; value: string }[];
  components?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  html_code: string;
  css_code: string;
  preview_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  is_premium: boolean;
  created_at: string;
}

export interface GenerationHistory {
  id: string;
  user_id: string;
  type: 'variant' | 'design-system' | 'template' | 'image_to_design';
  prompt: string;
  result: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DesignVariant {
  id: string;
  name: string;
  html: string;
  css: string;
  svg?: string;
}

export interface GenerationResult {
  variants: DesignVariant[];
  deviceType: 'mobile' | 'tablet' | 'desktop';
  deviceWidth: number;
  deviceHeight: number;
  deviceLabel: string;
}

export interface ImageToDesignResult {
  html: string;
  css: string;
  react: string;
  tailwind: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export interface ApiError {
  success: boolean;
  error: {
    code: string;
    message: string;
    timestamp: string;
  };
}

export interface Session {
  id: string;
  created_at: string;
  last_activity: string;
  expires_at: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  generationsLimit: number;
}

export interface PaymentConfig {
  publicKey: string | null;
  plans: PaymentPlan[];
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceConfig {
  width: number;
  height: number;
  label: string;
}

export const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  mobile: { width: 390, height: 844, label: 'Mobile' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  desktop: { width: 1280, height: 800, label: 'Desktop' },
};

export type VariantCount = 1 | 2 | 4 | 6 | 8;

export interface GenerateDesignRequest {
  prompt: string;
  deviceType: DeviceType;
  variantCount?: VariantCount;
  referenceImage?: string;
}

export interface GenerateDesignSystemRequest {
  prompt: string;
}

export interface GenerateTemplatesRequest {
  prompt: string;
  deviceType?: DeviceType;
}

export interface ImageToDesignRequest {
  image: string;
  prompt?: string;
}
