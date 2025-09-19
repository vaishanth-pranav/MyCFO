import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

// Fix: Define the props interface for the ChatPanel component.
interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs md:max-w-md lg:max-w-xs xl:max-w-md px-4 py-2 rounded-xl shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white'
                    : 'bg-white/80 backdrop-blur-md text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md dark:bg-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 bg-white/50 backdrop-blur-lg shrink-0 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Simulate 6 months ahead..."
            className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none transition duration-200 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};