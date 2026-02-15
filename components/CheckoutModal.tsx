
import React, { useState } from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
}

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
  onCheckout: (details: UserDetails) => void;
  isLoading: boolean;
}

export interface UserDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CheckoutModal({ product, onClose, onCheckout, isLoading }: CheckoutModalProps) {
  const [details, setDetails] = useState<UserDetails>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckout(details);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#2a2a2a] rounded-2xl shadow-2xl w-full max-w-md border border-white/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white">Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors group"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Summary */}
        <div className="px-5 pt-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Purchasing</p>
              <h3 className="font-semibold text-white text-sm truncate max-w-[240px]">{product.title}</h3>
            </div>
            <p className="text-white font-bold text-lg whitespace-nowrap">₹{product.price.toLocaleString()}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-2 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={details.name}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all placeholder-gray-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={details.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all placeholder-gray-500"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone Number</label>
            <input
              type="tel"
              name="phone"
              required
              value={details.phone}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all placeholder-gray-500"
              placeholder="9876543210"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Shipping Address</label>
            <textarea
              name="address"
              required
              value={details.address}
              onChange={handleChange}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all placeholder-gray-500"
              placeholder="123 Main St, City, State, PIN"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 border border-white/10 text-gray-300 font-medium py-3 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex justify-center items-center text-sm"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        </form>

        {/* Secure Footer */}
        <div className="px-5 pb-4 pt-1">
          <div className="flex items-center justify-center gap-1.5 text-gray-500">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px]">Secured by Easebuzz Payment Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
