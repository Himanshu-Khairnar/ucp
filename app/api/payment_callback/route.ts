import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const status = formData.get('status') as string;
    const txnid = formData.get('txnid') as string;
    const easebuzzId = formData.get('easepayid') as string; // validation needed usually

    // Get order details including return URL
    const db = await getDb();
    const order = await db.get(
      'SELECT return_url FROM orders WHERE transaction_id = ?',
      txnid
    );

    // Update order status
    const newStatus = status === 'success' ? 'PAID' : 'FAILED';
    await db.run(
      'UPDATE orders SET status = ? WHERE transaction_id = ?',
      newStatus, txnid
    );

    // Use the return URL from database, or fallback to environment variable
    let redirectBase = order?.return_url || process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || 'http://localhost:3000';

    // Remove trailing slash if present
    redirectBase = redirectBase.replace(/\/$/, '');

    // Redirect to appropriate success/failure page
    const redirectPath = status === 'success' ? '/payment/success' : '/payment/failure';
    return NextResponse.redirect(`${redirectBase}${redirectPath}?txnid=${txnid}`, 303);

  } catch (error) {
    console.error('Callback Error:', error);
    return NextResponse.json({ error: 'Callback failed' }, { status: 500, headers: corsHeaders });
  }
}
