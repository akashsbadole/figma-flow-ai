export const imagePresets = {
  thumbnail: { width: 150, quality: 60 },
  small: { width: 320, quality: 70 },
  medium: { width: 640, quality: 80 },
  large: { width: 1280, quality: 85 },
  original: { quality: 90 },
} as const;

export type ImagePresetKey = keyof typeof imagePresets;
