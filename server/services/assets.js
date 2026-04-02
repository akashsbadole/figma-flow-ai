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

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export function validateFileType(mimeType) {
  return ALLOWED_TYPES.includes(mimeType);
}

export function validateFileSize(size) {
  return size <= MAX_FILE_SIZE;
}

export function generateAssetId() {
  return crypto.randomBytes(16).toString('hex');
}

export function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

export async function saveAsset(
  buffer,
  assetId,
  mimeType
) {
  await ensureUploadDir();
  
  const ext = getExtensionFromMimeType(mimeType);
  const filename = `${assetId}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  
  await fs.writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}

export function getAssetPath(assetId, mimeType) {
  const ext = getExtensionFromMimeType(mimeType);
  return path.join(UPLOAD_DIR, `${assetId}${ext}`);
}

export async function deleteAssetFile(assetId, mimeType) {
  const filepath = getAssetPath(assetId, mimeType);
  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.error('Failed to delete asset file:', error);
  }
}

function getExtensionFromMimeType(mimeType) {
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
  };
  return mimeToExt[mimeType] || '';
}

export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function getAssetUrl(assetId, mimeType, baseUrl) {
  const ext = getExtensionFromMimeType(mimeType);
  return `${baseUrl}/uploads/${assetId}${ext}`;
}
