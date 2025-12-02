#!/bin/bash
# WebP Wizard - 快速部署腳本
# 使用方式：./deploy.sh [server_user@server_host]

set -e  # 遇到錯誤立即停止

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SERVER=${1:-""}
REMOTE_PATH="/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist"
LOCAL_DIST="dist"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   WebP Wizard 部署腳本${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 步驟 1: 檢查依賴
echo -e "${YELLOW}[1/5]${NC} 檢查依賴..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 錯誤：npm 未安裝${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm 已安裝"

# 步驟 2: 安裝依賴
echo ""
echo -e "${YELLOW}[2/5]${NC} 安裝 Node.js 依賴..."
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓${NC} 依賴安裝完成"
else
    echo -e "${GREEN}✓${NC} 依賴已存在，跳過安裝"
fi

# 步驟 3: Build 專案
echo ""
echo -e "${YELLOW}[3/5]${NC} Building 專案..."
npm run build
echo -e "${GREEN}✓${NC} Build 完成"

# 步驟 4: 驗證 build 結果
echo ""
echo -e "${YELLOW}[4/5]${NC} 驗證 build 結果..."
if [ ! -f "$LOCAL_DIST/index.html" ]; then
    echo -e "${RED}❌ 錯誤：dist/index.html 不存在${NC}"
    exit 1
fi
if [ ! -d "$LOCAL_DIST/assets" ]; then
    echo -e "${RED}❌ 錯誤：dist/assets/ 目錄不存在${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Build 文件驗證通過"
echo ""
echo "生成的文件："
ls -lh $LOCAL_DIST/
ls -lh $LOCAL_DIST/assets/

# 步驟 5: 上傳到伺服器（如果提供了伺服器地址）
echo ""
if [ -n "$SERVER" ]; then
    echo -e "${YELLOW}[5/5]${NC} 上傳到伺服器 ${GREEN}$SERVER${NC}..."
    
    # 檢查 rsync
    if command -v rsync &> /dev/null; then
        echo "使用 rsync 上傳..."
        rsync -avz --delete $LOCAL_DIST/ $SERVER:$REMOTE_PATH/
        echo -e "${GREEN}✓${NC} 上傳完成（使用 rsync）"
    else
        echo "使用 scp 上傳..."
        scp -r $LOCAL_DIST/* $SERVER:$REMOTE_PATH/
        echo -e "${GREEN}✓${NC} 上傳完成（使用 scp）"
    fi
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   🎉 部署完成！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "你的網站現在應該可以訪問："
    echo -e "${BLUE}👉 https://webp-wizard.ai-tracks.com${NC}"
    echo ""
    echo -e "接下來的步驟："
    echo "1. 登入伺服器檢查文件權限"
    echo "2. 確認 nginx 配置正確（參考 nginx-production.conf）"
    echo "3. 重新載入 nginx: sudo systemctl reload nginx"
    echo "4. 在瀏覽器中測試網站"
else
    echo -e "${YELLOW}[5/5]${NC} 跳過上傳（未提供伺服器地址）"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   ✓ Build 完成！${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Build 文件位於: ${BLUE}$LOCAL_DIST/${NC}"
    echo ""
    echo "手動上傳到伺服器："
    echo -e "${BLUE}rsync -avz --delete $LOCAL_DIST/ user@server:$REMOTE_PATH/${NC}"
    echo ""
    echo "或使用自動上傳："
    echo -e "${BLUE}./deploy.sh user@your-server.com${NC}"
fi

echo ""

