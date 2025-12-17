import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "minimal" | "featured";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
  className = "",
}: EmptyStateProps) {
  const variants = {
    default: "py-12 md:py-16",
    minimal: "py-8 md:py-10",
    featured: "py-16 md:py-20",
  };

  return (
    <div className={`flex items-center justify-center px-4 ${variants[variant]} ${className}`}>
      <Card variant="elevated" className="w-full max-w-lg animate-fade-in">
        <CardHeader className="text-center pb-6">
          {icon && (
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-primary/70">{icon}</div>
            </div>
          )}
          <CardTitle className="text-xl md:text-2xl font-bold mb-3">{title}</CardTitle>
          <CardDescription className="text-base leading-relaxed max-w-sm mx-auto">
            {description}
          </CardDescription>
        </CardHeader>

        {(action || secondaryAction) && (
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {action && (
                <Button
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                  size="lg"
                  className="min-w-[140px]"
                >
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant="outline"
                  size="lg"
                  className="min-w-[140px]"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Specialized empty states for different contexts
export function EmptyReadingList({ onAddPreference }: { onAddPreference?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      }
      title="No Reading Preferences Yet"
      description="Start building your encrypted reading profile by adding your first book category. Your preferences will be fully encrypted on the blockchain."
      action={
        onAddPreference
          ? {
              label: "Add First Category",
              onClick: onAddPreference,
            }
          : undefined
      }
      variant="featured"
    />
  );
}

export function EmptyChart({ onAddPreference }: { onAddPreference?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      }
      title="No Chart Data Available"
      description="Add and decrypt some reading preferences to visualize your reading distribution with beautiful interactive charts."
      action={
        onAddPreference
          ? {
              label: "Start Adding Data",
              onClick: onAddPreference,
            }
          : undefined
      }
    />
  );
}

export function EmptyWallet() {
  return (
    <EmptyState
      icon={
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      }
      title="Connect Your Wallet"
      description="Connect your wallet to start managing your encrypted reading preferences with fully homomorphic encryption technology."
      variant="featured"
    />
  );
}
