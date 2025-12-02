# WebP Wizard 生產環境部署指南

## 📦 生產文件說明

Build 後的 `dist/` 目錄包含：
```
dist/
├── index.html              # 主頁面
└── assets/
    ├── index-[hash].js     # JavaScript bundle (269.93 KB)
    └── index-[hash].css    # CSS styles (0.56 KB)
```

---

## 🚀 完整部署流程

### 步驟 1：在本地 Build 專案

```bash
# 安裝依賴（如果還沒安裝）
npm install

# Build 生產版本
npm run build

# 驗證 build 結果
ls -la dist/
```

### 步驟 2：上傳到伺服器

將 `dist/` 目錄的**所有內容**上傳到伺服器：

```bash
# 使用 rsync（推薦）
rsync -avz --delete dist/ user@your-server:/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/

# 或使用 scp
scp -r dist/* user@your-server:/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
```

**重要**：確保伺服器上的路徑結構為：
```
/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

### 步驟 3：配置 nginx

#### 正式生產環境的 nginx 配置

```nginx
server {
  listen 80;
  listen [::]:80;
  listen 443 quic;
  listen 443 ssl;
  listen [::]:443 quic;
  listen [::]:443 ssl;
  http2 on;
  http3 off;
  
  {{ssl_certificate_key}}
  {{ssl_certificate}}
  
  server_name webp-wizard.ai-tracks.com;
  
  # 指向 dist 目錄（靜態文件）
  root /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist;
  
  {{nginx_access_log}}
  {{nginx_error_log}}
  
  # 強制 HTTPS
  if ($scheme != "https") {
    rewrite ^ https://$host$request_uri permanent;
  }
  
  # Let's Encrypt 驗證
  location ~ /.well-known {
    auth_basic off;
    allow all;
  }
  
  {{settings}}
  include /etc/nginx/global_settings;
  
  index index.html;
  
  # SPA 路由支援 - 所有路由都返回 index.html
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # 靜態資源快取優化
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
  }
  
  # 壓縮設定
  gzip on;
  gzip_vary on;
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/rss+xml application/atom+xml image/svg+xml text/x-component;
  gzip_min_length 1000;
  gzip_comp_level 6;
}
```

#### 關鍵變更說明

**移除的配置（不再需要反向代理）：**
```nginx
# ❌ 移除這些 proxy 配置
location / {
  proxy_pass http://127.0.0.1:{{app_port}}/;
  proxy_http_version 1.1;
  # ... 其他 proxy 設定
}
```

**新增的配置（靜態文件服務）：**
```nginx
# ✅ 使用這些靜態文件配置
root /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist;

location / {
  try_files $uri $uri/ /index.html;
}
```

### 步驟 4：測試並重新載入 nginx

```bash
# 測試 nginx 配置
sudo nginx -t

# 如果測試通過，重新載入 nginx
sudo systemctl reload nginx

# 檢查 nginx 狀態
sudo systemctl status nginx
```

---

## 🔧 驗證部署

### 1. 檢查文件權限

```bash
# 確保 nginx 用戶可以讀取文件
sudo chown -R www-data:www-data /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
sudo chmod -R 755 /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
```

### 2. 測試網站

訪問以下 URL 驗證：
- https://webp-wizard.ai-tracks.com （主頁）
- https://webp-wizard.ai-tracks.com/assets/index-[hash].js （JavaScript 文件）
- https://webp-wizard.ai-tracks.com/assets/index-[hash].css （CSS 文件）

### 3. 檢查瀏覽器控制台

打開開發者工具（F12），確認：
- ✅ 沒有 404 錯誤
- ✅ 沒有 CORS 錯誤
- ✅ 所有資源正確載入

---

## 📊 開發 vs 生產模式比較

| 特性 | 開發模式 | 生產模式（目前） |
|------|---------|----------------|
| **啟動方式** | `npm run dev` | `npm run build` + nginx |
| **需要 Node.js** | ✅ 是（port 8002） | ❌ 否（純靜態文件） |
| **nginx 配置** | 反向代理 (proxy_pass) | 靜態文件服務 (root + try_files) |
| **熱更新** | ✅ 支援 | ❌ 需要重新 build |
| **效能** | 較慢 | ⚡ 快速 |
| **文件大小** | 未壓縮 | 已優化（gzip 82.15 KB） |
| **快取** | 無 | ✅ 1 年快取 |
| **適用場景** | 開發測試 | 正式上線 |

---

## 🔄 更新部署流程

當你需要更新網站時：

```bash
# 1. 在本地更新代碼
git pull  # 或直接編輯文件

# 2. 重新 build
npm run build

# 3. 上傳到伺服器
rsync -avz --delete dist/ user@your-server:/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/

# 4. 清除瀏覽器快取（或等待用戶自然更新）
# nginx 不需要重新載入，因為是靜態文件
```

---

## ⚠️ 常見問題

### Q1: 網頁顯示 404 Not Found
**A:** 檢查 `root` 路徑是否正確，確認 `dist/index.html` 存在

### Q2: CSS/JS 文件無法載入
**A:** 檢查文件權限，確保 nginx 用戶（通常是 `www-data`）可以讀取

### Q3: 頁面空白但沒有錯誤
**A:** 打開瀏覽器控制台（F12），查看 Console 和 Network 標籤

### Q4: 更新後看到舊版本
**A:** 清除瀏覽器快取，或使用無痕模式測試

### Q5: 需要支援子路徑（如 /app/webp-wizard）
**A:** 在 `vite.config.ts` 中添加 `base: '/app/webp-wizard/'`，然後重新 build

---

## 📝 檢查清單

部署前請確認：
- [ ] 本地 build 成功（`npm run build`）
- [ ] dist 目錄包含 index.html 和 assets/
- [ ] 文件已上傳到正確路徑
- [ ] nginx 配置已更新（使用靜態文件配置）
- [ ] nginx 配置測試通過（`sudo nginx -t`）
- [ ] nginx 已重新載入（`sudo systemctl reload nginx`）
- [ ] 文件權限正確（755 for directories, 644 for files）
- [ ] HTTPS 證書有效
- [ ] 網站可以正常訪問

---

**部署完成！** 🎉

你的 WebP Wizard 應用現在運行在：
👉 **https://webp-wizard.ai-tracks.com**

