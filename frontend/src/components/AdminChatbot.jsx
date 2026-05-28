import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineChatAlt2, 
  HiX, 
  HiOutlineTrash, 
  HiOutlinePaperAirplane, 
  HiOutlineRefresh, 
  HiArrowRight, 
  HiTrendingUp, 
  HiOutlineClipboardList, 
  HiOutlineCube,
  HiExclamation,
  HiOutlinePlus,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { adminService } from '../services';

export default function AdminChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPromoBadge, setShowPromoBadge] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `### 👋 Hello Admin! I am your Wisdom Pharmacy Smart Assistant.
I can analyze live database logs and provide immediate reports to help you manage the store efficiently. Try asking me questions like:

1. **📦 Stock & Inventory Check**
   - *"What is the stock of Dolo 650?"*
   - *"Show me low stock medicines"*
   - *"Which medicines are out of stock?"*

2. **⏳ Shelf Life & Expiry Control**
   - *"Which medicines are expiring soon?"*
   - *"Any expired medicines?"*

3. **💡 Business Strategy & Revenue Optimization**
   - *"How can I increase revenue?"*
   - *"Financial tips based on sales metrics"*

4. **📋 Order Fulfillment Tracking**
   - *"How many deliveries are completed?"*
   - *"Tell me about processing or returned orders"*`,
      timestamp: new Date(),
      data: { type: 'greeting' }
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Hide the promotional bubble badge after 7 seconds
    const timer = setTimeout(() => setShowPromoBadge(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await adminService.chatbotSendMessage(text);
      if (response.data.success) {
        const botMsg = {
          id: Math.random().toString(),
          sender: 'bot',
          text: response.data.message,
          timestamp: new Date(),
          data: response.data.data
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMsg = {
        id: Math.random().toString(),
        sender: 'bot',
        text: '❌ Apologies, I encountered an issue querying the database. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: `### 👋 Welcome back! Let's start fresh.
How can I assist you with your Wisdom-Pharma admin panel operations today? Ask about inventory, order states, or strategies to grow your revenue.`,
          timestamp: new Date(),
          data: { type: 'greeting' }
        }
      ]);
      toast.success('Conversation history cleared');
    }
  };

  // Helper to parse very simple markdown bold, headers, and bullet points
  const renderMarkdown = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      let styleClass = "text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-1.5";

      // Headers
      if (line.startsWith('### ')) {
        content = line.substring(4);
        styleClass = "text-md font-bold text-slate-800 dark:text-slate-100 mt-2 mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1";
      } else if (line.startsWith('## ')) {
        content = line.substring(3);
        styleClass = "text-lg font-extrabold text-indigo-700 dark:text-indigo-400 mt-3 mb-2";
      } else if (line.startsWith('# ')) {
        content = line.substring(2);
        styleClass = "text-xl font-black text-indigo-800 dark:text-indigo-300 mt-4 mb-3";
      }

      // Bullets
      let isBullet = false;
      if (line.startsWith('- ') || line.startsWith('* ')) {
        content = line.substring(2);
        isBullet = true;
        styleClass = "text-sm text-slate-700 dark:text-slate-300 ml-4 mb-1 list-disc list-inside";
      }

      // Inline Bold formatting
      // Replace **text** with <strong>text</strong>
      const boldParts = [];
      let lastIndex = 0;
      const regex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          boldParts.push(content.substring(lastIndex, match.index));
        }
        boldParts.push(<strong key={match.index} className="font-semibold text-slate-900 dark:text-white">{match[1]}</strong>);
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < content.length) {
        boldParts.push(content.substring(lastIndex));
      }

      const formattedContent = boldParts.length > 0 ? boldParts : content;

      return (
        <p key={idx} className={styleClass}>
          {isBullet ? "• " : ""}
          {formattedContent}
        </p>
      );
    });
  };

  // Quick reply action triggers
  const suggestionChips = [
    { label: '📊 Order Status', text: 'What is happening with orders?' },
    { label: '⚠️ Low Stock Alert', text: 'Show me low stock medicines' },
    { label: '⏳ Near Expiry', text: 'Which medicines are expiring soon?' },
    { label: '💡 Increase Revenue', text: 'How can I increase revenue?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Trigger Bubble */}
      <div className="relative flex items-center">
        <AnimatePresence>
          {showPromoBadge && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mr-3 bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-2xl shadow-xl border border-indigo-500/20 max-w-[200px] text-center backdrop-blur-md"
            >
              <p className="font-medium text-slate-200">Hi Admin! Need quick reports? Ask me here! 👋</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPromoBadge(false);
                }} 
                className="absolute -top-1.5 -right-1.5 p-0.5 bg-slate-800 text-slate-400 hover:text-white rounded-full border border-slate-700 shadow"
              >
                <HiX className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowPromoBadge(false);
          }}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen 
              ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500/30' 
              : 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 hover:from-slate-850 hover:to-indigo-850 text-white border border-indigo-500/40'
          }`}
          title="Admin Assistant"
        >
          {isOpen ? (
            <HiX className="w-6 h-6 animate-spin-once" />
          ) : (
            <div className="relative">
              <HiOutlineChatAlt2 className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Chatbox Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-16 right-0 w-[420px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[80vh] bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-indigo-650 flex items-center justify-center text-white border border-indigo-500/30 shadow-inner font-bold text-lg">
                    WP
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Wisdom Assistant</h3>
                  <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-900/40">Secure Admin Bot</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearChat}
                  title="Clear conversation history"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-xl transition-all duration-200"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize chat"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body - Scrollable Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Message Bubble */}
                  <div 
                    className={`p-3.5 rounded-2xl max-w-[88%] shadow-md border ${
                      msg.sender === 'user'
                        ? 'bg-indigo-650 text-white border-indigo-600/30 rounded-tr-none'
                        : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-none'
                    }`}
                  >
                    {/* Render message body content */}
                    {msg.sender === 'user' ? (
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="space-y-1">
                        {renderMarkdown(msg.text)}
                      </div>
                    )}

                    {/* RENDER CUSTOM DYNAMIC WIDGETS IF APPLICABLE */}
                    {msg.sender === 'bot' && msg.data && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-3">
                        {/* WIDGET 1: Low Stock / Out of Stock List */}
                        {(msg.data.type === 'low_stock' || msg.data.type === 'out_of_stock') && msg.data.items && (
                          <div className="space-y-2">
                            {msg.data.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-100">{item.name}</h4>
                                  <span className="text-[10px] text-slate-400">{item.manufacturer}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    item.stock === 0 
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    {item.stock} left
                                  </span>
                                  <a
                                    href="/admin/inventory"
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg transition-all"
                                    title="Open inventory management"
                                  >
                                    <HiArrowRight className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* WIDGET 2: Medicine Detail Lookup */}
                        {msg.data.type === 'medicine_detail' && msg.data.item && (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-indigo-400 font-bold tracking-wide uppercase text-[9px] bg-indigo-950 px-2 py-0.5 rounded-full">Database Sync</span>
                              <span className="text-slate-400">Exp: {msg.data.item.expiry}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-100 text-sm">{msg.data.item.name}</h4>
                              <span className="font-black text-indigo-400 text-sm">₹{msg.data.item.price}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-850 flex justify-between items-center">
                              <span className="text-slate-400">Current Stock:</span>
                              <span className="font-bold text-slate-200">{msg.data.item.stock} Units</span>
                            </div>
                            <a
                              href="/admin/inventory"
                              onClick={() => setIsOpen(false)}
                              className="w-full flex items-center justify-center gap-1 py-1.5 bg-indigo-950 hover:bg-indigo-600 text-indigo-400 hover:text-white font-bold rounded-lg border border-indigo-900/40 hover:border-indigo-500/20 transition-all text-[11px]"
                            >
                              Update Stock <HiArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* WIDGET 3: Overall Inventory Summary Overview */}
                        {msg.data.type === 'inventory_summary' && msg.data.summary && (
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                              <span className="text-[10px] text-slate-400">Total</span>
                              <p className="text-md font-extrabold text-indigo-400">{msg.data.summary.total}</p>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                              <span className="text-[10px] text-slate-400">Low Stock</span>
                              <p className="text-md font-extrabold text-amber-400">{msg.data.summary.low_stock}</p>
                            </div>
                            <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                              <span className="text-[10px] text-slate-400">Out of Stock</span>
                              <p className="text-md font-extrabold text-rose-400">{msg.data.summary.out_of_stock}</p>
                            </div>
                          </div>
                        )}

                        {/* WIDGET 4: Near Expiry Report */}
                        {msg.data.type === 'expiry_report' && msg.data.items && (
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {msg.data.items.map((item, index) => (
                              <div key={index} className="p-2 bg-slate-950 rounded-xl border border-slate-850 text-[11px] flex justify-between items-center">
                                <div>
                                  <h4 className="font-bold text-slate-200">{item.name}</h4>
                                  <span className="text-[9px] text-rose-400 font-medium">Expires: {item.expiry}</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-slate-300 font-bold">{item.stock} units</p>
                                  {item.days_left && (
                                    <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1 py-0.25 rounded">
                                      {item.days_left}d left
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* WIDGET 5: Strategic Revenue Tips */}
                        {msg.data.type === 'revenue_tips' && msg.data.tips && (
                          <div className="space-y-2">
                            {msg.data.tips.map((tip, index) => (
                              <div key={index} className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-xs space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide bg-indigo-950 px-2 py-0.5 rounded-full">
                                    {tip.badge}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-100 mt-1">{tip.title}</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed">{tip.description}</p>
                                <button
                                  onClick={() => handleSend(`Explore strategy: ${tip.title}`)}
                                  className="mt-1.5 text-[9px] text-indigo-400 hover:text-white font-bold flex items-center gap-1 transition-all"
                                >
                                  {tip.action_label} <HiArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* WIDGET 6: Orders & Deliveries Status Distribution */}
                        {msg.data.type === 'orders_report' && msg.data.summary && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-center">
                              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between px-3">
                                <span className="text-slate-400">Processing:</span>
                                <span className="font-extrabold text-indigo-400">{msg.data.summary.processing}</span>
                              </div>
                              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between px-3">
                                <span className="text-slate-400">Shipped:</span>
                                <span className="font-extrabold text-purple-400">{msg.data.summary.shipped}</span>
                              </div>
                              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between px-3">
                                <span className="text-slate-400">Delivered:</span>
                                <span className="font-extrabold text-emerald-400">{msg.data.summary.delivered}</span>
                              </div>
                              <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between px-3">
                                <span className="text-slate-400">Pending Return:</span>
                                <span className="font-extrabold text-amber-400">{msg.data.summary.return_requested}</span>
                              </div>
                            </div>
                            {msg.data.recent && (
                              <div className="space-y-1.5 pt-2 border-t border-slate-850">
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Latest Dashboard Orders</span>
                                {msg.data.recent.map((ord, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-[10px] p-1.5 bg-slate-950 rounded-lg border border-slate-850">
                                    <span className="text-slate-300 font-bold">{ord.order_number}</span>
                                    <span className="text-slate-400 font-medium">{ord.customer}</span>
                                    <span className="text-emerald-400 font-extrabold">₹{ord.total}</span>
                                    <span className={`px-1.5 py-0.25 rounded text-[8px] font-bold capitalize ${
                                      ord.status === 'processing' ? 'bg-indigo-950 text-indigo-400' : 'bg-emerald-950 text-emerald-400'
                                    }`}>
                                      {ord.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[9px] text-slate-500 mt-1 px-2 font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {/* Bot Loading Dots */}
              {loading && (
                <div className="flex flex-col items-start">
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none shadow-md">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-850 overflow-x-auto flex gap-2 no-scrollbar">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.text)}
                  className="flex-shrink-0 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-indigo-650 border border-slate-800 hover:border-indigo-500/30 px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Bottom Input Area */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-slate-950 border-t border-slate-850 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 text-sm px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-800 focus:border-indigo-600 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-11 h-11 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-2xl flex items-center justify-center transition-all duration-200 flex-shrink-0 border border-indigo-600/30 disabled:border-transparent shadow-lg"
              >
                <HiOutlinePaperAirplane className="w-5 h-5 transform rotate-90" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
