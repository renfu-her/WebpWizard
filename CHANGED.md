# Change Log

## 2024-12-02 (Tuesday)

### Configuration Update for nginx Deployment

**Changes Made:**
1. **Modified `vite.config.ts`**
   - Changed dev server port from `3000` to `8002` to match nginx reverse proxy configuration
   - Changed host from `0.0.0.0` to `127.0.0.1` for security (only accessible via nginx)

2. **Development Server Started**
   - Successfully started Vite development server on port 8002
   - Server is now accessible via nginx reverse proxy at `webp-wizard.ai-tracks.com`

**Deployment Options:**

### Option 1: Development Mode (Current)
- Vite dev server runs on port 8002
- nginx acts as reverse proxy
- Hot module replacement (HMR) enabled
- Best for: Development and testing

### Option 2: Production Mode (Recommended)
- Build static files: `npm run build`
- Deploy `dist/` folder to `/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist`
- Modify nginx to serve static files directly (remove proxy_pass)
- Add `try_files $uri $uri/ /index.html;` for SPA routing
- Best for: Production deployment

**nginx Configuration Notes:**
- Current nginx config uses reverse proxy (suitable for dev mode)
- For production, should be changed to serve static files from `dist/` directory
- Domain: webp-wizard.ai-tracks.com
- SSL/TLS enabled with HTTP/2 and QUIC support

**Commands:**
```bash
# Install dependencies
npm install

# Development mode (port 8002)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

