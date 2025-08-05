interface DownloadOptions {
  filename: string;
  type?: 'json' | 'csv';
  includeTimestamp?: boolean;
}

export const downloadData = (data: any, options: DownloadOptions): void => {
  try {
    const timestamp = options.includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
    const filename = `${options.filename}${timestamp}`;
    let content: string;
    let mimeType: string;
    
    if (options.type === 'csv') {
      content = convertToCSV(data);
      mimeType = 'text/csv';
      downloadFile(`${filename}.csv`, content, mimeType);
    } else {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      downloadFile(`${filename}.json`, content, mimeType);
    }
  } catch (error) {
    console.error('Error downloading data:', error);
    throw new Error('Failed to download data');
  }
};

function downloadFile(filename: string, content: string, mimeType: string): void {
  // Create blob with BOM for UTF-8 encoding
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), content], {
    type: `${mimeType};charset=utf-8`,
  });

  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Append link to body, click it, and remove it
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, 100);
};

const convertToCSV = (data: any[]): string => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const rows = data.map(obj => 
    headers.map(header => {
      const value = obj[header];
      // Handle nested objects and arrays
      const cellValue = typeof value === 'object' ? JSON.stringify(value) : value;
      // Escape quotes and wrap in quotes if contains comma
      return `"${String(cellValue).replace(/"/g, '""')}"`;
    }).join(',')
  );

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
};
