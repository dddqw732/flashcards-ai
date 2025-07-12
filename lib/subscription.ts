import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key for server-side operations
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export interface UserSubscription {
  id: string;
  user_id: string;
  lemonsqueezy_subscription_id: string;
  lemonsqueezy_customer_id: string;
  variant_id: string;
  plan_name: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'paused';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }

  return data;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription !== null && subscription.status === 'active';
}

export async function getUserPlan(userId: string): Promise<string | null> {
  const subscription = await getUserSubscription(userId);
  return subscription?.plan_name || null;
}

export async function getSubscriptionLimits(userId: string): Promise<{
  maxFlashcards: number;
  hasUnlimitedFlashcards: boolean;
}> {
  const plan = await getUserPlan(userId);
  
  switch (plan) {
    case 'Small':
      return { maxFlashcards: 100, hasUnlimitedFlashcards: false };
    case 'Mid':
      return { maxFlashcards: 500, hasUnlimitedFlashcards: false };
    case 'Big':
      return { maxFlashcards: -1, hasUnlimitedFlashcards: true };
    default:
      // Free tier
      return { maxFlashcards: 3, hasUnlimitedFlashcards: false };
  }
}

export async function canCreateFlashcard(userId: string): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }

  const limits = await getSubscriptionLimits(userId);
  
  if (limits.hasUnlimitedFlashcards) {
    return true;
  }

  // Count current flashcards for the user
  const { count, error } = await supabase
    .from('flashcards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error counting flashcards:', error);
    return false;
  }

  return (count || 0) < limits.maxFlashcards;
} 