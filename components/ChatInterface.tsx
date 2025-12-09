import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { InteractionStyle, ChatMessage, AppSettings } from '../types';
import { startChat, ChatSession } from '../services/geminiService';

interface ChatInterfaceProps {
  initialMessages: ChatMessage[];
  onBack: () => void;
  settings: AppSettings;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMessages, onBack, settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session with history
    try {
      chatSessionRef.current = startChat(initialMessages);
    } catch (e) {
      console.error("Failed to start chat session", e);
    }
  }, []); // Run once on mount

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg });
      const responseText = result.text || "I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const getContainerClass = () => {
    switch (settings.interactionStyle) {
      case InteractionStyle.TECH:
        return 'font-mono text-cyan-500';
      case InteractionStyle.MINIMAL:
        return 'text-gray-900';
      default: // FLUID
        return 'text-white';
    }
  };

  const getMessageBubbleClass = (role: 'user' | 'model') => {
    const isUser = role === 'user';
    if (settings.interactionStyle === InteractionStyle.TECH) {
      return isUser 
        ? 'bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 rounded-none' 
        : 'bg-black/80 border border-cyan-900/50 text-cyan-100 rounded-none';
    }
    if (settings.interactionStyle === InteractionStyle.MINIMAL) {
      return isUser 
        ? 'bg-gray-100 text-gray-900 rounded-2xl rounded-tr-sm' 
        : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm';
    }
    // FLUID
    return isUser 
      ? 'bg-white/20 backdrop-blur-md text-white rounded-2xl rounded-tr-sm' 
      : 'bg-black/40 backdrop-blur-md text-white/90 rounded-2xl rounded-tl-sm';
  };

  const inputClass = () => {
    if (settings.interactionStyle === InteractionStyle.TECH) {
      return 'bg-black/90 border-t-2 border-cyan-500/50';
    }
    if (settings.interactionStyle === InteractionStyle.MINIMAL) {
      return 'bg-white border-t border-gray-200';
    }
    return 'bg-gray-900/40 backdrop-blur-xl border-t border-white/10';
  };

  return (
    <div className={`flex flex-col h-screen w-full animate-fade-in ${getContainerClass()}`}>
      
      {/* Header */}
      <div className={`flex items-center gap-4 p-4 shrink-0 ${
        settings.interactionStyle === InteractionStyle.MINIMAL ? 'bg-white border-b border-gray-100' : 'bg-black/10 backdrop-blur-sm border-b border-white/5'
      }`}>
        <button 
          onClick={onBack}
          className={`p-2 rounded-full transition-colors ${
            settings.interactionStyle === InteractionStyle.MINIMAL ? 'hover:bg-gray-100' : 'hover:bg-white/10'
          }`}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles size={16} className={settings.interactionStyle === InteractionStyle.TECH ? 'text-cyan-400' : 'text-purple-400'} />
            AI Chat
          </h1>
          <span className="text-xs opacity-60">Gemini 2.5 Flash</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                settings.interactionStyle === InteractionStyle.MINIMAL 
                  ? (msg.role === 'user' ? 'bg-gray-200' : 'bg-purple-100 text-purple-600')
                  : (msg.role === 'user' ? 'bg-white/20' : 'bg-gradient-to-br from-purple-500 to-pink-500')
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] md:max-w-[70%] p-4 leading-relaxed whitespace-pre-wrap ${getMessageBubbleClass(msg.role)}`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 animate-pulse">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                settings.interactionStyle === InteractionStyle.MINIMAL ? 'bg-purple-100 text-purple-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}>
                <Bot size={14} />
              </div>
              <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm ${
                settings.interactionStyle === InteractionStyle.MINIMAL ? 'bg-white border border-gray-200' : 'bg-black/40'
              }`}>
                <Loader2 size={16} className="animate-spin opacity-50" />
                <span className="text-sm opacity-50">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={`p-4 md:p-6 shrink-0 z-10 ${inputClass()}`}>
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 bg-transparent outline-none h-12 px-4 text-lg ${
               settings.interactionStyle === InteractionStyle.TECH ? 'placeholder-cyan-800' : 
               settings.interactionStyle === InteractionStyle.MINIMAL ? 'placeholder-gray-400' : 'placeholder-white/30'
            }`}
            autoFocus
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              settings.interactionStyle === InteractionStyle.TECH 
                ? 'bg-cyan-900/50 text-cyan-400 hover:bg-cyan-800/50 rounded-none border border-cyan-500/50' 
                : settings.interactionStyle === InteractionStyle.MINIMAL
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default ChatInterface;