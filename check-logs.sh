#!/bin/bash
# WebP Wizard - 日誌檢查腳本
# 使用方式：./check-logs.sh [選項]

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   WebP Wizard 日誌檢查工具${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 選單
echo "請選擇要查看的日誌："
echo ""
echo "  ${GREEN}1${NC} - nginx 錯誤日誌（最後 50 行）"
echo "  ${GREEN}2${NC} - nginx 訪問日誌（最後 50 行）"
echo "  ${GREEN}3${NC} - 即時監控錯誤日誌"
echo "  ${GREEN}4${NC} - 即時監控訪問日誌"
echo "  ${GREEN}5${NC} - 檢查 404 錯誤"
echo "  ${GREEN}6${NC} - 檢查 500 系列錯誤"
echo "  ${GREEN}7${NC} - 檢查權限問題"
echo "  ${GREEN}8${NC} - nginx 服務狀態"
echo "  ${GREEN}9${NC} - 驗證部署文件"
echo "  ${GREEN}0${NC} - 完整健康檢查"
echo ""
read -p "請輸入選項 (0-9): " choice

case $choice in
  1)
    echo -e "\n${YELLOW}nginx 錯誤日誌（最後 50 行）：${NC}\n"
    sudo tail -50 /var/log/nginx/error.log
    ;;
  2)
    echo -e "\n${YELLOW}nginx 訪問日誌（最後 50 行）：${NC}\n"
    sudo tail -50 /var/log/nginx/access.log
    ;;
  3)
    echo -e "\n${YELLOW}即時監控錯誤日誌（按 Ctrl+C 退出）：${NC}\n"
    sudo tail -f /var/log/nginx/error.log
    ;;
  4)
    echo -e "\n${YELLOW}即時監控訪問日誌（按 Ctrl+C 退出）：${NC}\n"
    sudo tail -f /var/log/nginx/access.log
    ;;
  5)
    echo -e "\n${YELLOW}最近的 404 錯誤：${NC}\n"
    sudo grep "404" /var/log/nginx/access.log | tail -20
    ;;
  6)
    echo -e "\n${YELLOW}最近的 500 系列錯誤：${NC}\n"
    sudo grep -E "500|502|503|504" /var/log/nginx/access.log | tail -20
    ;;
  7)
    echo -e "\n${YELLOW}權限相關錯誤：${NC}\n"
    sudo grep -i "permission denied\|forbidden" /var/log/nginx/error.log | tail -20
    ;;
  8)
    echo -e "\n${YELLOW}nginx 服務狀態：${NC}\n"
    sudo systemctl status nginx
    ;;
  9)
    echo -e "\n${YELLOW}驗證部署文件：${NC}\n"
    echo "檢查 dist 目錄："
    ls -lah /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/
    echo ""
    echo "檢查 assets 目錄："
    ls -lah /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/assets/
    ;;
  0)
    echo -e "\n${YELLOW}執行完整健康檢查...${NC}\n"
    
    echo -e "${BLUE}1. nginx 服務狀態：${NC}"
    if systemctl is-active --quiet nginx; then
      echo -e "  ${GREEN}✓${NC} nginx 運行中"
    else
      echo -e "  ${RED}✗${NC} nginx 未運行"
    fi
    
    echo ""
    echo -e "${BLUE}2. 部署文件檢查：${NC}"
    if [ -f "/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/index.html" ]; then
      echo -e "  ${GREEN}✓${NC} index.html 存在"
    else
      echo -e "  ${RED}✗${NC} index.html 不存在"
    fi
    
    if [ -d "/home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/assets" ]; then
      echo -e "  ${GREEN}✓${NC} assets 目錄存在"
      asset_count=$(ls /home/ai-tracks-webp-wizard/htdocs/webp-wizard.ai-tracks.com/dist/assets/ | wc -l)
      echo -e "  ${GREEN}✓${NC} 包含 $asset_count 個文件"
    else
      echo -e "  ${RED}✗${NC} assets 目錄不存在"
    fi
    
    echo ""
    echo -e "${BLUE}3. 最近的錯誤（最後 5 條）：${NC}"
    sudo tail -5 /var/log/nginx/error.log
    
    echo ""
    echo -e "${BLUE}4. 最近的訪問（最後 5 條）：${NC}"
    sudo tail -5 /var/log/nginx/access.log
    
    echo ""
    echo -e "${BLUE}5. 檢查 404 錯誤：${NC}"
    error_count=$(sudo grep -c "404" /var/log/nginx/access.log 2>/dev/null || echo "0")
    if [ "$error_count" -eq 0 ]; then
      echo -e "  ${GREEN}✓${NC} 沒有 404 錯誤"
    else
      echo -e "  ${YELLOW}⚠${NC} 發現 $error_count 個 404 錯誤"
      sudo grep "404" /var/log/nginx/access.log | tail -3
    fi
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   健康檢查完成${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    ;;
  *)
    echo -e "\n${RED}無效的選項${NC}"
    exit 1
    ;;
esac

echo ""

