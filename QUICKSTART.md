# WebP Wizard - 快速開始指南

## 🎯 正式伺服器部署（3 分鐘完成）

### 方法 1：使用自動部署腳本（推薦）⚡

```bash
# 一鍵部署到伺服器
./deploy.sh user@your-server.com

# 腳本會自動：
# ✓ 安裝依賴
# ✓ Build 專案
# ✓ 上傳到伺服器
```

### 方法 2：手動部署 🔧

```bash
# 1. Build 專案
npm install
npm run build

# 2. 上傳到伺服器
rsync -avz --delete dist/ user@server:/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/

# 3. 在伺服器上設置權限
ssh user@server
sudo chown -R www-data:www-data /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
sudo chmod -R 755 /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
```

---

## 📝 nginx 配置

### 關鍵變更

**❌ 移除（舊的反向代理配置）：**
```nginx
location / {
  proxy_pass http://127.0.0.1:8002/;
  # ... 其他 proxy 設定
}
```

**✅ 使用（新的靜態文件配置）：**
```nginx
root /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist;

location / {
  try_files $uri $uri/ /index.html;
}
```

### 完整配置

請參考 `nginx-production.conf` 文件，或直接複製以下配置：

```nginx
server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  
  server_name webp-wizard.ai-tracks.com;
  root /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist;
  
  # 強制 HTTPS
  if ($scheme != "https") {
    rewrite ^ https://$host$request_uri permanent;
  }
  
  # SPA 路由支援
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # 靜態資源快取
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### 應用 nginx 配置

```bash
# 測試配置
sudo nginx -t

# 重新載入
sudo systemctl reload nginx
```

---

## ✅ 驗證部署

1. **訪問網站**: https://webp-wizard.ai-tracks.com
2. **檢查控制台**: 打開 F12，確認沒有錯誤
3. **測試功能**: 上傳圖片並轉換為 WebP

---

## 🔄 更新流程

```bash
# 方法 1：使用腳本
./deploy.sh user@server.com

# 方法 2：手動
npm run build
rsync -avz --delete dist/ user@server:/path/to/dist/
```

---

## 📊 模式比較

| 特性 | 開發模式 | 生產模式 ⭐ |
|------|---------|-----------|
| 啟動 | `npm run dev` | `npm run build` + nginx |
| Port | 8002 | 不需要 |
| Node.js | 需要 | 不需要 |
| 速度 | 慢 | 快 ⚡ |
| 快取 | 無 | 1 年 |

---

## 📂 檔案結構

```
WebpWizard/
├── dist/                           # Build 輸出（上傳這個到伺服器）
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js         # 269.93 KB
│       └── index-[hash].css        # 0.56 KB
├── DEPLOYMENT.md                    # 詳細部署指南
├── QUICKSTART.md                    # 本文件
├── nginx-production.conf            # nginx 配置範例
├── deploy.sh                        # 自動部署腳本
└── CHANGED.md                       # 變更日誌
```

---

## 🆘 常見問題

**Q: 網頁空白，沒有內容？**
- 檢查 nginx root 路徑是否正確
- 確認 dist/index.html 存在
- 查看瀏覽器控制台（F12）錯誤訊息

**Q: CSS/JS 無法載入？**
- 檢查文件權限（755）
- 確認 nginx 用戶可以讀取文件

**Q: 更新後看到舊版本？**
- 清除瀏覽器快取（Ctrl + Shift + R）
- 或使用無痕模式測試

---

## 🎉 完成！

你的 WebP Wizard 現在運行在：
**👉 https://webp-wizard.ai-tracks.com**

需要幫助？查看 `DEPLOYMENT.md` 獲取詳細說明。

