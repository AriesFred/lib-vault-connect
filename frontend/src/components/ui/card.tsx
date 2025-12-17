import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "gradient";
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, ...props }, ref) => {
    const baseClasses = "rounded-xl bg-card text-card-foreground border transition-all duration-normal group";

    const variantClasses = {
      default: "border shadow-sm hover:shadow-md",
      elevated: "border shadow-md hover:shadow-xl hover:shadow-primary/10",
      outlined: "border-2 border-border bg-transparent hover:border-primary/50",
      gradient: "border-0 bg-gradient-to-br from-card to-card-muted shadow-md hover:shadow-lg",
    };

    const hoverClasses = hover
      ? "hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/20 cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], hoverClasses, className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compact" | "featured";
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "flex flex-col space-y-1.5 p-6",
      compact: "flex flex-col space-y-1 p-4",
      featured: "flex flex-col space-y-2 p-6 bg-gradient-to-r from-primary/5 to-transparent rounded-t-xl",
    };

    return <div ref={ref} className={cn(variantClasses[variant], className)} {...props} />;
  },
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight text-foreground",
        "bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text",
        className
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground leading-relaxed", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compact";
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "p-6 pt-0",
      compact: "p-4 pt-0",
    };

    return <div ref={ref} className={cn(variantClasses[variant], className)} {...props} />;
  },
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compact" | "actions";
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "flex items-center p-6 pt-0",
      compact: "flex items-center p-4 pt-0",
      actions: "flex items-center justify-between p-6 pt-0 border-t border-border/50 bg-muted/20",
    };

    return <div ref={ref} className={cn(variantClasses[variant], className)} {...props} />;
  },
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

