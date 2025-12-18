#!/bin/bash

# AI Mermaid Generator 部署脚本（Linux/Mac）

set -e  # 遇到错误立即退出

echo "=========================================="
echo "AI Mermaid Generator - 部署脚本"
echo "=========================================="
echo ""

# 配置变量
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
DEPLOY_DIR="/var/www/mermaid-app"
NGINX_CONF="nginx.conf"
SYSTEMD_SERVICE="mermaid-backend.service"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 步骤 1: 构建前端
echo -e "${YELLOW}[1/6] 构建前端...${NC}"
cd $FRONTEND_DIR
npm install
npm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"
cd ..

# 步骤 2: 安装后端依赖
echo -e "${YELLOW}[2/6] 安装后端依赖...${NC}"
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
echo -e "${GREEN}✓ 后端依赖安装完成${NC}"
cd ..

# 步骤 3: 创建部署目录
echo -e "${YELLOW}[3/6] 创建部署目录...${NC}"
mkdir -p $DEPLOY_DIR/frontend/dist
mkdir -p $DEPLOY_DIR/backend
echo -e "${GREEN}✓ 部署目录创建完成${NC}"

# 步骤 4: 复制文件
echo -e "${YELLOW}[4/6] 复制文件...${NC}"
cp -r $FRONTEND_DIR/dist/* $DEPLOY_DIR/frontend/dist/
cp -r $BACKEND_DIR/* $DEPLOY_DIR/backend/
echo -e "${GREEN}✓ 文件复制完成${NC}"

# 步骤 5: 配置 Nginx
echo -e "${YELLOW}[5/6] 配置 Nginx...${NC}"
cp $NGINX_CONF /etc/nginx/sites-available/mermaid-app
ln -sf /etc/nginx/sites-available/mermaid-app /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
echo -e "${GREEN}✓ Nginx 配置完成${NC}"

# 步骤 6: 配置并启动后端服务
echo -e "${YELLOW}[6/6] 配置后端服务...${NC}"

# 创建 systemd 服务文件
cat > /etc/systemd/system/mermaid-backend.service << EOF
[Unit]
Description=AI Mermaid Generator Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$DEPLOY_DIR/backend
Environment="PATH=$DEPLOY_DIR/backend/venv/bin"
ExecStart=$DEPLOY_DIR/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mermaid-backend
systemctl restart mermaid-backend
echo -e "${GREEN}✓ 后端服务配置完成${NC}"

# 显示状态
echo ""
echo "=========================================="
echo -e "${GREEN}部署完成！${NC}"
echo "=========================================="
echo ""
echo "服务状态："
echo "  Nginx: $(systemctl is-active nginx)"
echo "  后端: $(systemctl is-active mermaid-backend)"
echo ""
echo "访问地址："
echo "  前端: http://your-domain.com"
echo "  后端: http://your-domain.com/api"
echo "  健康检查: http://your-domain.com/health"
echo ""
echo "日志查看："
echo "  Nginx: tail -f /var/log/nginx/mermaid-*.log"
echo "  后端: journalctl -u mermaid-backend -f"
echo ""

