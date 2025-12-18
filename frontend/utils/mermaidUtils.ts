/**
 * Extracts mermaid code from a markdown string.
 * Looks for ```mermaid ... ``` blocks.
 * If not found, returns the original text if it looks like mermaid, otherwise empty string.
 */
export const extractMermaidCode = (text: string): string => {
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
  const matches = [...text.matchAll(mermaidRegex)];
  
  if (matches.length > 0) {
    // Return the last match found, as LLMs often explain then show code, or show code then explain. 
    // Usually the code block is the most important part.
    return matches[matches.length - 1][1].trim();
  }

  // Fallback: simple check if it starts with common mermaid keywords
  const trimmed = text.trim();
  const commonKeywords = ['graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'gantt', 'pie', 'flowchart'];
  if (commonKeywords.some(keyword => trimmed.startsWith(keyword))) {
    return trimmed;
  }

  return '';
};

export const defaultMermaidCode = `graph TD
    A[User] -->|Asks Question| B(Next AI Mermaid)
    B -->|Generates| C{IsValid?}
    C -->|Yes| D[Render Diagram]
    C -->|No| E[Show Error]`;
