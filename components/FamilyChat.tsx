'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { Send, Image as ImageIcon, Smile, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function FamilyChat() {
  const { user, messages, sendMessage } = useFamily();
  const [typedText, setTypedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    sendMessage(typedText.trim());
    setTypedText('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] max-w-2xl bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-md">
      {/* Group Title Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3">
        <div className="h-9 w-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
          <MessageCircle size={18} />
        </div>
        <div>
          <h3 className="font-extrabold text-xs text-slate-900 leading-tight">La Residencia Familiar 🏡</h3>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Sala de Mensajería Activa</span>
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 p-8">
            <MessageCircle size={32} className="text-slate-300 mb-2" />
            <p className="font-semibold text-sm">Comienza la conversación</p>
            <p className="text-xs">Di algo para coordinar la comida o recordar los quehaceres.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-2.5 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                {!isMe && (
                  <img 
                    src={msg.senderPhoto} 
                    alt={msg.senderName} 
                    className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0 mt-1" 
                  />
                )}

                {/* Bubble */}
                <div className="space-y-0.5">
                  {!isMe && (
                    <span className="block text-[10px] font-bold text-slate-500 ml-1 truncate">
                      {msg.senderName}
                    </span>
                  )}

                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
                    }`}
                  >
                    <p className="break-words font-medium">{msg.text}</p>
                    
                    {/* Timestamp */}
                    <span className={`block text-[8px] mt-1.5 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Sender Bar */}
      <form onSubmit={handleSend} className="bg-white border-t border-slate-200 px-4 py-3 flex gap-2 items-center">
        <input
          type="text"
          value={typedText}
          onChange={e => setTypedText(e.target.value)}
          placeholder="Escribe un mensaje familiar..."
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 h-9"
        />
        <button
          type="submit"
          disabled={!typedText.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white p-2 h-9 w-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 disabled:hover:bg-blue-600 cursor-pointer transition shadow-md"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
