import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { Copy, Check } from 'lucide-react';
import { mermaid } from '../utils/mermaidLanguage';
import { getMermaidThemeExtensions } from '../utils/mermaidTheme';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  error: string | null;
  theme?: 'dark' | 'light';
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, error, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [copied, setCopied] = React.useState(false);

  // 配置 Mermaid 编辑器扩展
  const extensions = useMemo(() => {
    return [
      mermaid(),                              // Mermaid 语法支持
      EditorView.lineWrapping,                // 自动换行
      ...getMermaidThemeExtensions(isDark),   // Mermaid 主题
    ];
  }, [isDark]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full w-full ${isDark ? 'bg-panel' : 'bg-white'} border ${isDark ? 'border-border' : 'border-gray-200'} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 ${isDark ? 'bg-dark' : 'bg-gray-100'} border-b ${isDark ? 'border-border' : 'border-gray-200'}`}>
        <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-gray-600'} font-bold uppercase tracking-wider`}>
          Mermaid Code
        </span>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-red-400 flex items-center gap-1 animate-pulse">
              Syntax Error
            </span>
          )}
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-200'} transition-colors`}
            title="Copy code"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
            )}
          </button>
        </div>
      </div>

      {/* CodeMirror Editor */}
      <div className="flex-1 overflow-auto hide-scrollbar">
        <CodeMirror
          value={code}
          height="100%"
          theme="none" // 使用自定义主题
          extensions={extensions}
          onChange={(value) => onChange(value)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
          style={{
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            height: '100%',
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-3 ${isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-700'} text-xs font-mono border-t ${isDark ? 'border-red-900/30' : 'border-red-200'} flex items-start gap-2`}>
          <span className="text-red-500 font-bold">⚠</span>
          <div className="flex-1">
            <div className="font-bold mb-1">Syntax Error:</div>
            <div className="opacity-90">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;