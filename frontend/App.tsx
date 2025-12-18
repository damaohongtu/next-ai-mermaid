import React, { useState, useCallback } from 'react';
import { Layout, Code2, Eye, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import MermaidRenderer from './components/MermaidRenderer';
import CodeEditor from './components/CodeEditor';
import { generateMermaidDiagram } from './services/geminiService';
import { extractMermaidCode, defaultMermaidCode } from './utils/mermaidUtils';
import { Message, ViewMode } from './types';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [code, setCode] = useState<string>(defaultMermaidCode);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showChat, setShowChat] = useState(true);

  // 主题样式配置
  const themeStyles = {
    dark: {
      bg: 'bg-darker',
      text: 'text-slate-200',
      panel: 'bg-panel',
      border: 'border-border',
    },
    light: {
      bg: 'bg-white',
      text: 'text-gray-800',
      panel: 'bg-gray-50',
      border: 'border-gray-200',
    }
  };

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsGenerating(true);

    try {
      // Call API
      const responseText = await generateMermaidDiagram(
        text, 
        newHistory.map(m => ({ role: m.role, content: m.content }))
      );

      // Extract code
      const extractedCode = extractMermaidCode(responseText);
      
      if (extractedCode) {
        setCode(extractedCode);
      }

      // Add model message
      const modelMsg: Message = { role: 'model', content: responseText, timestamp: Date.now() };
      setMessages([...newHistory, modelMsg]);

    } catch (err) {
      console.error(err);
      const errorMsg: Message = { 
        role: 'model', 
        content: "Sorry, I encountered an error while generating the diagram. Please try again.", 
        timestamp: Date.now() 
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Error will be cleared by Renderer onSuccess or updated by onError
  };

  const handleError = useCallback((err: string) => {
    setError(err);
  }, []);

  const handleSuccess = useCallback(() => {
    setError(null);
  }, []);

  // 处理点击聊天框中的 Mermaid 图表
  const handleMermaidClick = useCallback((mermaidCode: string) => {
    setCode(mermaidCode);
    // 如果当前是隐藏预览模式，切换到 split 模式以便查看
    if (viewMode === 'code') {
      setViewMode('split');
    }
  }, [viewMode]);

  const styles = themeStyles[theme];

  return (
    <div className={`flex h-screen w-screen ${styles.bg} ${styles.text} overflow-hidden`}>
      {/* Chat Sidebar */}
      <div 
        className={`${showChat ? 'w-80 md:w-96 translate-x-0' : 'w-0 -translate-x-full opacity-0'} 
        transition-all duration-300 ease-in-out h-full shrink-0 relative`}
      >
         <div className="w-80 md:w-96 h-full"> {/* Inner container to maintain width during transition */}
            <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                theme={theme}
                onMermaidClick={handleMermaidClick}
            />
         </div>
      </div>

      {/* Toggle Chat Button - Mobile */}
      <button 
        onClick={() => setShowChat(!showChat)}
        className={`absolute bottom-4 left-4 z-50 p-2 ${styles.panel} border ${styles.border} rounded-full ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-gray-600'} shadow-xl transition-colors md:hidden`}
      >
        {showChat ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
      </button>

      {/* Toggle Chat Button - Desktop */}
       <button 
        onClick={() => setShowChat(!showChat)}
        className={`absolute top-1/2 -translate-y-1/2 z-20 p-1 ${styles.panel} border ${styles.border} rounded-r-md ${theme === 'dark' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-200 text-gray-600'} shadow-md transition-all hidden md:flex ${showChat ? 'left-96' : 'left-0'}`}
        style={{ transitionDuration: '300ms' }}
      >
        {showChat ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>


      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Toolbar */}
        <div className={`h-14 ${styles.panel} border-b ${styles.border} flex items-center justify-between px-6 shrink-0`}>
            <div className="flex items-center gap-4">
                <span className={`font-semibold text-sm tracking-wide ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Workspace</span>
            </div>
            
            {/* View Mode and Theme Toggle */}
            <div className="flex items-center gap-4">
                {/* View Mode Buttons */}
                <div className={`flex ${theme === 'dark' ? 'bg-dark' : 'bg-gray-100'} rounded-lg p-1 border ${styles.border}`}>
                    <button 
                        onClick={() => setViewMode('code')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          viewMode === 'code' 
                            ? theme === 'dark' ? 'bg-panel text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                            : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Code2 size={14} /> Code
                    </button>
                    <button 
                        onClick={() => setViewMode('split')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          viewMode === 'split' 
                            ? theme === 'dark' ? 'bg-panel text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                            : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Layout size={14} /> Split
                    </button>
                    <button 
                        onClick={() => setViewMode('preview')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          viewMode === 'preview' 
                            ? theme === 'dark' ? 'bg-panel text-white shadow-sm' : 'bg-white text-gray-800 shadow-sm'
                            : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Eye size={14} /> Preview
                    </button>
                </div>
                
                {/* Divider */}
                <div className={`h-6 w-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
                
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} transition-all hover:scale-105`}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-700" />}
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-hidden relative">
            <div className="flex h-full w-full gap-4">
                {/* Editor Pane */}
                <div className={`${viewMode === 'preview' ? 'hidden' : ''} ${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full transition-all duration-300`}>
                    <CodeEditor 
                        code={code} 
                        onChange={handleCodeChange} 
                        error={error}
                        theme={theme}
                    />
                </div>

                {/* Preview Pane */}
                <div className={`${viewMode === 'code' ? 'hidden' : ''} ${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full transition-all duration-300`}>
                    <MermaidRenderer 
                        code={code}
                        onError={handleError}
                        onSuccess={handleSuccess}
                        theme={theme}
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;