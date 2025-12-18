from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import mermaid

app = FastAPI(
    title="AI Mermaid Generator API",
    description="Backend API for generating Mermaid diagrams using AI",
    version="1.0.0"
)

# 配置 CORS - 开发环境允许所有来源
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 开发环境允许所有来源
    allow_credentials=False,  # 设置为 False 以配合 allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# 注册路由
app.include_router(mermaid.router, prefix="/api", tags=["mermaid"])

@app.get("/")
async def root():
    return {
        "message": "AI Mermaid Generator API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

