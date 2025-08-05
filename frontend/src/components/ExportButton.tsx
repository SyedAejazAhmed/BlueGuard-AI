import React from 'react';
import { Button } from "@/components/ui/button";
import { downloadData } from "@/utils/downloadUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
  data: any;
  buttonText?: string;
  filename: string;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  onExport?: () => void;
}

// Animate the button when it first appears
const fadeInAnimation = `@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`;

export function ExportButton({
  data,
  buttonText = "Download",
  filename,
  className = "",
  disabled = false,
  icon,
  onExport,
}: ExportButtonProps) {
  const handleExport = (format: 'json' | 'csv') => {
    try {
      downloadData(data, {
        filename,
        type: format,
        includeTimestamp: true
      });
      onExport?.();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 animate-fadeIn ${className}`}
          disabled={disabled}
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          {icon}
          <span className="hidden sm:inline">{buttonText}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
