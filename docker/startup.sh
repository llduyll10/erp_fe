#!/bin/bash

# Startup script for ERP Frontend
# Injects environment variables into the built React app at runtime

set -e

echo "🚀 Starting ERP Frontend container..."

# Define the path to the built app
APP_DIR="/usr/share/nginx/html"
ENV_FILE="$APP_DIR/env.js"

echo "📝 Injecting environment variables..."

# Create env.js file with environment variables
cat > "$ENV_FILE" << EOF
// Runtime environment configuration
// This file is generated at container startup
window.__ENV__ = {
  VITE_APP_ENV: "${VITE_APP_ENV:-production}",
  VITE_ACCESS_TOKEN_THRESHOLD: "${VITE_ACCESS_TOKEN_THRESHOLD:-120000}",
  VITE_DOMAIN: "${VITE_DOMAIN:-}",
  VITE_API_URL: "${VITE_API_URL:-http://localhost:3000}",
  VITE_APP_CLIENT_ID: "${VITE_APP_CLIENT_ID:-}",
  VITE_APP_CLIENT_SECRET: "${VITE_APP_CLIENT_SECRET:-}",
  VITE_ROLLBAR_CLIENT_TOKEN: "${VITE_ROLLBAR_CLIENT_TOKEN:-}",
  VITE_RECAPTCHA_SITE_KEY: "${VITE_RECAPTCHA_SITE_KEY:-}",
  VITE_USER_TYPE: "${VITE_USER_TYPE:-staff}"
};

console.log("🔧 Environment loaded:", window.__ENV__);
EOF

echo "✅ Environment variables injected successfully"

# Make sure the env.js file is readable
chmod 644 "$ENV_FILE"

# Check if index.html exists and inject the env.js script
if [ -f "$APP_DIR/index.html" ]; then
    echo "📄 Injecting env.js script into index.html..."
    
    # Check if env.js script is already injected
    if ! grep -q "env.js" "$APP_DIR/index.html"; then
        # Inject the env.js script before other scripts
        sed -i 's|<head>|<head>\n    <script src="/env.js"></script>|' "$APP_DIR/index.html"
        echo "✅ env.js script injected into index.html"
    else
        echo "ℹ️  env.js script already present in index.html"
    fi
else
    echo "❌ Error: index.html not found in $APP_DIR"
    exit 1
fi

echo "🎯 Container startup completed successfully"
echo "🌐 Application will be available on port 80"
echo "🔗 API URL configured: ${VITE_API_URL:-http://localhost:3000}"