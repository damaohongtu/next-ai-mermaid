import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check } from 'lucide-react';

interface MessageContentProps {
  content: string;
  theme?: 'dark' | 'light';
  onMermaidClick?: (code: string) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({ content, theme = 'dark', onMermaidClick }) => {
  const isDark = theme === 'dark';

  // 解析消息内容，提取 Mermaid 代码块和普通文本
  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'mermaid' | 'code', content: string, language?: string }> = [];
    // 匹配代码块：```language\n...code...\n```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // 添加代码块前的文本
      if (match.index > lastIndex) {
        const textContent = text.slice(lastIndex, match.index).trim();
        if (textContent) {
          parts.push({ type: 'text', content: textContent });
        }
      }

      const language = match[1]?.toLowerCase() || '';
      const code = match[2].trim();

      if (language === 'mermaid') {
        parts.push({ type: 'mermaid', content: code });
      } else {
        parts.push({ type: 'code', content: code, language });
      }

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余的文本
    if (lastIndex < text.length) {
      const textContent = text.slice(lastIndex).trim();
      if (textContent) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    // 如果没有匹配到任何代码块，整个内容作为文本
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }

    return parts;
  };

  const parts = parseContent(content);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === 'mermaid') {
          return <MermaidBlock key={index} code={part.content} theme={theme} onClick={onMermaidClick} />;
        } else if (part.type === 'code') {
          return <CodeBlock key={index} code={part.content} language={part.language} theme={theme} />;
        } else {
          return (
            <div key={index} className="whitespace-pre-wrap break-words">
              {part.content}
            </div>
          );
        }
      })}
    </div>
  );
};

// Mermaid 渲染块组件
const MermaidBlock: React.FC<{ code: string; theme: 'dark' | 'light'; onClick?: (code: string) => void }> = ({ code, theme, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    });
  }, [theme]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || !containerRef.current) return;

      try {
        // 使用时间戳和随机整数生成唯一 ID，避免小数点
        const id = `mermaid-chat-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        const { svg } = await mermaid.render(id, code);
        setSvgContent(svg);
        setError('');
      } catch (err) {
        console.error('Mermaid Render Error:', err);
        setError(err instanceof Error ? err.message : '渲染错误');
      }
    };

    renderDiagram();
  }, [code, theme]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDiagramClick = () => {
    if (onClick) {
      onClick(code);
    }
  };

  return (
    <div className={`relative rounded-lg border ${isDark ? 'border-slate-700 bg-slate-900/50 hover:border-primary/50' : 'border-gray-200 bg-gray-50 hover:border-primary/50'} overflow-hidden transition-all cursor-pointer group`}>
      {/* 工具栏 */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-100/50'}`}>
        <span className={`text-xs font-medium ${isDark ? 'text-slate-400 group-hover:text-primary' : 'text-gray-500 group-hover:text-primary'} transition-colors`}>
          Mermaid 图表 <span className="opacity-60 ml-1">(点击查看完整版)</span>
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className={`p-1 rounded hover:bg-slate-700 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          title="复制代码"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {/* 图表内容 - 缩略图模式 */}
      <div
        ref={containerRef}
        onClick={handleDiagramClick}
        className={`p-4 flex items-center justify-center min-h-[120px] max-h-[300px] overflow-hidden ${
          isDark ? 'bg-slate-950/30 hover:bg-slate-950/50' : 'bg-white hover:bg-gray-50'
        } transition-colors`}
      >
        {error ? (
          <div className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'} p-3 rounded border ${isDark ? 'border-red-900 bg-red-950/30' : 'border-red-200 bg-red-50'}`}>
            <div className="font-semibold mb-1">渲染失败</div>
            <div className="opacity-80">{error}</div>
          </div>
        ) : svgContent ? (
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="mermaid-chat-render-thumbnail"
            style={{
              maxWidth: '100%',
              maxHeight: '268px',
              transform: 'scale(0.85)',
              transformOrigin: 'center center'
            }}
          />
        ) : (
          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            正在渲染图表...
          </div>
        )}
      </div>
    </div>
  );
};

// 普通代码块组件
const CodeBlock: React.FC<{ code: string; language?: string; theme: 'dark' | 'light' }> = ({ code, language, theme }) => {
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative rounded-lg border ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-200 bg-gray-50'} overflow-hidden`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-100/50'}`}>
        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className={`p-1 rounded hover:bg-slate-700 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
          title="复制代码"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className={`p-3 overflow-x-auto text-xs ${isDark ? 'text-slate-300' : 'text-gray-800'}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default MessageContent;

