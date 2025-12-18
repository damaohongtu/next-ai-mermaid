from openai import OpenAI
from config import get_settings

settings = get_settings()

# DeepSeek is OpenAI compatible
client = OpenAI(
    api_key=settings.api_key,
    base_url=settings.deepseek_base_url
)

SYSTEM_INSTRUCTION = """
You are an expert Mermaid.js diagram generator. 
Your goal is to generate valid, syntax-correct Mermaid.js code based on the user's description.
- Always output the mermaid code inside a markdown code block tagged with 'mermaid'.
- Example: 
```mermaid
graph TD
A-->B
```
- Do not use 'mermaid-js' or other tags, just 'mermaid'.
- If the user asks to modify an existing diagram, output the full updated diagram code.
- Keep explanations concise. Prioritize the code.
- Use modern Mermaid syntax (e.g., flowchart instead of graph if possible, unless specified).
- Ensure node IDs are alphanumeric and simple to avoid syntax errors.
"""

async def generate_mermaid_diagram(
    prompt: str,
    history: list[dict] = None
) -> str:
    """
    生成 Mermaid 图表
    
    Args:
        prompt: 用户输入的提示词
        history: 对话历史记录
    
    Returns:
        生成的 Mermaid 图表代码
    """
    try:
        if history is None:
            history = []
        
        # 转换历史记录为 OpenAI 格式
        messages = []
        for h in history:
            role = h.get("role", "user")
            # 将 'model' 角色转换为 'assistant'
            if role == "model":
                role = "assistant"
            messages.append({
                "role": role,
                "content": h.get("content", "")
            })
        
        # 构建完整的消息列表
        full_messages = [
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            *messages,
            {"role": "user", "content": prompt}
        ]
        
        # 调用 DeepSeek API
        completion = client.chat.completions.create(
            messages=full_messages,
            model="deepseek-chat",
            temperature=0.2,
            stream=False
        )
        
        response_content = completion.choices[0].message.content
        if response_content:
            return response_content
        else:
            return "Sorry, I couldn't generate a response."
            
    except Exception as e:
        raise Exception(f"Failed to generate diagram: {str(e)}")

