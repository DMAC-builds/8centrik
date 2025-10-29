import axios from 'axios';
import { KrogerDatabase } from './database';

const KROGER_BASE_URL = 'https://api.kroger.com/v1';

export class KrogerAPI {
  
  // Get application access token (for general API access)
  static async getAppAccessToken(): Promise<string> {
    try {
      const response = await axios.post(`${KROGER_BASE_URL}/connect/oauth2/token`, 
        new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'product.compact'
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`).toString('base64')}`
          }
        }
      );
      
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Kroger app access token:', error);
      throw new Error('Failed to authenticate with Kroger API');
    }
  }

  // Exchange OAuth code for user access token
  static async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const response = await axios.post(`${KROGER_BASE_URL}/connect/oauth2/token`, 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.KROGER_REDIRECT_URI!
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`).toString('base64')}`
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to exchange code for token:', error.response?.data || error.message);
      throw new Error('Failed to complete OAuth flow');
    }
  }

  // Refresh user access token
  static async refreshUserToken(refreshToken: string): Promise<any> {
    try {
      const response = await axios.post(`${KROGER_BASE_URL}/connect/oauth2/token`, 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`).toString('base64')}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  // Get valid user token (refresh if needed)
  static async getUserToken(userId: string): Promise<string> {
    const tokenData = await KrogerDatabase.getUserToken(userId);
    
    if (!tokenData) {
      throw new Error('User not authenticated with Kroger');
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    if (expiresAt.getTime() - now.getTime() < bufferTime) {
      // Token is expired or about to expire, refresh it
      if (tokenData.refresh_token) {
        try {
          const newTokenData = await this.refreshUserToken(tokenData.refresh_token);
          await KrogerDatabase.saveUserToken(userId, newTokenData);
          return newTokenData.access_token;
        } catch (error) {
          // Refresh failed, user needs to re-authenticate
          await KrogerDatabase.deleteUserToken(userId);
          throw new Error('Token expired. Please re-authenticate with Kroger.');
        }
      } else {
        // No refresh token available
        await KrogerDatabase.deleteUserToken(userId);
        throw new Error('Token expired. Please re-authenticate with Kroger.');
      }
    }

    return tokenData.access_token;
  }

  // Get stores near location
  static async getStores(lat: number, lon: number, radiusMiles = 10): Promise<any[]> {
    try {
      const appToken = await this.getAppAccessToken();
      
      const response = await axios.get(`${KROGER_BASE_URL}/locations`, {
        params: {
          'filter.lat': lat,
          'filter.lon': lon,
          'filter.radiusInMiles': radiusMiles,
          'filter.department': 'grocery'
        },
        headers: {
          'Authorization': `Bearer ${appToken}`,
          'Accept': 'application/json'
        }
      });
      
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to get stores:', error.response?.data || error.message);
      return []; // Return empty array instead of throwing
    }
  }

  // Search for products
  static async searchProducts(query: string, storeId: string, userToken?: string): Promise<any[]> {
    try {
      // Try to get from cache first
      const cached = await KrogerDatabase.getCachedProduct(query, storeId);
      if (cached) {
        return cached.product_data;
      }

      // Use app token for product search (doesn't require user auth for basic search)
      const appToken = await this.getAppAccessToken();
      
      const response = await axios.get(`${KROGER_BASE_URL}/products`, {
        params: {
          'filter.term': query,
          'filter.locationId': storeId,
          'filter.limit': 10
        },
        headers: {
          'Authorization': `Bearer ${appToken}`,
          'Accept': 'application/json'
        }
      });
      
      const products = response.data.data || [];
      
      // Cache the results
      await KrogerDatabase.cacheProduct(query, storeId, products);
      
      return products;
    } catch (error: any) {
      console.error('Failed to search products:', error.response?.data || error.message);
      return []; // Return empty array instead of throwing
    }
  }

  // Add item to cart
  static async addToCart(userId: string, storeId: string, productId: string, quantity = 1): Promise<any> {
    try {
      const userToken = await this.getUserToken(userId);
      
      const response = await axios.put(`${KROGER_BASE_URL}/cart/add`, {
        items: [{
          upc: productId,
          quantity: quantity
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to add to cart:', error.response?.data || error.message);
      throw new Error(`Failed to add item to cart: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get cart contents
  static async getCart(userId: string): Promise<any> {
    try {
      const userToken = await this.getUserToken(userId);
      
      const response = await axios.get(`${KROGER_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to get cart:', error.response?.data || error.message);
      throw new Error(`Failed to get cart: ${error.response?.data?.message || error.message}`);
    }
  }

  // Smart product matching for grocery items
  static async findBestMatch(groceryItem: string, storeId: string): Promise<any | null> {
    try {
      // Clean up the grocery item name for better matching
      const cleanItem = groceryItem
        .toLowerCase()
        .replace(/\([^)]*\)/g, '') // Remove parentheses content
        .replace(/\d+\s*(lb|lbs|oz|ounce|ounces|pieces?|count|jar|bag|head|bunch|dozen)/gi, '') // Remove quantities
        .replace(/organic|grass-fed|free-range|wild-caught/gi, '') // Remove descriptors for broader search
        .trim();

      // Try exact search first
      let products = await this.searchProducts(cleanItem, storeId);
      
      if (products.length === 0) {
        // Try with individual words
        const words = cleanItem.split(/[\s-]+/).filter(word => word.length > 2);
        for (const word of words) {
          products = await this.searchProducts(word, storeId);
          if (products.length > 0) break;
        }
      }

      if (products.length === 0) {
        return null;
      }

      // Score products based on relevance
      const scoredProducts = products.map(product => {
        const name = product.description?.toLowerCase() || '';
        let score = 0;
        
        // Exact match gets highest score
        if (name.includes(cleanItem)) score += 100;
        
        // Word matches
        const words = cleanItem.split(/[\s-]+/);
        words.forEach(word => {
          if (name.includes(word)) score += 10;
        });
        
        // Prefer organic/quality items if original had those descriptors
        if (groceryItem.toLowerCase().includes('organic') && name.includes('organic')) score += 20;
        if (groceryItem.toLowerCase().includes('grass-fed') && name.includes('grass')) score += 20;
        if (groceryItem.toLowerCase().includes('free-range') && name.includes('free')) score += 20;
        
        return { ...product, matchScore: score };
      });

      // Return the best match
      scoredProducts.sort((a, b) => b.matchScore - a.matchScore);
      return scoredProducts[0];
      
    } catch (error) {
      console.error('Failed to find best match for:', groceryItem, error);
      return null;
    }
  }
}
