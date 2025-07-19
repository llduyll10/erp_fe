// Environment template for runtime configuration
// This file will be replaced by startup.sh with actual environment variables

window.__ENV__ = {
  VITE_APP_ENV: 'production',
  VITE_ACCESS_TOKEN_THRESHOLD: 120000,
  VITE_DOMAIN: '',
  VITE_API_URL: 'http://localhost:3000',
  VITE_APP_CLIENT_ID: '',
  VITE_APP_CLIENT_SECRET: '',
  VITE_ROLLBAR_CLIENT_TOKEN: '',
  VITE_RECAPTCHA_SITE_KEY: '',
  VITE_USER_TYPE: 'staff'
};

console.log('🔧 Environment template loaded - will be replaced at runtime');