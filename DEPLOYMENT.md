# 部署指南

本文档介绍如何将 AI Mermaid Generator 部署到生产环境。

## 📋 部署前准备

### 1. 环境要求

**前端**：
- 任何支持静态网站托管的平台
- 推荐：Vercel、Netlify、GitHub Pages

**后端**：
- Python 3.9+
- 支持 Python 应用的云平台
- 推荐：Railway、Render、Heroku、AWS、Google Cloud

### 2. 获取 API 密钥

- 注册 [DeepSeek](https://platform.deepseek.com/) 账号
- 创建生产环境的 API Key
- 确保账户有足够的余额

## 🚀 部署方案

### 方案 A: Vercel (前端) + Railway (后端)

#### 后端部署 (Railway)

1. **创建 Railway 项目**
   - 访问 [railway.app](https://railway.app/)
   - 连接 GitHub 仓库
   - 选择 `backend` 目录

2. **配置环境变量**
   ```bash
   API_KEY=your_deepseek_api_key
   HOST=0.0.0.0
   PORT=$PORT  # Railway 会自动提供
   ```

3. **部署配置**
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **获取后端 URL**
   - Railway 会生成一个公共 URL，如：`https://your-app.railway.app`

#### 前端部署 (Vercel)

1. **导入项目到 Vercel**
   - 访问 [vercel.com](https://vercel.com/)
   - 导入 GitHub 仓库

2. **配置环境变量**
   ```bash
   VITE_API_URL=https://your-app.railway.app
   ```

3. **构建配置**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **部署**
   - 点击 Deploy
   - 等待构建完成

### 方案 B: Netlify (前端) + Render (后端)

#### 后端部署 (Render)

1. **创建 Web Service**
   - 访问 [render.com](https://render.com/)
   - 创建新的 Web Service
   - 连接 GitHub 仓库

2. **配置**
   - Environment: Python 3
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **环境变量**
   ```bash
   API_KEY=your_deepseek_api_key
   HOST=0.0.0.0
   PYTHON_VERSION=3.11
   ```

4. **获取 URL**
   - 如：`https://your-app.onrender.com`

#### 前端部署 (Netlify)

1. **导入项目**
   - 访问 [netlify.com](https://www.netlify.com/)
   - 从 Git 导入

2. **构建设置**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **环境变量**
   ```bash
   VITE_API_URL=https://your-app.onrender.com
   ```

4. **部署**
   - 点击 Deploy site

### 方案 C: Docker 部署

#### 1. 创建 Dockerfile

**后端 Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**前端 Dockerfile** (`Dockerfile`):
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Docker Compose

创建 `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - API_KEY=${API_KEY}
      - HOST=0.0.0.0
      - PORT=8000
    restart: unless-stopped

  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://localhost:8000
    depends_on:
      - backend
    restart: unless-stopped
```

#### 3. 部署

```bash
# 设置环境变量
export API_KEY=your_deepseek_api_key

# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 🔒 安全配置

### 1. 后端 CORS 配置

编辑 `backend/main.py`，添加生产域名：

```python
allow_origins=[
    "https://your-frontend-domain.com",
    "http://localhost:3000",  # 保留用于本地测试
]
```

### 2. 环境变量管理

- ⚠️ **永远不要**将 `.env` 文件提交到 Git
- ✅ 使用平台的环境变量管理功能
- ✅ 生产环境使用不同的 API Key

### 3. HTTPS 配置

- ✅ 使用平台提供的免费 SSL 证书
- ✅ 强制使用 HTTPS
- ✅ 配置 HSTS 头

## 🔧 生产环境优化

### 后端优化

1. **禁用调试模式**
   ```python
   # 在 run.py 中
   uvicorn.run(
       "main:app",
       host=settings.host,
       port=settings.port,
       reload=False,  # 生产环境关闭自动重载
       log_level="warning"
   )
   ```

2. **使用生产级服务器**
   ```bash
   # 使用 gunicorn + uvicorn workers
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

3. **添加速率限制**
   ```bash
   pip install slowapi
   ```

### 前端优化

1. **构建优化**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true,
         }
       }
     }
   })
   ```

2. **CDN 配置**
   - 使用 Vercel/Netlify 的全球 CDN
   - 配置缓存策略

## 📊 监控和日志

### 1. 后端监控

**添加健康检查端点** (已包含):
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

**日志配置**:
```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### 2. 错误追踪

推荐工具：
- Sentry (前后端)
- LogRocket (前端)
- Datadog (全栈)

### 3. 性能监控

- Vercel Analytics (前端)
- Railway Metrics (后端)
- 自定义 Prometheus + Grafana

## 🔄 CI/CD 配置

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: berviantoleo/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## ✅ 部署检查清单

### 部署前
- [ ] 更新生产环境的 API Key
- [ ] 配置正确的 CORS 域名
- [ ] 移除所有 console.log
- [ ] 测试所有功能
- [ ] 检查依赖版本
- [ ] 备份数据（如有）

### 部署后
- [ ] 测试健康检查端点
- [ ] 验证前端可以访问后端 API
- [ ] 测试核心功能
- [ ] 检查响应时间
- [ ] 查看错误日志
- [ ] 设置监控告警

## 🐛 常见部署问题

### 1. CORS 错误

**症状**: 前端无法访问后端 API

**解决**:
```python
# backend/main.py
allow_origins=[
    "https://your-production-domain.com",
    "*"  # 临时测试用，生产环境不推荐
]
```

### 2. 环境变量未生效

**症状**: API Key 错误

**解决**:
- 确认平台已设置环境变量
- 检查变量名是否正确
- 重新部署应用

### 3. 构建失败

**症状**: 部署时构建错误

**解决**:
```bash
# 本地测试构建
npm run build  # 前端
pip install -r requirements.txt  # 后端
```

### 4. 端口冲突

**症状**: 应用无法启动

**解决**:
```python
# 使用平台提供的端口
port = int(os.environ.get("PORT", 8000))
```

## 📞 获取帮助

- [FastAPI 部署文档](https://fastapi.tiangolo.com/deployment/)
- [Vite 部署文档](https://vitejs.dev/guide/static-deploy.html)
- [Railway 文档](https://docs.railway.app/)
- [Vercel 文档](https://vercel.com/docs)

## 🎉 部署完成

部署成功后，你将拥有：
- ✅ 可公开访问的前端界面
- ✅ 安全的后端 API
- ✅ 受保护的 API 密钥
- ✅ 自动化的 CI/CD 流程

祝你部署顺利！🚀

