"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChefHat, ShoppingCart, Gift } from "lucide-react"

interface MealPathSelectionProps {
  onComplete: (data: any) => void
}

const mealOptions = [
  {
    id: "grocery-cook",
    title: "Grocery + Cook",
    icon: ChefHat,
    color: "bg-green-50 border-green-200",
    selectedColor: "bg-green-100 border-green-400",
    stats: {
      time: "3 hrs/week",
      cost: "$75–$100",
      adherence: "Moderate",
      incentive: "—",
    },
    pros: ["Full control over ingredients", "Cost effective", "Learn cooking skills"],
    cons: ["Time intensive", "Meal planning required", "Shopping trips needed"],
  },
  {
    id: "ready-meals",
    title: "Order Ready Meals",
    icon: ShoppingCart,
    color: "bg-blue-50 border-blue-200",
    selectedColor: "bg-blue-100 border-blue-400",
    recommended: true,
    stats: {
      time: "15 mins/week",
      cost: "$95",
      adherence: "High",
      incentive: "10% off w/ Factor",
    },
    pros: ["Minimal time commitment", "Perfect portions", "No meal planning needed"],
    cons: ["Higher cost", "Less cooking control", "Delivery dependent"],
  },
]

export function MealPathSelection({ onComplete }: MealPathSelectionProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const handleContinue = () => {
    if (selectedPath) {
      onComplete({ mealPath: selectedPath })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">How would you like to follow your plan?</CardTitle>
          <p className="text-gray-600">Choose the approach that fits your lifestyle</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comparison Table */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium">Option</th>
                  <th className="text-center p-3 font-medium">Time</th>
                  <th className="text-center p-3 font-medium">Cost</th>
                  <th className="text-center p-3 font-medium">Success</th>
                </tr>
              </thead>
              <tbody>
                {mealOptions.map((option) => (
                  <tr key={option.id} className="border-t">
                    <td className="p-3 font-medium">{option.title}</td>
                    <td className="text-center p-3">{option.stats.time}</td>
                    <td className="text-center p-3">{option.stats.cost}</td>
                    <td className="text-center p-3">{option.stats.adherence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Option Cards */}
          <div className="space-y-4">
            {mealOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedPath === option.id

              return (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? option.selectedColor : option.color
                  } ${isSelected ? "ring-2 ring-offset-2 ring-blue-500" : "hover:shadow-md"}`}
                  onClick={() => setSelectedPath(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            option.id === "grocery-cook" ? "bg-green-100" : "bg-blue-100"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${option.id === "grocery-cook" ? "text-green-600" : "text-blue-600"}`}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{option.title}</h3>
                          {option.recommended && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Recommended</Badge>
                          )}
                        </div>
                      </div>
                      {option.stats.incentive !== "—" && (
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          <Gift className="w-3 h-3 mr-1" />
                          {option.stats.incentive}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Pros:</p>
                        <ul className="space-y-1 text-gray-600">
                          {option.pros.map((pro, index) => (
                            <li key={index}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Cons:</p>
                        <ul className="space-y-1 text-gray-600">
                          {option.cons.map((con, index) => (
                            <li key={index}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700 py-3"
            disabled={!selectedPath}
          >
            Continue with {selectedPath === "grocery-cook" ? "Grocery + Cook" : "Ready Meals"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
