"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Pill, ShoppingCart } from "lucide-react"

const getRecommendations = (questionnaireData: any) => {
  // Mock logic based on questionnaire responses
  const supplements = [
    {
      id: 1,
      name: "Adrenal Support Complex",
      description: "Supports healthy stress response and energy levels",
      reason: "Based on your fatigue and stress levels",
      price: "$29.99",
      image: "💊",
    },
    {
      id: 2,
      name: "Digestive Enzymes",
      description: "Aids digestion and reduces bloating",
      reason: "Recommended for digestive concerns",
      price: "$24.99",
      image: "🌿",
    },
    {
      id: 3,
      name: "Magnesium Glycinate",
      description: "Promotes relaxation and better sleep quality",
      reason: "Supports sleep and anxiety management",
      price: "$19.99",
      image: "😴",
    },
    {
      id: 4,
      name: "Omega-3 Complex",
      description: "Supports brain health and reduces inflammation",
      reason: "Essential for overall wellness",
      price: "$34.99",
      image: "🐟",
    },
    {
      id: 5,
      name: "Probiotic Blend",
      description: "Supports gut health and immune function",
      reason: "Recommended for digestive balance",
      price: "$39.99",
      image: "🦠",
    },
  ]

  return supplements.slice(0, 4) // Return top 4 recommendations
}

interface SupplementRecommendationsProps {
  onComplete: (data: any) => void
  questionnaireData: any
}

export function SupplementRecommendations({ onComplete, questionnaireData }: SupplementRecommendationsProps) {
  const [alreadyOwn, setAlreadyOwn] = useState(false)
  const recommendations = getRecommendations(questionnaireData)

  const handleContinue = () => {
    onComplete({
      supplements: {
        recommendations,
        alreadyOwn,
        selectedForPurchase: !alreadyOwn,
      },
    })
  }

  const totalPrice = recommendations.reduce((sum, supp) => sum + Number.parseFloat(supp.price.replace("$", "")), 0)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Your Phase 1 Supplements</CardTitle>
          <p className="text-gray-600">Personalized recommendations based on your assessment</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((supplement) => (
              <Card key={supplement.id} className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{supplement.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{supplement.name}</h3>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {supplement.price}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{supplement.description}</p>
                      <p className="text-xs text-green-700 font-medium">{supplement.reason}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-800">Complete Stack</p>
                  <p className="text-sm text-blue-600">Save 15% when you buy all together</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-800">${totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-blue-600 line-through">${(totalPrice * 1.15).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button className="w-full bg-green-600 hover:bg-green-700 py-3">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add All to Cart
            </Button>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="alreadyOwn"
                checked={alreadyOwn}
                onCheckedChange={(checked) => setAlreadyOwn(checked as boolean)}
              />
              <label htmlFor="alreadyOwn" className="text-sm text-gray-600">
                I already own these supplements
              </label>
            </div>

            <Button onClick={handleContinue} variant="outline" className="w-full bg-transparent">
              Continue to Nutrition Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
