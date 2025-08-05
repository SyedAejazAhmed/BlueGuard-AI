import { Button } from "@/components/ui/button";
import { downloadData } from "@/utils/downloadUtils";
import { 
  Download,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DownloadButtonProps {
  data: any;
  filename: string;
  isLoading?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "icon" | "default" | "sm" | "lg";
  className?: string;
}

export const DownloadButton = ({
  data,
  filename,
  isLoading = false,
  variant = "outline",
  size = "icon",
  className,
}: DownloadButtonProps) => {
  const handleDownload = (type: "json" | "csv") => {
    downloadData(data, {
      filename,
      type,
      includeTimestamp: true,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={isLoading || !data}
        >
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("json")}>
          <FileJson className="mr-2 h-4 w-4" />
          Download JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("csv")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Download CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
