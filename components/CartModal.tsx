
import React, { useEffect, useState } from 'react';

interface CartItem {
  id: number;
  product_id: string;
  quantity: number;
  title: string;
  price: number;
  image_url: string;
}

interface CartModalProps {
  onClose: () => void;
  onCheckout: (total: number) => void;
}

export default function CartModal({ onClose, onCheckout }: CartModalProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('https://acp-bice.vercel.app/api/cart');
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
      try {
          if (quantity < 1) {
              await removeFromCart(productId);
              return;
          }
          await fetch('https://acp-bice.vercel.app/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, quantity, action: 'update' })
          });
          fetchCart();
      } catch (error) {
          console.error('Failed to update quantity', error);
      }
  };

  const removeFromCart = async (id: number | string) => {
      try {
        await fetch(`https://acp-bice.vercel.app/api/cart?id=${id}`, {
            method: 'DELETE'
        });
        fetchCart();
      } catch (error) {
          console.error('Failed to remove item', error);
      }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      {/* Slide-in panel from right */}
      <div
        className="bg-[#171717] w-full max-w-[380px] h-full flex flex-col shadow-2xl border-l border-white/5 animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-[15px] font-semibold text-white">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-[14px] text-gray-400 font-medium">Your cart is empty</p>
              <p className="text-[12px] text-gray-500 mt-1">Ask me to add products to get started</p>
            </div>
          ) : (
            <div className="px-3 py-2">
              {items.map((item, i) => (
                <div key={item.id}>
                  <div className="flex gap-3 px-2 py-3 group">
                    {/* Image */}
                    <div className="w-14 h-14 bg-[#2a2a2a] rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={`https://acp-bice.vercel.app/api/image?url=${encodeURIComponent(item.image_url)}`}
                        alt={item.title}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] text-gray-200 font-medium line-clamp-2 leading-tight">{item.title}</h3>
                      <p className="text-[13px] text-white font-semibold mt-1">₹{item.price.toLocaleString()}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-0.5 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Quantity */}
                      <div className="flex items-center gap-0 bg-[#2a2a2a] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-7 h-7 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm transition-colors"
                        >−</button>
                        <span className="w-6 text-center text-[12px] text-white font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-7 h-7 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm transition-colors"
                        >+</button>
                      </div>
                    </div>
                  </div>
                  {i < items.length - 1 && <div className="mx-2 border-t border-white/5" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-gray-400">Total ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="text-[16px] font-bold text-white">₹{total.toLocaleString()}</span>
            </div>
            <button
              onClick={() => onCheckout(total)}
              className="w-full bg-white text-black text-[13px] font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
