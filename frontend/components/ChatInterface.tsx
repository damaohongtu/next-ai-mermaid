import React, { useRef, useEffect, useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Message } from '../types';
import MessageContent from './MessageContent';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isGenerating: boolean;
  theme?: 'dark' | 'light';
  onMermaidClick?: (code: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isGenerating, theme = 'dark', onMermaidClick }) => {
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input);
      setInput('');
      // 重置 textarea 高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // 处理 textarea 自动调整高度
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  // 处理键盘事件（Enter 发送，Shift+Enter 换行）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 优化滚动：使用 RAF 和延迟来避免抖动
  useEffect(() => {
    if (messages.length === 0) return;
    
    // 使用 requestAnimationFrame 确保 DOM 已更新
    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        // 添加小延迟等待内容（尤其是 Mermaid 图表）完全渲染
        setTimeout(() => {
          endOfMessagesRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }, 100);
      });
    };

    scrollToBottom();
  }, [messages.length, isGenerating]); // 只在消息数量变化或生成状态变化时滚动

  return (
    <div className={`flex flex-col h-full w-full ${isDark ? 'bg-panel' : 'bg-gray-50'} border-r ${isDark ? 'border-border' : 'border-gray-200'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-border bg-dark/50' : 'border-gray-200 bg-gray-100/50'} backdrop-blur`}>
        <h2 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-gray-800'} flex items-center gap-2`}>
            <Sparkles className="text-primary w-5 h-5" />
            Next AI Mermaid
        </h2>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'} mt-1`}>Generate & Edit Diagrams with LLM</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        {messages.length === 0 && (
            <div className={`flex flex-col items-center justify-center h-full ${isDark ? 'text-slate-500' : 'text-gray-400'} opacity-60`}>
                <Bot size={48} className="mb-4" />
                <p className="text-center text-sm max-w-[200px]">Ask me to create a flowchart, sequence diagram, or mindmap.</p>
            </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-secondary text-white' : 'bg-emerald-600 text-white'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                        ? isDark 
                          ? 'bg-secondary/20 text-slate-200 border border-secondary/30 rounded-tr-sm'
                          : 'bg-blue-100 text-gray-800 border border-blue-200 rounded-tr-sm'
                        : isDark
                          ? 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'
                }`}>
                    <MessageContent content={msg.content} theme={theme} onMermaidClick={onMermaidClick} />
                </div>
                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'} mt-1 px-1`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
          </div>
        ))}
        {isGenerating && (
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Bot size={16} />
                </div>
                <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'} border p-3 rounded-2xl rounded-tl-sm text-sm flex items-center gap-2`}>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
                </div>
             </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <form onSubmit={handleSubmit} className={`p-4 ${isDark ? 'bg-dark/50' : 'bg-gray-100/50'} border-t ${isDark ? 'border-border' : 'border-gray-200'}`}>
        <div className="relative flex items-end">
            <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe a diagram..."
            disabled={isGenerating}
            rows={1}
            className={`w-full ${isDark ? 'bg-slate-900 text-slate-200 border-slate-700' : 'bg-white text-gray-800 border-gray-300'} rounded-xl pl-4 pr-12 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 ${isDark ? 'placeholder:text-slate-600' : 'placeholder:text-gray-400'} resize-none overflow-y-auto hide-scrollbar`}
            style={{ minHeight: '44px', maxHeight: '150px' }}
            />
            <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 bottom-2 p-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
            <Send size={16} />
            </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;