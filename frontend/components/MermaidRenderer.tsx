import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RefreshCcw, Download } from 'lucide-react';

interface MermaidRendererProps {
  code: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  theme?: 'dark' | 'light';
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code, onError, onSuccess, theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [lastRenderTime, setLastRenderTime] = useState<number>(Date.now());
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
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
        // Unique ID for each render to avoid conflicts
        const id = `mermaid-${Date.now()}`;
        
        // mermaid.render returns an object { svg: string }
        const { svg } = await mermaid.render(id, code);
        setSvgContent(svg);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Mermaid Render Error:', error);
        // Mermaid puts error text in the DOM automatically sometimes, 
        // but we want to catch it to show a nice UI.
        const errorMessage = error instanceof Error ? error.message : 'Unknown syntax error';
        if (onError) onError(errorMessage);
        // Keep the old SVG if possible, or clear it? Let's clear it to indicate error.
        // But keeping it might be better for minor edits. Let's keep it but show error toast in parent.
      }
    };

    const timeoutId = setTimeout(() => {
        renderDiagram();
    }, 500); // Debounce typing

    return () => clearTimeout(timeoutId);
  }, [code, onError, onSuccess, theme]); // 添加 theme 依赖，主题变化时重新渲染

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
        // Zoom
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        setScale(prev => Math.min(Math.max(0.5, prev + delta), 5));
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPosition({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleDownload = () => {
      if (!svgContent) return;
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mermaid-diagram.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const resetView = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
  };

  return (
    <div className={`relative flex flex-col h-full w-full ${isDark ? 'bg-darker' : 'bg-gray-50'} overflow-hidden rounded-lg border ${isDark ? 'border-border' : 'border-gray-200'}`}>
      <div className={`absolute top-4 right-4 z-10 flex gap-2 ${isDark ? 'bg-panel/80' : 'bg-white/90'} backdrop-blur p-2 rounded-lg border ${isDark ? 'border-border' : 'border-gray-200'} shadow-lg`}>
        <button onClick={() => setScale(s => Math.min(s + 0.1, 5))} className={`p-1 ${isDark ? 'hover:bg-border text-slate-300' : 'hover:bg-gray-100 text-gray-600'} rounded`}>
            <ZoomIn size={18} />
        </button>
        <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className={`p-1 ${isDark ? 'hover:bg-border text-slate-300' : 'hover:bg-gray-100 text-gray-600'} rounded`}>
            <ZoomOut size={18} />
        </button>
        <button onClick={resetView} className={`p-1 ${isDark ? 'hover:bg-border text-slate-300' : 'hover:bg-gray-100 text-gray-600'} rounded`}>
            <RefreshCcw size={18} />
        </button>
        <button onClick={handleDownload} className={`p-1 ${isDark ? 'hover:bg-border text-slate-300' : 'hover:bg-gray-100 text-gray-600'} rounded`}>
            <Download size={18} />
        </button>
      </div>

      <div 
        ref={containerRef}
        className={`flex-1 w-full h-full overflow-hidden cursor-move flex items-center justify-center ${
          isDark 
            ? 'bg-[radial-gradient(#1e293b_1px,transparent_1px)]' 
            : 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]'
        } [background-size:16px_16px]`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="pointer-events-none" // Let clicks pass through if needed, but mainly for display
        />
        {!svgContent && (
            <div className={isDark ? 'text-slate-500' : 'text-gray-400'}>Waiting for valid Mermaid code...</div>
        )}
      </div>
    </div>
  );
};

export default MermaidRenderer;