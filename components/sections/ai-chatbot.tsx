'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useChatStore } from '@/store/chat.store';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'How does the challenge work?',
  'What is the profit split?',
  'How fast are payouts?',
  'What leverage is available?',
];

const mockResponses = [
  'Our challenges start from just $99 for a $10K account with up to 90% profit split.',
  'The evaluation has two phases. Phase 1 requires 8% profit, Phase 2 requires 5%. Both have 5% daily and 10% max drawdown.',
  'Payouts are processed within 1–2 business days. We support USDT, bank transfer, Skrill, and Neteller.',
  'We offer leverage up to 1:100 on Forex and 1:50 on other instruments across all account sizes.',
  'No time limits on our challenges! Take as long as you need to reach your targets.',
  'Yes — we have a scaling plan where you can grow your funded account from $10K up to $4 million.',
  'Support is available 24/5 via live chat, Discord, and email. Premium accounts get a dedicated manager.',
];

// Button is 52px wide, 16px from right edge → window sits to its left with 10px gap
// right offset = 16 + 52 + 10 = 78px
const WINDOW_RIGHT = 78;

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, isTyping, addMessage, setTyping } = useChatStore();

  const isButtonHidden = isOpen && window.innerWidth < 640;
  const windowRight = isButtonHidden ? 16 : 78;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        // Never auto-focus on mobile to prevent keyboard
        if (!isMobile) {
          inputRef.current?.focus();
        }
      }, 120);
    }
  }, [messages, isOpen, isMobile]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? inputValue).trim();
    if (!msg) return;
    addMessage({ id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() });
    setInputValue('');
    setTyping(true);
    await new Promise((res) => setTimeout(res, 900 + Math.random() * 600));
    setTyping(false);
    addMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      timestamp: new Date(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* ── Chat Window — opens to the LEFT of the toggle button ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed z-40 flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/70 w-[320px] sm:w-[360px]"
            style={{
              bottom: 16,
              right: windowRight,
              maxHeight: 'calc(100vh - 32px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0c1e35] to-[#0f1e3a] border-b border-white/8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <Bot size={17} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0c1e35] rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">Lordfunded AI</p>
                  <p className="text-xs text-emerald-400 mt-0.5">Online · Typically replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/8 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Messages — flex-1 so it expands to fill available height */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#07111f] hide-scrollbar min-h-0">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shrink-0 mt-auto">
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-sky-500 text-white rounded-br-sm'
                        : 'bg-white/6 border border-white/8 text-slate-200 rounded-bl-sm'
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shrink-0">
                      <Bot size={12} className="text-white" />
                    </div>
                    <div className="bg-white/6 border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies — only on first message */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 pt-1 bg-[#07111f] flex flex-wrap gap-1.5 shrink-0">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 transition-all whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 bg-[#07111f] border-t border-white/6 shrink-0">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-sky-500/40 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none min-w-0"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white hover:bg-sky-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={13} />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-600 mt-1.5">Powered by Lordfunded AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle Button ── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "fixed bottom-4 right-4 z-50 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-sky-500/40 text-white",
          // Hide button on small screens when chat is open
          isButtonHidden ? "hidden" : ""
        )}
        style={{ width: 52, height: 52 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageCircle size={20} />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-[#050d1a]" />
          </span>
        )}
      </motion.button>
    </>
  );
}
