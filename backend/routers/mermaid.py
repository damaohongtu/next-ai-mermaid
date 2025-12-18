from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ai_service import generate_mermaid_diagram

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class GenerateDiagramRequest(BaseModel):
    prompt: str
    history: list[Message] = []

class GenerateDiagramResponse(BaseModel):
    content: str
    success: bool
    message: str = ""

@router.post("/generate-diagram", response_model=GenerateDiagramResponse)
async def generate_diagram(request: GenerateDiagramRequest):
    """
    生成 Mermaid 图表
    
    接收用户的提示词和对话历史，返回生成的 Mermaid 图表代码
    """
    try:
        # 转换 history 为字典列表
        history_dict = [
            {"role": msg.role, "content": msg.content} 
            for msg in request.history
        ]
        
        # 调用 AI 服务生成图表
        content = await generate_mermaid_diagram(
            prompt=request.prompt,
            history=history_dict
        )
        
        return GenerateDiagramResponse(
            content=content,
            success=True,
            message="Diagram generated successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate diagram: {str(e)}"
        )

@router.get("/health")
async def health():
    """健康检查端点"""
    return {"status": "ok", "service": "mermaid"}

