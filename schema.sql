-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lemonsqueezy_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  lemonsqueezy_customer_id VARCHAR(255) NOT NULL,
  variant_id VARCHAR(255) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, cancelled, expired, past_due
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create webhook_events table for logging
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lemonsqueezy_id VARCHAR(255) UNIQUE NOT NULL,
  event_name VARCHAR(100) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create flashcard_sets table
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for flashcard_sets
CREATE POLICY "Users can view their own flashcard sets" ON flashcard_sets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard sets" ON flashcard_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard sets" ON flashcard_sets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard sets" ON flashcard_sets
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for flashcards
CREATE POLICY "Users can view flashcards from their sets" ON flashcards
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM flashcard_sets
    WHERE flashcard_sets.id = flashcards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert flashcards to their sets" ON flashcards
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM flashcard_sets
    WHERE flashcard_sets.id = flashcards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update flashcards in their sets" ON flashcards
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM flashcard_sets
    WHERE flashcard_sets.id = flashcards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete flashcards from their sets" ON flashcards
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM flashcard_sets
    WHERE flashcard_sets.id = flashcards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_flashcard_sets_updated_at
  BEFORE UPDATE ON flashcard_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 