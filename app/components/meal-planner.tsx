"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ShoppingCart, RefreshCw, Clock, ChefHat } from "lucide-react"

interface Meal {
  name: string;
  ingredients: string[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  cookTime: string;
  difficulty: string;
}

interface GroceryItem {
  name: string;
  price: string;
  category: string;
  upc?: string;
  quantity?: number;
}

export function MealPlanner() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGroceryModal, setShowGroceryModal] = useState(false)
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([])
  const [orderProgress, setOrderProgress] = useState(0)
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [isLoadingGroceries, setIsLoadingGroceries] = useState(false)

  const generateMealPlan = async () => {
    setIsGenerating(true)
    try {
      // Request AI to generate meal plan with proper parameters
      const response = await fetch("http://localhost:3001/api/meal-plan/ai-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          preferences: { user: "active", goal: "healthy" },
          num_meals: 5,
          dietary_restrictions: "none"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Meal plan response:", data);
      
      // Convert mealPlan object to meals array
      const mealPlan = data.mealPlan || {};
      const mealsArray: Meal[] = [];
      
      Object.entries(mealPlan).forEach(([day, dayMeals]: [string, any]) => {
        Object.entries(dayMeals).forEach(([mealType, mealName]: [string, any]) => {
          mealsArray.push({
            name: `${day} - ${mealType}: ${mealName}`,
            ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
            nutrition: {
              calories: 450,
              protein: "25g",
              carbs: "35g",
              fat: "15g"
            },
            cookTime: "25 mins",
            difficulty: "Easy"
          });
        });
      });
      
      setMeals(mealsArray);
      setOrderData(null); // Reset order data when generating new plan
    } catch (error) {
      console.error("Error generating meal plan:", error);
      alert("Failed to generate meal plan. Please try again.");
    } finally {
      setIsGenerating(false)
    }
  }

  const generateGroceryList = async () => {
    setIsLoadingGroceries(true);
    try {
      const response = await fetch("http://localhost:3001/api/meal-plan/grocery-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          meals: meals,
          preferences: { focus: "fresh_ingredients" }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Grocery list response:", data);
      setGroceryItems(data.items || []);
    } catch (error) {
      console.error("Error generating grocery list:", error);
      alert("Failed to generate grocery list. Using default items.");
      
      // Fallback to default items
      const defaultItems = [
        { name: "Fresh Salmon Fillet", price: "$12.99", category: "Seafood", quantity: 1 },
        { name: "Chicken Breast", price: "$7.99", category: "Meat", quantity: 1 },
        { name: "Mixed Greens", price: "$3.99", category: "Produce", quantity: 1 },
        { name: "Greek Yogurt", price: "$5.49", category: "Dairy", quantity: 1 },
        { name: "Organic Bananas", price: "$2.99", category: "Fruits", quantity: 1 },
        { name: "Sweet Potatoes", price: "$4.49", category: "Produce", quantity: 1 }
      ];
      setGroceryItems(defaultItems);
    } finally {
      setIsLoadingGroceries(false);
    }
  };

  const handleOrderGroceries = async () => {
    // First generate grocery list if not already done
    if (groceryItems.length === 0) {
      await generateGroceryList();
    }
    setShowGroceryModal(true);
  };

  const orderGroceries = async () => {
    setIsOrdering(true)
    setOrderProgress(0)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setOrderProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 300)

    try {
      // Send order request to MCP server
      const response = await fetch("http://localhost:3001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: `user_${Date.now()}`,
          items: groceryItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            category: item.category
          })),
          storeId: "70100444" // Default store ID
        })
      });

      const data = await response.json();

      if (response.ok && data.sessionId) {
        setOrderProgress(100)
        setOrderData({
          success: true,
          sessionId: data.sessionId,
          message: data.message,
          cartUrl: data.kroger_cart_url,
          estimatedTotal: `$${data.estimatedTotal}`,
          estimatedDelivery: "2 hours",
          storeInfo: {
            name: "Kroger Marketplace",
            address: "456 Oak Ave, Austin, TX 78702"
          }
        })
        
        // Auto-open Kroger cart
        setTimeout(() => {
          if (data.kroger_cart_url) {
            window.open(data.kroger_cart_url, '_blank')
          }
        }, 1500)
      } else {
        console.error("Failed to place order", data);
        alert(data.error || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Order error:", error)
      alert("Network error. Please try again.")
    }

    clearInterval(progressInterval)
    setIsOrdering(false)
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center">Meal Planner</h1>

      {meals.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Let us plan your meals</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isGenerating ? (
              <div>
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Thinking through your energy needs...</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  We'll create a personalized meal plan based on your health goals and preferences.
                </p>
                <Button onClick={generateMealPlan} className="bg-green-600 hover:bg-green-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate My Meal Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Meal Plan Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meals.map((meal, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    {meal.name}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meal.cookTime}
                    </div>
                    <span className="text-blue-600 font-medium">{meal.difficulty}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Ingredients:</h4>
                    <div className="flex flex-wrap gap-1">
                      {meal.ingredients.slice(0, 3).map((ingredient, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {ingredient}
                        </span>
                      ))}
                      {meal.ingredients.length > 3 && (
                        <span className="text-gray-500 text-xs px-2 py-1">
                          +{meal.ingredients.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded">
                    <div><strong>Calories:</strong> {meal.nutrition.calories}</div>
                    <div><strong>Protein:</strong> {meal.nutrition.protein}</div>
                    <div><strong>Carbs:</strong> {meal.nutrition.carbs}</div>
                    <div><strong>Fat:</strong> {meal.nutrition.fat}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleOrderGroceries} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3"
              disabled={isLoadingGroceries}
            >
              {isLoadingGroceries ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Preparing Grocery List...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Order Groceries
                </>
              )}
            </Button>

            <Button onClick={generateMealPlan} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Plan
            </Button>
          </div>
        </div>
      )}

      {/* Grocery Modal */}
      <Dialog open={showGroceryModal} onOpenChange={setShowGroceryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Groceries from Kroger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {orderData ? (
              <div className="text-center space-y-4">
                <div className="text-4xl">✅</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Order Processing!</h3>
                  <p className="text-sm text-gray-600 mb-2">Session ID: {orderData.sessionId}</p>
                  <p className="text-sm text-gray-600 mb-4">Estimated Total: {orderData.estimatedTotal}</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="font-medium text-green-800">{orderData.storeInfo?.name}</p>
                    <p className="text-sm text-green-600">{orderData.storeInfo?.address}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => orderData.cartUrl && window.open(orderData.cartUrl, '_blank')} 
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    View Kroger Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setOrderData(null)
                      setShowGroceryModal(false)
                    }} 
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : isOrdering ? (
              <div className="text-center space-y-4">
                <div className="animate-bounce text-4xl">🛒</div>
                <p>Placing order with Kroger...</p>
                <Progress value={orderProgress} />
                <p className="text-sm text-gray-600">{orderProgress}% complete</p>
                {orderProgress === 100 && <p className="text-green-600 font-medium">Order placed successfully! 🎉</p>}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">Items needed for your meal plan:</p>
                <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                  {groceryItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 text-xs">({item.category})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">Qty: {item.quantity || 1}</span>
                        <span className="font-semibold text-green-600">{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={orderGroceries} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Place Order with Kroger
                  </Button>
                  <Button variant="outline" onClick={() => window.open("https://www.kroger.com/cart", "_blank")} className="flex-1">
                    View Kroger Cart
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}