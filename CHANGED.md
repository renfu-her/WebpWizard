# Change Log

## 2024-12-02 (Tuesday) - Update 2: Production Build Configuration

### 生產環境 Build 配置完成

**問題修復：**
1. **修復 Build 失敗問題**
   - 移除 `index.html` 中的 import map（Vite build 時不需要）
   - 將內嵌的 `<style>` 標籤移至獨立的 `styles.css` 文件
   - 添加入口 script 標籤：`<script type="module" src="/index.tsx"></script>`

2. **Build 成功生成文件**
   - `dist/index.html` (0.69 KB)
   - `dist/assets/index-BkTbSFgX.js` (269.93 KB, gzip: 82.15 KB)
   - `dist/assets/index-BvRPf_IU.css` (0.56 KB)

**新增文件：**
- ✅ `DEPLOYMENT.md` - 完整的生產環境部署指南
- ✅ `nginx-production.conf` - 正式生產環境的 nginx 配置
- ✅ `styles.css` - 自定義樣式文件（從 HTML 中抽離）

**生產環境配置要點：**
- 使用靜態文件服務，不需要 Node.js server
- nginx 配置從 **反向代理模式** 改為 **靜態文件模式**
- 添加了 SPA 路由支援（`try_files $uri $uri/ /index.html`）
- 添加了靜態資源快取（1 年）和 gzip 壓縮
- 添加了安全 headers

**部署路徑：**
```
/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

---

## 2024-12-02 (Tuesday) - Update 1: Configuration Update for nginx Deployment

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

