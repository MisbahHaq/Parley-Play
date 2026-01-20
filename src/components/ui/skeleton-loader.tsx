import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'list' | 'text' | 'avatar' | 'button';
  count?: number;
}

const SkeletonPulse = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-lg",
      className
    )}
  />
);

export const SkeletonLoader = ({ className, variant = 'card', count = 1 }: SkeletonLoaderProps) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <div className={cn("space-y-4", className)}>
        {items.map((i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="space-y-2">
                <SkeletonPulse className="h-5 w-32" />
                <SkeletonPulse className="h-4 w-20" />
              </div>
              <SkeletonPulse className="h-8 w-8 rounded-full" />
              <div className="space-y-2 text-right">
                <SkeletonPulse className="h-5 w-32 ml-auto" />
                <SkeletonPulse className="h-4 w-20 ml-auto" />
              </div>
            </div>
            <div className="flex gap-2">
              <SkeletonPulse className="h-10 flex-1" />
              <SkeletonPulse className="h-10 flex-1" />
              <SkeletonPulse className="h-10 flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 glass rounded-lg">
            <SkeletonPulse className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-3/4" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
            <SkeletonPulse className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn("space-y-2", className)}>
        {items.map((i) => (
          <SkeletonPulse key={i} className="h-4 w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={cn("flex gap-3", className)}>
        {items.map((i) => (
          <SkeletonPulse key={i} className="h-10 w-10 rounded-full" />
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={cn("flex gap-2", className)}>
        {items.map((i) => (
          <SkeletonPulse key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
