import { cn } from "@/lib/utils";

interface DeviceFrameProps {
  deviceType: "mobile" | "tablet" | "desktop";
  children: React.ReactNode;
  className?: string;
  scale?: number;
}

const deviceStyles = {
  mobile: {
    width: 390,
    height: 844,
    borderRadius: "2.5rem",
    padding: "0.75rem",
    notch: true,
  },
  tablet: {
    width: 820,
    height: 1180,
    borderRadius: "1.5rem",
    padding: "0.75rem",
    notch: false,
  },
  desktop: {
    width: 1440,
    height: 900,
    borderRadius: "0.75rem",
    padding: "0",
    notch: false,
  },
};

export function DeviceFrame({ deviceType, children, className, scale = 0.35 }: DeviceFrameProps) {
  const device = deviceStyles[deviceType];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className="relative"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          width: device.width,
          height: device.height,
        }}
      >
        {/* Device shell */}
        <div
          className="absolute inset-0 bg-foreground/90 shadow-elevated"
          style={{ borderRadius: device.borderRadius, padding: device.padding }}
        >
          {/* Notch for mobile */}
          {device.notch && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-foreground/90 rounded-b-2xl z-10" />
          )}
          {/* Screen */}
          <div
            className="w-full h-full bg-background overflow-hidden"
            style={{ borderRadius: `calc(${device.borderRadius} - ${device.padding})` }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
