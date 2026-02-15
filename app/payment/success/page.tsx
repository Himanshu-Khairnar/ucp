'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const txnid = searchParams.get('txnid');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-400 mb-6">Your order has been placed successfully.</p>
        
        <div className="bg-gray-700 p-4 rounded-lg mb-6 text-left">
          <p className="text-sm text-gray-400">Transaction ID</p>
          <p className="font-mono text-sm break-all">{txnid}</p>
        </div>

        <a href="/" className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
          Return to Chat
        </a>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
