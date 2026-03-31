import React from 'react';
import { imagePresets } from '../constants/imagePresets';

export { imagePresets };
export type { ImagePresetKey } from '../constants/imagePresets';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholder?: string;
  aspectRatio?: string;
  className?: string;
  onLoad?: () => void;
}

export function LazyImage({
  src,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect fill="%23e5e7eb" width="1" height="1"/%3E%3C/svg%3E',
  aspectRatio,
  className = '',
  onLoad,
  alt,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
    aspectRatio: aspectRatio || 'auto',
  };

  return (
    <div ref={imgRef} style={containerStyle} className={className}>
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#e5e7eb',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid #d1d5db',
              borderTopColor: '#6b7280',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          {...props}
        />
      )}
    </div>
  );
}

export function useImageOptimization(src: string, options: {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
} = {}) {
  const { quality = 80, format = 'webp', width, height } = options;
  const [optimizedSrc, setOptimizedSrc] = React.useState<string>(src);
  const [isOptimized, setIsOptimized] = React.useState(false);

  React.useEffect(() => {
    const optimizeImage = async () => {
      if (!src) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const targetWidth = width || img.width;
        const targetHeight = height || img.height;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const optimizedDataUrl = canvas.toDataURL(`image/${format}`, quality / 100);
        setOptimizedSrc(optimizedDataUrl);
        setIsOptimized(true);
      };

      img.onerror = () => {
        setOptimizedSrc(src);
      };

      img.src = src;
    };

    optimizeImage();
  }, [src, quality, format, width, height]);

  return { optimizedSrc, isOptimized };
}

export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const { width, quality = 80, format = 'webp' } = options;

  if (!src) return '';

  const url = new URL(src);
  
  if (url.hostname.includes('unsplash.com')) {
    url.searchParams.set('fm', format);
    url.searchParams.set('q', String(quality));
    if (width) url.searchParams.set('w', String(width));
  } else if (url.hostname.includes('images.unsplash.com')) {
    url.searchParams.set('fm', format);
    url.searchParams.set('q', String(quality));
    if (width) url.searchParams.set('w', String(width));
  } else if (src.startsWith('data:')) {
    return src;
  }

  return url.toString();
}
