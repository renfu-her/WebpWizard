# 立即部署 WebP Wizard 到正式伺服器

## ✅ 確認信息

- **域名**: webp-wizard.ai-tracks.com
- **伺服器路徑**: `/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist`
- **本地 dist 目錄**: 已經 build 完成 ✓

---

## 🚀 部署步驟

### 步驟 1：上傳文件到伺服器

選擇以下任一方式：

#### 方式 A：使用自動腳本（推薦）

```bash
# 替換 user@your-server.com 為你的伺服器地址
./deploy.sh user@your-server.com
```

#### 方式 B：使用 rsync（推薦）

```bash
# 替換 user 和 server 為實際值
rsync -avz --delete \
  dist/ \
  user@server:/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
```

#### 方式 C：使用 scp

```bash
# 先清空遠端目錄（可選）
ssh user@server "rm -rf /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/*"

# 上傳文件
scp -r dist/* \
  user@server:/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
```

#### 方式 D：使用 FTP/SFTP 客戶端

使用 FileZilla、WinSCP 等工具：
1. 連接到伺服器
2. 進入 `/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/`
3. 上傳 `dist/` 目錄中的所有文件

---

### 步驟 2：設置文件權限（在伺服器上執行）

```bash
# SSH 登入伺服器
ssh user@server

# 設置正確的權限
sudo chown -R www-data:www-data /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
sudo chmod -R 755 /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
sudo find /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/ -type f -exec chmod 644 {} \;

# 驗證文件存在
ls -la /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
```

應該看到：
```
total XX
drwxr-xr-x  3 www-data www-data 4096 Dec  2 XX:XX .
drwxr-xr-x  X www-data www-data 4096 Dec  2 XX:XX ..
drwxr-xr-x  2 www-data www-data 4096 Dec  2 XX:XX assets
-rw-r--r--  1 www-data www-data  XXX Dec  2 XX:XX index.html
```

---

### 步驟 3：更新 nginx 配置

#### 檢查當前 nginx 配置

```bash
# 找到配置文件
sudo nano /etc/nginx/sites-available/webp-wizard.ai-tracks.com
# 或
sudo nano /etc/nginx/conf.d/webp-wizard.ai-tracks.com.conf
```

#### 關鍵配置內容

確保配置包含以下內容：

```nginx
server {
  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  
  server_name webp-wizard.ai-tracks.com;
  
  # 🔴 重點：指向 dist 目錄
  root /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist;
  
  # 強制 HTTPS
  if ($scheme != "https") {
    rewrite ^ https://$host$request_uri permanent;
  }
  
  index index.html;
  
  # 🔴 重點：SPA 路由支援
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # 靜態資源快取
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
  }
  
  # Gzip 壓縮
  gzip on;
  gzip_vary on;
  gzip_types text/plain text/css text/javascript application/javascript application/json;
  gzip_min_length 1000;
}
```

#### 移除舊的 proxy_pass 配置

**❌ 刪除這些行（如果存在）：**
```nginx
location / {
  proxy_pass http://127.0.0.1:8002/;     # ← 刪除
  proxy_http_version 1.1;                 # ← 刪除
  proxy_set_header X-Forwarded-Host ...;  # ← 刪除所有 proxy 相關設定
  # ...
}
```

---

### 步驟 4：測試並重新載入 nginx

```bash
# 1. 測試 nginx 配置語法
sudo nginx -t

# 如果顯示 "syntax is ok" 和 "test is successful"，繼續：

# 2. 重新載入 nginx
sudo systemctl reload nginx

# 3. 檢查 nginx 狀態
sudo systemctl status nginx

# 4. 查看 nginx 錯誤日誌（如果有問題）
sudo tail -f /var/log/nginx/error.log
```

---

### 步驟 5：驗證部署 ✅

#### 1. 瀏覽器測試

訪問：**https://webp-wizard.ai-tracks.com**

應該看到 WebP Wizard 應用界面（深色主題）

#### 2. 檢查開發者工具

按 `F12` 打開開發者工具：

**Console 標籤**：
- ✅ 應該沒有紅色錯誤
- ⚠️  可能有 Tailwind CDN 警告（正常，可忽略）

**Network 標籤**：
- ✅ `index.html` - 200 OK
- ✅ `assets/index-BkTbSFgX.js` - 200 OK (269.93 KB)
- ✅ `assets/index-BvRPf_IU.css` - 200 OK (0.56 KB)

#### 3. 功能測試

- ✅ 上傳圖片
- ✅ 裁切圖片
- ✅ 生成 WebP
- ✅ 下載圖片

---

## 🔧 故障排除

### 問題 1：404 Not Found

**原因**：nginx 找不到文件

**解決**：
```bash
# 確認文件存在
ls -la /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/index.html

# 檢查 nginx root 配置
sudo nginx -T | grep "root"

# 檢查 nginx 錯誤日誌
sudo tail -50 /var/log/nginx/error.log
```

### 問題 2：頁面空白

**原因**：JavaScript 無法載入

**解決**：
```bash
# 檢查 assets 目錄
ls -la /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/assets/

# 檢查文件權限
sudo chmod 644 /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/assets/*

# 查看瀏覽器 Console 錯誤（F12）
```

### 問題 3：CSS 樣式缺失

**原因**：CSS 文件無法載入

**解決**：
- 按 `Ctrl + Shift + R` 強制刷新
- 清除瀏覽器快取
- 檢查 Network 標籤是否有 404 錯誤

### 問題 4：仍然看到舊版本

**原因**：瀏覽器快取

**解決**：
```bash
# 1. 強制刷新：Ctrl + Shift + R (Windows/Linux) 或 Cmd + Shift + R (Mac)
# 2. 清除瀏覽器快取
# 3. 使用無痕模式測試
# 4. 檢查是否真的上傳了新文件：
ssh user@server "ls -lah /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/"
```

---

## 📋 部署檢查清單

在部署之前，確認：
- [x] 本地已成功 build（`dist/` 目錄存在）
- [ ] 已上傳所有文件到伺服器
- [ ] 文件權限設置正確（755 目錄，644 文件）
- [ ] nginx 配置已更新（使用 `root` 和 `try_files`，移除 `proxy_pass`）
- [ ] nginx 配置測試通過（`sudo nginx -t`）
- [ ] nginx 已重新載入（`sudo systemctl reload nginx`）
- [ ] 網站可以訪問（https://webp-wizard.ai-tracks.com）
- [ ] 所有靜態資源正確載入（檢查 F12 Network）
- [ ] 應用功能正常（上傳、裁切、轉換）

---

## 🎉 部署完成！

你的 WebP Wizard 應用現在應該運行在：

**👉 https://webp-wizard.ai-tracks.com**

享受你的應用！ 🚀

---

## 📞 需要幫助？

- 📚 詳細文檔：`DEPLOYMENT.md`
- ⚙️  nginx 配置範例：`nginx-production.conf`
- 🚀 自動部署腳本：`./deploy.sh`
- 📝 快速指南：`QUICKSTART.md`

