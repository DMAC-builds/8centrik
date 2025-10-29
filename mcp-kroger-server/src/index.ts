import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import { KrogerAPI } from './kroger-api';
import { KrogerDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function for error response
function handleError(res: any, message: string, error?: any) {
  console.error(message, error);
  res.status(500).json({ error: message });
}

// Kroger API integration endpoints
type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

let krogerAccessToken: string | null = null;

// Simple in-memory storage for user tokens (use database in production)
const userTokens: { [userId: string]: { accessToken: string; refreshToken?: string; expiresAt: number } } = {
  // Demo user for testing (in production, this would come from OAuth flow)
  "demo-user-123": {
    accessToken: "demo-access-token",
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
  }
};

// Function to get Kroger Access Token
async function getKrogerAccessToken() {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.KROGER_CLIENT_ID!);
    params.append('client_secret', process.env.KROGER_CLIENT_SECRET!);

    const response = await axios.post<TokenResponse>('https://api.kroger.com/v1/connect/oauth2/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    krogerAccessToken = response.data.access_token;
    console.log('Successfully fetched Kroger Access Token');
  } catch (error) {
    console.error('Failed to fetch Kroger Access Token', error);
  }
}

// Call this when starting server
getKrogerAccessToken();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    hasToken: !!krogerAccessToken,
    timestamp: new Date().toISOString()
  });
});

// Mock grocery data for health app integration
const mockGroceryData = {
  "wild-caught salmon": {
    productId: "0001111041000",
    description: "Wild Caught Atlantic Salmon Fillet, 1 lb",
    price: "$12.99",
    available: true
  },
  "grass-fed beef": {
    productId: "0001111042000",
    description: "Grass Fed Ground Beef, 1 lb",
    price: "$8.99",
    available: true
  },
  "free-range chicken": {
    productId: "0001111043000",
    description: "Free Range Chicken Breast, 2 lb",
    price: "$10.99",
    available: true
  },
  "organic spinach": {
    productId: "0001111044000",
    description: "Organic Baby Spinach, 5 oz",
    price: "$3.99",
    available: true
  },
  "mixed berries": {
    productId: "0001111045000",
    description: "Organic Mixed Berries, 12 oz",
    price: "$5.99",
    available: true
  },
  "avocados": {
    productId: "0001111046000",
    description: "Hass Avocados, 6 count",
    price: "$4.99",
    available: true
  }
};

// Search for products (with Kroger API integration ready)
app.get('/api/products/search', async (req, res) => {
  const term = (req.query.term as string || 'milk').toLowerCase();
  
  try {
    // For now, return mock data that matches the search term
    const results = Object.entries(mockGroceryData)
      .filter(([key]) => key.includes(term) || term.includes(key.split('-')[0]))
      .map(([key, value]) => ({ ...value, searchTerm: key }));
    
    if (results.length === 0) {
      // Try a partial match
      const partialResults = Object.entries(mockGroceryData)
        .slice(0, 3)
        .map(([key, value]) => ({ ...value, searchTerm: key }));
      res.json(partialResults);
    } else {
      res.json(results);
    }
  } catch (error) {
    console.error('Failed to search products', error);
    res.status(500).json({ error: 'Error searching products' });
  }
});

// AI Meal Plan Generation
app.post('/api/meal-plan/ai-generate', (req, res) => {
  const { preferences } = req.body;
  
  // Mock AI-generated meal plan based on preferences
  const mealPlan = {
    Monday: {
      breakfast: "Berry Smoothie Bowl",
      lunch: "Salmon Salad",
      snack: "Apple with Almond Butter",
      dinner: "Grass-fed Beef with Roasted Vegetables",
    },
    Tuesday: {
      breakfast: "Scrambled Eggs with Spinach",
      lunch: "Chicken Avocado Bowl",
      snack: "Mixed Berries",
      dinner: "Baked Cod with Asparagus",
    },
    Wednesday: {
      breakfast: "Coconut Yogurt with Berries",
      lunch: "Turkey Lettuce Wraps",
      snack: "Cucumber with Hummus",
      dinner: "Grilled Chicken with Broccoli",
    },
    Thursday: {
      breakfast: "Avocado Toast (Grain-free)",
      lunch: "Sardine Salad",
      snack: "Handful of Nuts",
      dinner: "Lamb Chops with Cauliflower Mash",
    },
    Friday: {
      breakfast: "Green Smoothie",
      lunch: "Tuna Poke Bowl",
      snack: "Celery with Almond Butter",
      dinner: "Salmon with Sweet Potato",
    },
  };
  
  res.json({
    success: true,
    mealPlan,
    preferences,
    message: "AI meal plan generated successfully!"
  });
});

// Convert meal plan to grocery list
app.post('/api/meal-plan/grocery-list', (req, res) => {
  const mealPlan = req.body.mealPlan;
  
  // Convert meal plan items to grocery items
  const groceryList = [
    mockGroceryData["wild-caught salmon"],
    mockGroceryData["grass-fed beef"],
    mockGroceryData["free-range chicken"],
    mockGroceryData["organic spinach"],
    mockGroceryData["mixed berries"],
    mockGroceryData["avocados"]
  ];
  
  res.json({
    success: true,
    groceryList,
    estimatedTotal: "$47.94"
  });
});

// Kroger OAuth endpoints
app.get('/auth/kroger', (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Generate OAuth URL for Kroger
  const authUrl = `https://api.kroger.com/v1/connect/oauth2/authorize?` +
    `client_id=${process.env.KROGER_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.KROGER_REDIRECT_URI)}&` +
    `response_type=code&scope=openid profile.compact cart.basic:write&` +
    `state=${userId}`;
  
  res.json({
    success: true,
    authUrl,
    message: "Redirect to Kroger for authentication"
  });
});

app.get('/auth/callback', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.status(400).json({ error: 'Authorization code and state (user ID) are required' });
  }

  try {
    // Exchange code for access token
    const tokenData = await KrogerAPI.exchangeCodeForToken(code as string);
    await KrogerDatabase.saveUserToken(userId as string, tokenData);

    res.redirect(`http://localhost:3000/profile?kroger=connected`);
  } catch (error) {
    handleError(res, 'OAuth process failed', error);
  }
});

// Get user's Kroger stores
app.get('/api/stores', async (req, res) => {
  const { userId, lat, lon } = req.query;
  
  if (!userId || !userTokens[userId as string]) {
    return res.status(401).json({ error: 'User not authenticated with Kroger' });
  }
  
  try {
    // Mock store data (in real implementation, fetch from Kroger API)
    const mockStores = [
      {
        locationId: "70100443",
        name: "Kroger Pharmacy",
        address: "123 Main St, Austin, TX 78701",
        distance: 2.1,
        hours: "6:00 AM - 12:00 AM"
      },
      {
        locationId: "70100444",
        name: "Kroger Marketplace",
        address: "456 Oak Ave, Austin, TX 78702",
        distance: 3.5,
        hours: "6:00 AM - 11:00 PM"
      }
    ];
    
    res.json({
      success: true,
      stores: mockStores
    });
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Place grocery order
app.post('/api/orders', async (req, res) => {
  const { userId, items, storeId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const session = await KrogerDatabase.createCartSession(userId, items);

    // Iterate over items and add to cart
    const addedItems: any[] = [];
    const failedItems: any[] = [];

    for (const item of items) {
      const product = await KrogerAPI.findBestMatch(item, storeId);

      if (product) {
        try {
          await KrogerAPI.addToCart(userId, storeId, product.upc);
          addedItems.push({ ...product, name: item });
        } catch (addItemError) {
          failedItems.push({ item, error: addItemError.message });
        }
      } else {
        failedItems.push({ item, error: 'No matching product found' });
      }

      // Update cart session progress (simplistic)
      const progress = Math.floor((addedItems.length / items.length) * 100);
      await KrogerDatabase.updateCartSession(session.id, { progress, items_added: addedItems, items_failed: failedItems });
    }

    const cart = await KrogerAPI.getCart(userId);
    const cartUrl = `https://www.kroger.com/cart`;

    // Final update to session
    await KrogerDatabase.updateCartSession(session.id, {
      status: 'completed',
      kroger_cart_id: cart.cartId,
      kroger_cart_url: cartUrl
    });

    res.json({
      success: true,
      message: 'Groceries added to Kroger cart successfully!',
      cartUrl
    });
  } catch (error) {
    handleError(res, 'Failed to place order', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Kroger MCP server running on port ${PORT}`);
});

