import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.ASSET_UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760');
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  256,
  'image/svg+xml',
  'application/pdf',
];

export interface Asset {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface UploadResult {
  success: boolean;
  asset?: Asset;
  error?: string;
}

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export function validateFileType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType);
}

export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

export function generateAssetId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

export async function saveAsset(
  buffer: Buffer,
  assetId: string,
  mimeType: string
): Promise<string> {
  await ensureUploadDir();
  
  const ext = getExtensionFromMimeType(mimeType);
  const filename = `${assetId}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  
  await fs.writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}

export function getAssetPath(assetId: string, mimeType: string): string {
  const ext = getExtensionFromMimeType(mimeType);
  return path.join(UPLOAD_DIR, `${assetId}${ext}`);
}

export async function deleteAssetFile(assetId: string, mimeType: string): Promise<void> {
  const filepath = getAssetPath(assetId, mimeType);
  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Failed to delete asset file:', error);
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
  };
  return mimeToExt[mimeType] || '';
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function getAssetUrl(assetId: string, mimeType: string, baseUrl: string): string {
  const ext = getExtensionFromMimeType(mimeType);
  return `${baseUrl}/uploads/${assetId}${ext}`;
}
