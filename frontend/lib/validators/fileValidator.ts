// ============================================================================
// FILE: lib/validators/fileValidator.ts
// ============================================================================

export function validateImageFile(file: File): boolean {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  return allowedTypes.includes(file.type);
}

export function validatePDFFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function validateDataFile(file: File): boolean {
  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const allowedExtensions = [".csv", ".xls", ".xlsx"];

  return (
    allowedTypes.includes(file.type) ||
    allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}