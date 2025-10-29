-- Kroger Integration Database Schema
-- Run this in your Supabase SQL Editor

-- Table to store user Kroger OAuth tokens
CREATE TABLE IF NOT EXISTS user_kroger_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track grocery cart sessions
CREATE TABLE IF NOT EXISTS grocery_cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  meal_plan_id TEXT, -- Reference to meal plan that generated this cart
  grocery_items JSONB NOT NULL, -- Array of grocery items to add
  kroger_cart_id TEXT, -- Kroger's cart ID once created
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  progress INTEGER DEFAULT 0, -- 0-100 progress percentage
  items_added JSONB DEFAULT '[]'::jsonb, -- Successfully added items
  items_failed JSONB DEFAULT '[]'::jsonb, -- Failed to add items
  error_message TEXT,
  kroger_cart_url TEXT, -- Final cart URL from Kroger
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to cache Kroger product searches (for performance)
CREATE TABLE IF NOT EXISTS kroger_product_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_term TEXT NOT NULL,
  kroger_store_id TEXT NOT NULL,
  product_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(search_term, kroger_store_id)
);

-- Table to store user's preferred Kroger store
CREATE TABLE IF NOT EXISTS user_kroger_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_kroger_tokens_user_id ON user_kroger_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_cart_sessions_user_id ON grocery_cart_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_cart_sessions_status ON grocery_cart_sessions(status);
CREATE INDEX IF NOT EXISTS idx_kroger_product_cache_search ON kroger_product_cache(search_term, kroger_store_id);
CREATE INDEX IF NOT EXISTS idx_user_kroger_stores_user_id ON user_kroger_stores(user_id);

-- RLS (Row Level Security) policies
ALTER TABLE user_kroger_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_kroger_stores ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tokens
CREATE POLICY "Users can manage their own Kroger tokens" ON user_kroger_tokens
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only access their own cart sessions
CREATE POLICY "Users can manage their own cart sessions" ON grocery_cart_sessions
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only access their own store preferences
CREATE POLICY "Users can manage their own store preferences" ON user_kroger_stores
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_kroger_tokens_updated_at BEFORE UPDATE ON user_kroger_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grocery_cart_sessions_updated_at BEFORE UPDATE ON grocery_cart_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_kroger_stores_updated_at BEFORE UPDATE ON user_kroger_stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
