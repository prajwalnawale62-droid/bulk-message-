# Bulk Messenger Pro - Deployment Guide

## Prerequisites
1. **Supabase Account**: Your project `psoxjvuyfijsgitxerme` is already integrated.
2. **WhatsApp Business API**: Set up an app on the Meta for Developers portal and get your `Access Token` and `Phone Number ID`.
3. **Gemini API Key**: Get your key from Google AI Studio.

## Environment Variables
Set the following variables in the platform's Secrets/Environment Variables panel:

```env
# Supabase (Already integrated with your project)
VITE_SUPABASE_URL=https://psoxjvuyfijsgitxerme.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzb3hqdnV5Zmlqc2dpdHhlcm1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzI5NTgsImV4cCI6MjA4Nzg0ODk1OH0.jGeEPhlHz244WBnK9L2qiT6i_j_gC0xR9VjFxuieaZs

# WhatsApp
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_id

# AI
GEMINI_API_KEY=your_gemini_key
```

## Local Development
1. Install dependencies: `npm install`
2. Start the full-stack dev server: `npm run dev`

## Production Build
1. Build the frontend: `npm run build`
2. The server serves the static files from `dist/` in production mode.

## Netlify Configuration
The `netlify.toml` file is configured to handle the full-stack build and proxy.

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
