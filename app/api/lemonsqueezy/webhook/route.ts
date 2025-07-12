import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

// Use service role key for webhook operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function verifySignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    if (!verifySignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventName = event.meta?.event_name;
    const eventId = event.meta?.custom_data?.event_id || event.data?.id;

    // Log the webhook event
    await supabase
      .from('webhook_events')
      .insert({
        lemonsqueezy_id: eventId,
        event_name: eventName,
        data: event,
        processed: false,
      });

    // Process different event types
    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(event);
        break;
      case 'subscription_updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event);
        break;
      case 'subscription_resumed':
        await handleSubscriptionResumed(event);
        break;
      case 'subscription_expired':
        await handleSubscriptionExpired(event);
        break;
      case 'subscription_paused':
        await handleSubscriptionPaused(event);
        break;
      case 'subscription_unpaused':
        await handleSubscriptionUnpaused(event);
        break;
      default:
        console.log(`Unhandled event type: ${eventName}`);
    }

    // Mark event as processed
    await supabase
      .from('webhook_events')
      .update({ processed: true })
      .eq('lemonsqueezy_id', eventId);

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleSubscriptionCreated(event: any) {
  const subscription = event.data;
  const customData = event.meta?.custom_data || {};
  
  // Extract user email from the subscription data
  const userEmail = subscription.attributes?.user_email;
  
  if (!userEmail) {
    console.error('No user email found in subscription data');
    return;
  }

  // Find the user by email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }

  const user = users.users.find(u => u.email === userEmail);
  
  if (!user) {
    console.error('User not found with email:', userEmail);
    return;
  }

  // Get plan name from variant ID
  const variantId = subscription.attributes?.variant_id?.toString();
  const planName = getPlanNameFromVariantId(variantId);

  // Create subscription record
  await supabase
    .from('user_subscriptions')
    .insert({
      user_id: user.id,
      lemonsqueezy_subscription_id: subscription.id,
      lemonsqueezy_customer_id: subscription.attributes?.customer_id?.toString(),
      variant_id: variantId,
      plan_name: planName,
      status: subscription.attributes?.status,
      current_period_start: subscription.attributes?.renews_at,
      current_period_end: subscription.attributes?.ends_at,
    });
}

async function handleSubscriptionUpdated(event: any) {
  const subscription = event.data;
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.attributes?.status,
      current_period_start: subscription.attributes?.renews_at,
      current_period_end: subscription.attributes?.ends_at,
    })
    .eq('lemonsqueezy_subscription_id', subscription.id);
}

async function handleSubscriptionCancelled(event: any) {
  const subscription = event.data;
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      current_period_end: subscription.attributes?.ends_at,
    })
    .eq('lemonsqueezy_subscription_id', subscription.id);
}

async function handleSubscriptionResumed(event: any) {
  const subscription = event.data;
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      current_period_start: subscription.attributes?.renews_at,
      current_period_end: subscription.attributes?.ends_at,
    })
    .eq('lemonsqueezy_subscription_id', subscription.id);
}

async function handleSubscriptionExpired(event: any) {
  const subscription = event.data;
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'expired',
    })
    .eq('lemonsqueezy_subscription_id', subscription.id);
}

async function handleSubscriptionPaused(event: any) {
  const subscription = event.data;
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'paused',
    })
    .eq('lemonsqueezy_subscription_id', subscription.id);
}

async function handleSubscriptionUnpaused(event: any) {
  const subscription = event.data;
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      current_period_start: subscription.attributes?.renews_at,
      current_period_end: subscription.attributes?.ends_at,
    })
    .eq('lemonsqueezy_subscription_id', subscription.id);
}

function getPlanNameFromVariantId(variantId: string): string {
  const planMap: { [key: string]: string } = {
    '568246': 'Small',
    '568257': 'Mid',
    '568260': 'Big',
  };
  
  return planMap[variantId] || 'Unknown';
} 