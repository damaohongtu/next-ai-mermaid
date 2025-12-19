// 后端 API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.127.32:8502';

interface GenerateDiagramRequest {
  prompt: string;
  history: { role: string; content: string }[];
}

interface GenerateDiagramResponse {
  content: string;
  success: boolean;
  message: string;
}

export const generateMermaidDiagram = async (
  prompt: string, 
  history: { role: string; content: string }[] = []
): Promise<string> => {
  try {
    const requestBody: GenerateDiagramRequest = {
      prompt,
      history
    };

    const response = await fetch(`${API_BASE_URL}/api/generate-diagram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.detail || `HTTP error! status: ${response.status}`
      );
    }

    const data: GenerateDiagramResponse = await response.json();
    
    if (data.success && data.content) {
      return data.content;
    } else {
      throw new Error(data.message || "Failed to generate diagram");
    }
  } catch (error) {
    console.error("Backend API Error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate diagram: ${error.message}`);
    }
    throw new Error("Failed to generate diagram from backend.");
  }
};