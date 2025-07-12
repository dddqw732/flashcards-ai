import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@/lib/lemonsqueezy';

export async function POST(request: NextRequest) {
  const { variantId, email, returnUrl } = await request.json();
  try {
    const checkout = await createCheckout({ variantId, email, returnUrl });
    return NextResponse.json({ url: checkout.data.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 