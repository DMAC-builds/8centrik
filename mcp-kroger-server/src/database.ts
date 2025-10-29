import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase client with service role key for server operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface UserKrogerToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  scope?: string;
  token_type: string;
  created_at: string;
  updated_at: string;
}

export interface GroceryCartSession {
  id: string;
  user_id: string;
  meal_plan_id?: string;
  grocery_items: any[];
  kroger_cart_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  items_added: any[];
  items_failed: any[];
  error_message?: string;
  kroger_cart_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserKrogerStore {
  id: string;
  user_id: string;
  store_id: string;
  store_name: string;
  store_address: string;
  created_at: string;
  updated_at: string;
}

export interface KrogerProductCache {
  id: string;
  search_term: string;
  kroger_store_id: string;
  product_data: any;
  expires_at: string;
  created_at: string;
}

// Database helper functions
export class KrogerDatabase {
  
  // Token management
  static async saveUserToken(userId: string, tokenData: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
    token_type?: string;
  }) {
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
    
    const { data, error } = await supabase
      .from('user_kroger_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        scope: tokenData.scope,
        token_type: tokenData.token_type || 'Bearer'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserToken(userId: string): Promise<UserKrogerToken | null> {
    const { data, error } = await supabase
      .from('user_kroger_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  }

  static async deleteUserToken(userId: string) {
    const { error } = await supabase
      .from('user_kroger_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Cart session management
  static async createCartSession(userId: string, groceryItems: any[], mealPlanId?: string) {
    const { data, error } = await supabase
      .from('grocery_cart_sessions')
      .insert({
        user_id: userId,
        meal_plan_id: mealPlanId,
        grocery_items: groceryItems,
        status: 'pending',
        progress: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCartSession(sessionId: string, updates: Partial<GroceryCartSession>) {
    const { data, error } = await supabase
      .from('grocery_cart_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getCartSession(sessionId: string): Promise<GroceryCartSession | null> {
    const { data, error } = await supabase
      .from('grocery_cart_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getUserCartSessions(userId: string): Promise<GroceryCartSession[]> {
    const { data, error } = await supabase
      .from('grocery_cart_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Store management
  static async saveUserStore(userId: string, storeData: {
    store_id: string;
    store_name: string;
    store_address: string;
  }) {
    const { data, error } = await supabase
      .from('user_kroger_stores')
      .upsert({
        user_id: userId,
        store_id: storeData.store_id,
        store_name: storeData.store_name,
        store_address: storeData.store_address
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserStore(userId: string): Promise<UserKrogerStore | null> {
    const { data, error } = await supabase
      .from('user_kroger_stores')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Product cache management
  static async getCachedProduct(searchTerm: string, storeId: string) {
    const { data, error } = await supabase
      .from('kroger_product_cache')
      .select('*')
      .eq('search_term', searchTerm.toLowerCase())
      .eq('kroger_store_id', storeId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async cacheProduct(searchTerm: string, storeId: string, productData: any, expiresInHours = 24) {
    const expiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000)).toISOString();
    
    const { data, error } = await supabase
      .from('kroger_product_cache')
      .upsert({
        search_term: searchTerm.toLowerCase(),
        kroger_store_id: storeId,
        product_data: productData,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
