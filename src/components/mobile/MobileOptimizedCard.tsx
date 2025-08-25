import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export function MobileOptimizedCard({
  title,
  description,
  children,
  className,
  compact = false,
}: MobileOptimizedCardProps) {
  const isMobile = useIsMobile();

  return (
    <Card 
      className={cn(
        "healthcare-card",
        isMobile && "rounded-lg border-0 shadow-sm",
        compact && isMobile && "p-2",
        className
      )}
    >
      <CardHeader className={cn(
        isMobile && "pb-3",
        compact && isMobile && "pb-2 px-3 pt-3"
      )}>
        <CardTitle className={cn(
          "text-foreground",
          isMobile && "text-base",
          compact && isMobile && "text-sm"
        )}>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className={cn(
            "text-muted-foreground",
            isMobile && "text-sm",
            compact && isMobile && "text-xs"
          )}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn(
        compact && isMobile && "px-3 pb-3"
      )}>
        {children}
      </CardContent>
    </Card>
  );
}