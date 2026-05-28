import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineChatAlt2, 
  HiX, 
  HiOutlineTrash, 
  HiOutlinePaperAirplane, 
  HiArrowRight, 
  HiCheckCircle,
  HiOutlineClipboardList,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineHeart
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { contactService } from '../services';
import useAuthStore from '../store/useAuthStore';

export default function CustomerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPromoBadge, setShowPromoBadge] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `### 👋 Hello! I am your Wisdom Pharmacy Care Assistant.
I am here to help you get medical product information, device guidelines, and track your package status! You can ask me:

1. **📋 Track My Shipments**
   - *"Where is my latest order?"*
   - *"Track my orders"*

2. **🤒 Medical Guidance & Ailments**
   - *"What medicine do you recommend for headache?"*
   - *"Details for Dolo 650"*

3. **🩺 Equipment Guidelines**
   - *"How do I use a nebulizer?"*
   - *"Show diagnostic equipments available"*

Feel free to use the quick-action chips below to get help instantly!`,
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
      const response = await contactService.customerChatbotSendMessage(text);
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
      console.error('Customer Chatbot error:', error);
      const errorMsg = {
        id: Math.random().toString(),
        sender: 'bot',
        text: '❌ Apologies, I encountered an issue querying the care system. Please try again in a moment.',
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
How can I assist you with your health product recommendations or order tracking queries today?`,
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

      // Medical disclaimer styling
      if (line.includes('Disclaimer:')) {
        styleClass = "text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/20 mt-3 flex items-start gap-1.5";
      }

      // Headers
      if (line.startsWith('### ')) {
        content = line.substring(4);
        styleClass = "text-md font-bold text-slate-800 dark:text-slate-100 mt-2 mb-2 flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-800 pb-1";
      } else if (line.startsWith('## ')) {
        content = line.substring(3);
        styleClass = "text-lg font-extrabold text-teal-700 dark:text-teal-400 mt-3 mb-2";
      } else if (line.startsWith('# ')) {
        content = line.substring(2);
        styleClass = "text-xl font-black text-teal-800 dark:text-teal-350 mt-4 mb-3";
      }

      // Bullets
      let isBullet = false;
      if (line.startsWith('- ') || line.startsWith('* ')) {
        content = line.substring(2);
        isBullet = true;
        styleClass = "text-sm text-slate-700 dark:text-slate-300 ml-4 mb-1 list-disc list-inside";
      }

      // Inline Bold formatting
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

  const suggestionChips = [
    { label: '📋 Track My Orders', text: 'Where is my latest order?' },
    { label: '🤒 Symptom Advice', text: 'What do you suggest for a cold and body ache?' },
    { label: '🩺 Medical Equipment', text: 'Show medical devices and equipment guidelines' },
    { label: '💊 Medicine Search', text: 'Details for Dolo 650' }
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
              className="mr-3 bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-2xl shadow-xl border border-teal-500/20 max-w-[210px] text-center backdrop-blur-md"
            >
              <p className="font-medium text-slate-200">Hi {user?.name || 'there'}! Track orders or search medicine here! 💊</p>
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
              : 'bg-gradient-to-tr from-slate-900 via-teal-950 to-teal-900 hover:from-slate-850 hover:to-teal-850 text-white border border-teal-500/40'
          }`}
          title="Care Assistant"
        >
          {isOpen ? (
            <HiX className="w-6 h-6" />
          ) : (
            <div className="relative">
              <HiOutlineChatAlt2 className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
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
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-teal-650 flex items-center justify-center text-white border border-teal-500/30 shadow-inner font-extrabold text-md">
                    W+
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Wisdom Care Assistant</h3>
                  <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-900/40 flex items-center gap-1">
                    <HiOutlineShieldCheck className="w-3.5 h-3.5 text-teal-450" /> Clinical Support
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearChat}
                  title="Clear conversation history"
                  className="p-2 text-slate-400 hover:text-rose-450 hover:bg-slate-800/50 rounded-xl transition-all duration-200"
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
                        ? 'bg-teal-650 text-white border-teal-600/30 rounded-tr-none'
                        : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-none'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="space-y-1">
                        {renderMarkdown(msg.text)}
                      </div>
                    )}

                    {/* CUSTOM INTERACTIVE WIDGETS */}
                    {msg.sender === 'bot' && msg.data && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-3">
                        {/* WIDGET 1: User Personal Orders Tracking */}
                        {msg.data.type === 'user_orders' && msg.data.orders && (
                          <div className="space-y-2">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Your Order Log</span>
                            {msg.data.orders.map((ord, idx) => (
                              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-extrabold text-slate-200">{ord.order_number}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                                    ord.status === 'delivered' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900/30' : 'bg-teal-950 text-teal-400 border border-teal-900/30'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                                  <span>Total: <strong className="text-slate-200 font-semibold">₹{ord.total}</strong></span>
                                  <span>Est. Delivery: <strong className="text-teal-400 font-semibold">{ord.estimated_delivery}</strong></span>
                                </div>
                              </div>
                            ))}
                            <a
                              href="/orders"
                              onClick={() => setIsOpen(false)}
                              className="w-full flex items-center justify-center gap-1.5 py-2 bg-teal-950 hover:bg-teal-600 text-teal-400 hover:text-white font-bold rounded-xl border border-teal-900/40 hover:border-teal-500/20 transition-all text-[11px]"
                            >
                              Go to Orders Portal <HiArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}

                        {/* WIDGET 2: Medicine / Equipment Lookup Card */}
                        {msg.data.type === 'medicine_detail' && msg.data.item && (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-teal-400 font-bold tracking-wide uppercase text-[8px] bg-teal-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <HiOutlineSparkles className="w-2.5 h-2.5" /> Catalog Profile
                              </span>
                              <span className="text-[10px] text-slate-450">Exp: {msg.data.item.expiry}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <h4 className="font-extrabold text-slate-100 text-sm">{msg.data.item.name}</h4>
                              <span className="font-black text-teal-400 text-sm">₹{msg.data.item.price}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400">
                              <span>Brand: {msg.data.item.manufacturer}</span>
                              <span className="font-bold text-slate-200">{msg.data.item.status}</span>
                            </div>
                            <a
                              href="/medicines"
                              onClick={() => setIsOpen(false)}
                              className="w-full flex items-center justify-center gap-1 py-1.5 bg-teal-950 hover:bg-teal-600 text-teal-450 hover:text-white font-bold rounded-lg border border-teal-900/40 hover:border-teal-550/20 transition-all text-[10px]"
                            >
                              Explore Product <HiArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* WIDGET 3: Wellness Tips */}
                        {msg.data.type === 'health_tips' && msg.data.tips && (
                          <div className="space-y-2">
                            {msg.data.tips.map((tip, index) => (
                              <div key={index} className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-xs space-y-1.5">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-teal-400 uppercase bg-teal-950 px-2 py-0.5 rounded-full w-max">
                                  <HiOutlineHeart className="w-3 h-3 text-teal-450" /> {tip.badge}
                                </div>
                                <h4 className="font-bold text-slate-100">{tip.title}</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed">{tip.description}</p>
                              </div>
                            ))}
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

              {/* Typing loader */}
              {loading && (
                <div className="flex flex-col items-start">
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none shadow-md">
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions scrollbar */}
            <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-850 overflow-x-auto flex gap-2 no-scrollbar">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.text)}
                  className="flex-shrink-0 text-[11px] font-bold text-slate-350 hover:text-white bg-slate-900 hover:bg-teal-650 border border-slate-800 hover:border-teal-550/30 px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Bottom input area */}
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
                placeholder="Ask about orders, symptoms, products..."
                disabled={loading}
                className="flex-1 bg-slate-900 text-slate-100 placeholder-slate-500 text-sm px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 border border-slate-800 focus:border-teal-600 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-11 h-11 bg-teal-650 hover:bg-teal-700 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-2xl flex items-center justify-center transition-all duration-200 flex-shrink-0 border border-teal-600/30 disabled:border-transparent shadow-lg"
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
