'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import ProductCard from './ProductCard';
import CartModal from './CartModal';
import CheckoutModal, { UserDetails } from './CheckoutModal';
import Image from 'next/image';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  category: string;
}

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  products?: Product[];
}

export default function ChatInterfaceGemini() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', parts: [{ text: text }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const response = await fetch('https://acp-bice.vercel.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, parts: m.parts })),
        }),
      });

      const data = await response.json();

      if (data.text) {
        const modelMessage: Message = {
            role: 'model',
            parts: [{ text: data.text }],
            products: data.products
        };
        setMessages(prev => [...prev, modelMessage]);

        if (data.paymentUrl) {
            setTimeout(() => {
                window.location.href = data.paymentUrl;
            }, 2000);
        }
      } else if (data.error) {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Error: ${data.error}` }] }]);
      }

    } catch (error) {
       setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, network error." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleBuy = (product: Product) => {
      setSelectedProduct(product);
      setIsCheckoutOpen(true);
  };

  const handleAddToCart = async (product: Product) => {
      try {
          const response = await fetch('https://acp-bice.vercel.app/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: product.id, quantity: 1, action: 'add' })
          });
          const data = await response.json();
          if (data.success !== false) {
              setMessages(prev => [...prev, {
                  role: 'model',
                  parts: [{ text: `**${product.title}** has been added to your cart!` }]
              }]);
          }
      } catch (error) {
          console.error('Add to cart error:', error);
      }
  };

  const handleCartCheckout = (total: number) => {
      setIsCartOpen(false);
      setSelectedProduct({
          id: 'cart',
          title: 'Cart Checkout',
          price: total,
          image_url: '',
          category: 'Cart'
      });
      setIsCheckoutOpen(true);
  };

  const handleCheckout = async (details: UserDetails) => {
      if (!selectedProduct) return;
      setIsProcessingPayment(true);

      try {
        const response = await fetch('https://acp-bice.vercel.app/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: selectedProduct.id,
                amount: selectedProduct.price,
                ...details,
                successUrl: 'https://ucp-omega.vercel.app/',
                failureUrl: 'https://ucp-omega.vercel.app/'
            })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            alert('Payment initiation failed: ' + (data.error || 'Unknown error'));
            setIsProcessingPayment(false);
        }
      } catch (error) {
          console.error('Checkout error:', error);
          alert('Failed to process checkout');
          setIsProcessingPayment(false);
      }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 280)}px`;
    setInput(e.target.value);
  };

  return (
    <div className="flex h-screen bg-[#0e0e0e] text-white font-sans overflow-hidden">
      {/* Sidebar - Minimal */}
      <aside className="w-[70px] bg-[#1a1a1a] flex flex-col items-center py-5 gap-7 z-20 border-r border-white/5">
         <button className="p-2.5 text-gray-400 hover:text-white rounded-lg transition-colors hover:bg-white/5">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
         </button>

         <button
            onClick={() => { setMessages([]); setInput(''); }}
            className="p-2.5 text-gray-400 hover:text-white rounded-lg transition-colors hover:bg-white/5"
            title="New Chat"
         >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
         </button>

         <div className="flex-1" />

         {/* Cart */}
         <button
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 text-gray-400 hover:text-white rounded-lg transition-colors hover:bg-white/5"
            title="Cart"
         >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
         </button>

         <button className="p-2.5 text-gray-400 hover:text-white rounded-lg transition-colors hover:bg-white/5 mb-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84a.484.484 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.23.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.27.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
         </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full bg-[#0e0e0e]">
         {/* Navbar */}
         <header className="flex items-center justify-between px-8 py-5 shrink-0 z-10">
            <div className="flex items-center gap-2 text-gray-200">
               <span className="text-xl font-medium tracking-tight">Gemini</span>
               <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <div className="flex items-center gap-5">
                 <div className="flex items-center gap-4">
                     {/* Cart Icon */}
                     <button
                        onClick={() => setIsCartOpen(true)}
                        className="p-2.5 text-gray-400 hover:text-white rounded-lg transition-colors hover:bg-white/5"
                        title="Cart"
                     >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                     </button>
                     {/* Profile Icon */}
                     <button className="flex items-center justify-center">
                         <div className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center text-base font-medium  hover:opacity-90 transition-opacity">
                            HK
                         </div>
                     </button>
                 </div>
            </div>
         </header>

         {/* Chat Area */}
         <div className="flex-1 overflow-y-auto w-full h-full relative">
            {messages.length === 0 ? (
                /* Welcome State - Centered */
                <div className="flex flex-col items-start justify-center h-full w-full max-w-[900px] mx-auto px-6 animate-in fade-in duration-700 pb-20">
                    <div className="mb-12 pl-1">
                         <div className="inline-flex items-center gap-4 mb-3">
                           <Image src="/gemini-color.svg" alt="Gemini" width={32} height={32} />
                            <span className="text-3xl text-[#e3e3e3] font-normal">Hi there</span>
                         </div>
                        <h1 className="text-[52px]  tracking-tight leading-tight">
                            Where should we start?
                        </h1>
                    </div>

                    {/* Input Box */}
                    <div className="w-full max-w-3xl relative z-10 mb-10">
                        <div className="relative bg-[#1e1f20] rounded-[28px] hover:bg-[#282a2c] focus-within:bg-[#282a2c] transition-colors border border-transparent focus-within:border-gray-600/30 shadow-lg shadow-black/20">
                            <div className="flex flex-col">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={handleInputResize}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask Gemini"
                                    className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-lg px-6 pt-5 pb-2 focus:outline-none resize-none max-h-[280px] scrollbar-hide"
                                    rows={1}
                                    style={{ minHeight: '52px' }}
                                />
                                {/* Bottom Toolbar */}
                                <div className="flex justify-between items-center px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                         <button className="p-2 text-gray-400 hover:text-white hover:bg-[#37393b] rounded-full transition-colors bg-[#2f3133]">
                                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                         </button>
                                         <button className="flex items-center gap-1.5 px-3.5 py-1.5 text-gray-400 hover:text-white hover:bg-[#37393b] rounded-full transition-colors text-[13px] font-medium">
                                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            Tools
                                         </button>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button className="flex items-center gap-1 px-3.5 py-1.5 text-gray-400 hover:text-white hover:bg-[#37393b] rounded-full transition-colors text-[13px]">
                                            Pro
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-white hover:bg-[#37393b] rounded-full transition-colors">
                                            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 3.01-2.45 5.5-5.5 5.5S6 14.01 6 11H4c0 3.53 2.61 6.43 6 6.92V21h4v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                                        </button>
                                         {input && (
                                            <button
                                                onClick={() => sendMessage(input)}
                                                className="p-2 bg-white text-black hover:bg-gray-200 rounded-full transition-colors ml-0.5"
                                            >
                                                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suggestion Capsules */}
                    <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl">
                        {[
                            { text: 'Create image', action: 'Generate an image', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                            { text: 'Explore cricket', action: 'Tell me about cricket', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
                            { text: 'Help me learn', action: 'Teach me something new', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
                            { text: 'Write anything', action: 'Help me write a story', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
                            { text: 'Boost my day', action: 'Give me a motivation quote', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
                            { text: 'Create a video', action: 'Help me plan a video', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
                        ].map((card, i) => (
                           <button
                             key={i}
                             onClick={() => sendMessage(card.action)}
                             className="flex items-center gap-2.5 px-5 py-3 bg-[#1e1f20] hover:bg-[#2f3133] rounded-full transition-all border border-white/8 hover:border-white/15 text-left group"
                           >
                              <span className="text-gray-400 group-hover:text-white transition-colors">
                                  {card.icon}
                              </span>
                              <span className="text-[15px] text-gray-300 group-hover:text-white transition-colors">{card.text}</span>
                           </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* Messages */
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-48 scroll-smooth">
                        <div className="max-w-[900px] mx-auto space-y-8">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                                            <img src="/gemini-color.svg" alt="Gemini" className="w-7 h-7" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                                        {msg.role === 'user' ? (
                                            <div className="bg-[#2f3133] text-white px-7 py-4 rounded-3xl text-lg">
                                                <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {(() => {
                                                    const rawText = msg.parts[0].text;
                                                    const text = rawText.replace(/\n/g, '\n\n').replace(/\n{3,}/g, '\n\n');
                                                    const hasProducts = msg.products && msg.products.length > 0;

                                                    if (hasProducts) {
                                                        const firstBreak = text.indexOf('\n');
                                                        const introText = firstBreak > 0 ? text.slice(0, firstBreak).trim() : text;
                                                        const restText = firstBreak > 0 ? text.slice(firstBreak).trim() : '';
                                                        return (
                                                            <>
                                                                <div className="text-xl text-gray-200 leading-relaxed">
                                                                    <ReactMarkdown>{introText}</ReactMarkdown>
                                                                </div>
                                                                <div className="flex gap-6 overflow-x-auto py-6 -mx-2 px-2 snap-x scrollbar-hide">
                                                                    {msg.products!.map(p => (
                                                                        <div key={p.id} className="snap-center shrink-0 w-[300px]">
                                                                            <ProductCard product={p} onBuy={handleBuy} onAddToCart={handleAddToCart} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {restText && (
                                                                    <div className="response-text text-lg leading-relaxed text-gray-300 space-y-4 [&_strong]:text-white [&_strong]:font-medium [&_p]:my-2">
                                                                        <ReactMarkdown>{restText}</ReactMarkdown>
                                                                    </div>
                                                                )}
                                                                {/* Suggestion chips */}
                                                                <div className="flex flex-wrap gap-3 pt-4">
                                                                    {(() => {
                                                                        const cats = [...new Set(msg.products!.map(p => p.category))];
                                                                        const chips: { label: string; query: string }[] = [];
                                                                        if (cats.includes('running')) chips.push({ label: 'Running shoes', query: 'show me running shoes' });
                                                                        if (cats.includes('formal')) chips.push({ label: 'Formal shoes', query: 'show me formal shoes' });
                                                                        if (cats.includes('casual')) chips.push({ label: 'Casual shoes', query: 'show me casual shoes' });
                                                                        chips.push({ label: 'Add to cart', query: 'add the first one to cart' });
                                                                        chips.push({ label: 'More options', query: 'show me more options' });
                                                                        return chips.map(chip => (
                                                                            <button
                                                                                key={chip.label}
                                                                                onClick={() => sendMessage(chip.query)}
                                                                                className="px-6 py-3 text-base text-gray-300 bg-[#1e1f20] hover:bg-[#2f3133] border border-white/10 rounded-full transition-colors hover:text-white"
                                                                            >
                                                                                {chip.label}
                                                                            </button>
                                                                        ));
                                                                    })()}
                                                                </div>
                                                            </>
                                                        );
                                                    }
                                                    return (
                                                        <div className="response-text text-lg leading-relaxed text-gray-300 space-y-4 [&_strong]:text-white [&_strong]:font-medium [&_p]:my-2">
                                                            <ReactMarkdown>{text}</ReactMarkdown>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                   
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-5">
                                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-1 animate-pulse">
                                        <img src="/gemini-color.svg" alt="Gemini" className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1 max-w-xl pt-2 space-y-4">
                                        <div className="space-y-2.5">
                                            <div className="h-3 bg-gradient-to-r from-gray-700/60 via-gray-600/40 to-gray-700/60 rounded-full w-full animate-pulse"></div>
                                            <div className="h-3 bg-gradient-to-r from-gray-700/60 via-gray-600/40 to-gray-700/60 rounded-full w-[85%] animate-pulse [animation-delay:150ms]"></div>
                                            <div className="h-3 bg-gradient-to-r from-gray-700/60 via-gray-600/40 to-gray-700/60 rounded-full w-[60%] animate-pulse [animation-delay:300ms]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} className="h-4" />
                        </div>
                    </div>

                    {/* Bottom Input Area */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/95 to-transparent px-6 pt-8 pb-5 z-20">
                         <div className="max-w-3xl mx-auto">
                            <div className="relative bg-[#1e1f20] rounded-[28px] hover:bg-[#282a2c] focus-within:bg-[#282a2c] transition-colors border border-transparent focus-within:border-gray-600/30 shadow-lg shadow-black/20">
                                <div className="flex flex-col">
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={handleInputResize}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask Gemini"
                                        className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-sm px-6 pt-4 pb-1.5 focus:outline-none resize-none max-h-[280px] scrollbar-hide"
                                        rows={1}
                                        style={{ minHeight: '44px' }}
                                    />
                                    {/* Toolbar */}
                                    <div className="flex justify-between items-center px-3.5 py-2.5">
                                         <div className="flex items-center gap-1.5">
                                            <button className="p-2 text-gray-400 hover:text-white hover:bg-[#37393b] rounded-full transition-colors bg-[#2f3133]">
                                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                         </div>
                                         <div className="flex items-center gap-1.5">
                                             <button className="p-2 text-gray-400 hover:text-white hover:bg-[#37393b] rounded-full transition-colors">
                                                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 3.01-2.45 5.5-5.5 5.5S6 14.01 6 11H4c0 3.53 2.61 6.43 6 6.92V21h4v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                                             </button>
                                             {input ? (
                                                 <button
                                                    onClick={() => sendMessage(input)}
                                                    className="p-2 bg-white text-black hover:bg-gray-200 rounded-full transition-colors ml-0.5"
                                                >
                                                    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                                </button>
                                             ) : null}
                                         </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[11px] text-center text-gray-600 mt-2.5">
                                Gemini may display inaccurate info, so double-check its responses.
                            </p>
                         </div>
                    </div>
                </div>
            )}
         </div>
      </main>

      {/* Modals */}
      {isCheckoutOpen && selectedProduct && (
        <CheckoutModal
            product={selectedProduct}
            onClose={() => setIsCheckoutOpen(false)}
            onCheckout={handleCheckout}
            isLoading={isProcessingPayment}
        />
      )}

      {isCartOpen && (
          <CartModal
            onClose={() => setIsCartOpen(false)}
            onCheckout={handleCartCheckout}
          />
      )}
    </div>
  );
}
