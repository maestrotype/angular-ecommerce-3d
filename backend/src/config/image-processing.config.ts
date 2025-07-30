export const imageProcessingConfig = {
  removeBgApiKey: process.env.REMOVE_BG_API_KEY || '',
  removeBgApiUrl: 'https://api.remove.bg/v1.0/removebg',
  sharpOptions: {
    quality: 90,
    format: 'png',
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  },
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  outputFormat: 'png'
}; 