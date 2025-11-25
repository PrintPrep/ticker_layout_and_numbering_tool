// ============================================================================
// FILE: lib/utils/exportHelpers.ts
// ============================================================================

/**
 * Poll export job status
 */
export async function pollExportStatus(
  jobId: string,
  onProgress: (progress: number, status: string) => void,
  interval: number = 1000,
  maxAttempts: number = 300 // 5 minutes
): Promise<any> {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        attempts++;

        const response = await fetch(`/api/export/status/${jobId}`);
        if (!response.ok) {
          throw new Error("Failed to get export status");
        }

        const data = await response.json();
        onProgress(data.progress || 0, data.status);

        if (data.status === "completed") {
          resolve(data);
          return;
        }

        if (data.status === "failed") {
          reject(new Error(data.error || "Export failed"));
          return;
        }

        if (attempts >= maxAttempts) {
          reject(new Error("Export timeout"));
          return;
        }

        // Continue polling
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Download file from URL
 */
export function downloadFile(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}