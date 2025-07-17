
import { Loader2 } from "lucide-react";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Loader = ({ className = "", size = "md" }: LoaderProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
};
