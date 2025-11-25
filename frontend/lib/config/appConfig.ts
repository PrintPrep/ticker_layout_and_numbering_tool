// lib/config/appConfig.ts

export const APP_CONFIG = {
  // File upload limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_FILE_TYPES: [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ],

  // Export settings
  EXPORT_POLL_INTERVAL: 1000, // 1 second
  EXPORT_MAX_WAIT_TIME: 300000, // 5 minutes

  // Default layout settings
  DEFAULT_PAPER_SIZE: "A4",
  DEFAULT_CARD_WIDTH: 50,
  DEFAULT_CARD_HEIGHT: 90,
  DEFAULT_MARGIN: 5,
  DEFAULT_SPACING: 5,

  // Numbering defaults
  DEFAULT_FONT_FAMILY: "Helvetica",
  DEFAULT_FONT_SIZE: 12,
  DEFAULT_COLOR: "#000000",

  // Feature flags
  ENABLE_AUTH: false, // Set to true when auth is implemented
  ENABLE_CLOUD_SAVE: false, // Set to true when cloud storage is ready
  ENABLE_PROJECT_HISTORY: false, // Set to true when DB is ready
};
