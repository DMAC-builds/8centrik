"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Apple, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NutritionOverviewProps {
  onComplete: (data: any) => void
}

const macroGoals = [
  { name: "Protein", target: "25-30g per meal", color: "bg-red-100 text-red-800", icon: "🥩" },
  { name: "Vegetables", target: "2-3 cups per meal", color: "bg-green-100 text-green-800", icon: "🥬" },
  { name: "Healthy Fats", target: "1-2 tbsp per meal", color: "bg-yellow-100 text-yellow-800", icon: "🥑" },
]

const avoidCategories = [
  {
    name: "Dairy",
    icon: "🧀",
    reason: "Can trigger inflammation and digestive issues",
    color: "bg-red-50 border-red-200",
  },
  {
    name: "Refined Oils",
    icon: "🛢️",
    reason: "High in omega-6 fatty acids that promote inflammation",
    color: "bg-orange-50 border-orange-200",
  },
  {
    name: "Grains",
    icon: "🌾",
    reason: "May cause digestive issues and blood sugar spikes",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    name: "Added Sugar",
    icon: "🍭",
    reason: "Causes energy crashes and promotes cravings",
    color: "bg-pink-50 border-pink-200",
  },
]

export function NutritionOverview({ onComplete }: NutritionOverviewProps) {
  const handleContinue = () => {
    onComplete({ nutritionPlan: { macroGoals, avoidCategories } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Apple className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Your Phase 1 Nutrition Plan</CardTitle>
          <p className="text-gray-600">Simple guidelines to reset your metabolism</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Macro Goals */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Daily Targets</h3>
            <div className="space-y-3">
              {macroGoals.map((macro, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{macro.icon}</span>
                    <div>
                      <p className="font-medium text-gray-800">{macro.name}</p>
                      <p className="text-sm text-gray-600">{macro.target}</p>
                    </div>
                  </div>
                  <Badge className={macro.color}>Focus</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Avoid Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Temporarily Avoid</h3>
            <div className="grid grid-cols-2 gap-3">
              {avoidCategories.map((category, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className={`${category.color} cursor-help hover:shadow-md transition-shadow`}>
                        <CardContent className="p-3 text-center">
                          <div className="text-2xl mb-2">{category.icon}</div>
                          <p className="font-medium text-gray-800 text-sm">{category.name}</p>
                          <Info className="w-3 h-3 text-gray-500 mx-auto mt-1" />
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{category.reason}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Phase Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Why Phase 1?</h4>
              <p className="text-sm text-blue-700">
                This 30-day reset eliminates common inflammatory foods while providing your body with nutrient-dense
                whole foods to restore balance and energy.
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-700 py-3">
            Continue to Meal Planning
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
