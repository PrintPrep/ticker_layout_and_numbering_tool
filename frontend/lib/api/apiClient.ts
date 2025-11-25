// lib/api/apiClient.ts

/**
 * API Client for communicating with Python backend
 */

const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = PYTHON_BACKEND_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Process uploaded file (PDF or image)
   */
  async processFile(fileData: {
    file: string; // base64
    filename: string;
    side: "front" | "back";
    userId?: string;
  }) {
    return this.request("/api/v1/files/process", {
      method: "POST",
      body: JSON.stringify(fileData),
    });
  }

  /**
   * Generate QR code preview
   */
  async generateQR(data: {
    data: string;
    size?: number;
    errorCorrection?: "L" | "M" | "Q" | "H";
  }) {
    return this.request("/api/v1/numbering/generate-qr", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Generate barcode preview
   */
  async generateBarcode(data: {
    data: string;
    type?: string;
    height?: number;
    showText?: boolean;
  }) {
    return this.request("/api/v1/numbering/generate-barcode", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Import CSV/XLSX data
   */
  async importData(fileData: {
    file: string; // base64
    filename: string;
    projectId: string;
    userId?: string;
  }) {
    return this.request("/api/v1/numbering/import-data", {
      method: "POST",
      body: JSON.stringify(fileData),
    });
  }

  /**
   * Optimize layout
   */
  async optimizeLayout(config: {
    paperWidthMm: number;
    paperHeightMm: number;
    cardWidthMm: number;
    cardHeightMm: number;
    cardCount?: number;
    topMarginMm?: number;
    bottomMarginMm?: number;
    leftMarginMm?: number;
    rightMarginMm?: number;
    spacingMm?: number;
    horizontalOnly?: boolean;
    verticalOnly?: boolean;
    autoRotate?: boolean;
  }) {
    return this.request("/api/v1/layout/optimize", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  /**
   * Initiate PDF export
   */
  async initiateExport(exportData: any) {
    return this.request("/api/v1/export/initiate", {
      method: "POST",
      body: JSON.stringify(exportData),
    });
  }

  /**
   * Get export job status
   */
  async getExportStatus(jobId: string) {
    return this.request(`/api/v1/export/status/${jobId}`, {
      method: "GET",
    });
  }
}

// Singleton instance
export const apiClient = new APIClient();