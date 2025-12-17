import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  badge?: string;
  onClick: () => void;
  disabled?: boolean;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickActionItem[];
  className?: string;
  variant?: "grid" | "list";
}

const QuickActions = React.forwardRef<HTMLDivElement, QuickActionsProps>(
  ({ title = "Quick Actions", actions, className, variant = "grid", ...props }, ref) => {
    if (variant === "grid") {
      return (
        <Card ref={ref} className={cn("animate-fade-in", className)} {...props}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <span className="text-primary font-bold text-sm">⚡</span>
              </div>
              {title}
            </CardTitle>
            <CardDescription>
              Frequently used actions for quick access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {actions.map((action, index) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className={cn(
                    "h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all duration-normal animate-fade-in",
                    action.color && `hover:border-${action.color}/50`,
                    `animation-delay-${index * 100}`
                  )}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {action.icon && (
                        <action.icon className={cn("w-4 h-4", action.color)} />
                      )}
                      <span className="font-medium text-left">{action.label}</span>
                    </div>
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  {action.description && (
                    <p className="text-xs text-muted-foreground text-left leading-relaxed">
                      {action.description}
                    </p>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    // List variant
    return (
      <Card ref={ref} className={cn("animate-fade-in", className)} {...props}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <span className="text-primary font-bold text-sm">⚡</span>
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actions.map((action, index) => (
            <Button
              key={action.id}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto p-3 hover:bg-primary/5 animate-fade-in",
                `animation-delay-${index * 50}`
              )}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <div className="flex items-center gap-3 w-full">
                {action.icon && (
                  <action.icon className={cn("w-5 h-5 flex-shrink-0", action.color)} />
                )}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{action.label}</span>
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  {action.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    );
  }
);
QuickActions.displayName = "QuickActions";

export { QuickActions };
export type { QuickActionItem };
