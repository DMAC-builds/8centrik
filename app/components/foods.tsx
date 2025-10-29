"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Camera, Scan, Grid3X3, List, Info } from "lucide-react"
import { MenuScanner } from "./menu-scanner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const foodCategories = {
  "Eat Often": {
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    foods: {
      Proteins: [
        { name: "Wild-caught salmon", benefit: "Supports brain health" },
        { name: "Grass-fed beef", benefit: "High in omega-3s" },
        { name: "Free-range chicken", benefit: "Clean protein source" },
        { name: "Turkey", benefit: "Lean protein" },
        { name: "Free-range eggs", benefit: "Complete amino acids" },
        { name: "Sardines", benefit: "Rich in omega-3s" },
      ],
      Vegetables: [
        { name: "Leafy greens", benefit: "Supports detox" },
        { name: "Broccoli", benefit: "Anti-inflammatory" },
        { name: "Cauliflower", benefit: "Supports gut health" },
        { name: "Bell peppers", benefit: "High in vitamin C" },
        { name: "Zucchini", benefit: "Low inflammatory" },
        { name: "Asparagus", benefit: "Supports liver function" },
      ],
      Fruits: [
        { name: "Berries", benefit: "Antioxidant powerhouse" },
        { name: "Apples", benefit: "Supports gut health" },
        { name: "Citrus fruits", benefit: "Immune support" },
        { name: "Avocado", benefit: "Healthy fats" },
        { name: "Coconut", benefit: "MCT energy" },
      ],
      "Spices & Herbs": [
        { name: "Turmeric", benefit: "Anti-inflammatory" },
        { name: "Ginger", benefit: "Supports digestion" },
        { name: "Garlic", benefit: "Immune support" },
        { name: "Oregano", benefit: "Antimicrobial" },
        { name: "Basil", benefit: "Antioxidant rich" },
      ],
    },
  },
  "Occasionally Okay": {
    color: "yellow",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    foods: {
      Proteins: [
        { name: "Conventional chicken", benefit: "Moderate quality protein" },
        { name: "Farmed fish", benefit: "Good protein source" },
        { name: "Conventional eggs", benefit: "Affordable protein" },
      ],
      Vegetables: [
        { name: "Conventional vegetables", benefit: "Still nutritious" },
        { name: "Frozen vegetables", benefit: "Convenient option" },
      ],
      Fruits: [
        { name: "Conventional fruits", benefit: "Natural sugars" },
        { name: "Dried fruits (unsweetened)", benefit: "Concentrated nutrients" },
      ],
      Grains: [
        { name: "White rice", benefit: "Easy to digest" },
        { name: "Quinoa", benefit: "Complete protein" },
      ],
    },
  },
  "Avoid Completely": {
    color: "red",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    foods: {
      Dairy: [
        { name: "Milk", benefit: "May cause inflammation" },
        { name: "Cheese", benefit: "Triggers digestive issues" },
        { name: "Yogurt", benefit: "Can worsen bloating" },
        { name: "Ice cream", benefit: "High sugar + dairy" },
      ],
      "Processed Foods": [
        { name: "Fast food", benefit: "High in inflammatory oils" },
        { name: "Packaged snacks", benefit: "Contains preservatives" },
        { name: "Deli meats", benefit: "High in nitrates" },
        { name: "Frozen meals", benefit: "High sodium content" },
      ],
      "Refined Sugars": [
        { name: "White sugar", benefit: "Causes energy crashes" },
        { name: "High fructose corn syrup", benefit: "Metabolic disruption" },
        { name: "Artificial sweeteners", benefit: "May disrupt gut bacteria" },
      ],
      "Industrial Oils": [
        { name: "Vegetable oil", benefit: "High in omega-6" },
        { name: "Canola oil", benefit: "Highly processed" },
        { name: "Soybean oil", benefit: "Inflammatory" },
      ],
    },
  },
}

interface FoodsProps {
  userData?: any
}

export function Foods({ userData }: FoodsProps) {
  const [activeView, setActiveView] = useState<"Eat Often" | "Occasionally Okay" | "Avoid Completely">("Eat Often")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})
  const [showMenuScanner, setShowMenuScanner] = useState(false)

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const currentCategory = foodCategories[activeView]

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 text-center">Foods</h1>

      {/* Menu Scan Module */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <Scan className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Menu Scan</h3>
                <p className="text-sm opacity-90">Scan restaurant menus for healthy recommendations</p>
              </div>
            </div>
            <Button onClick={() => setShowMenuScanner(true)} className="bg-white text-blue-600 hover:bg-gray-100">
              <Camera className="w-4 h-4 mr-2" />
              Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3-Tier Toggle Pills */}
      <div className="flex bg-gray-100 rounded-lg p-1 space-x-1">
        <Button
          variant={activeView === "Eat Often" ? "default" : "ghost"}
          onClick={() => setActiveView("Eat Often")}
          className={`flex-1 text-sm ${activeView === "Eat Often" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
        >
          ✅ Eat Often
        </Button>
        <Button
          variant={activeView === "Occasionally Okay" ? "default" : "ghost"}
          onClick={() => setActiveView("Occasionally Okay")}
          className={`flex-1 text-sm ${activeView === "Occasionally Okay" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}`}
        >
          🟡 Occasionally
        </Button>
        <Button
          variant={activeView === "Avoid Completely" ? "default" : "ghost"}
          onClick={() => setActiveView("Avoid Completely")}
          className={`flex-1 text-sm ${activeView === "Avoid Completely" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
        >
          ❌ Avoid
        </Button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <Badge variant="outline" className={currentCategory.textColor}>
          {activeView}
        </Badge>
        <div className="flex space-x-2">
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Food Categories */}
      <div className="space-y-3">
        {Object.entries(currentCategory.foods).map(([categoryName, foods]) => (
          <Card key={categoryName} className={`${currentCategory.bgColor} ${currentCategory.borderColor}`}>
            <Collapsible open={openCategories[categoryName]} onOpenChange={() => toggleCategory(categoryName)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-opacity-80 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-lg ${currentCategory.textColor}`}>{categoryName}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {foods.length} items
                      </Badge>
                      {openCategories[categoryName] ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  {viewMode === "list" ? (
                    <div className="space-y-2">
                      {foods.map((food, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`${currentCategory.bgColor} border ${currentCategory.borderColor} rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition-shadow cursor-help`}
                              >
                                <span className={`font-medium ${currentCategory.textColor}`}>{food.name}</span>
                                <Info className="w-4 h-4 text-gray-400" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{food.benefit}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {foods.map((food, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`${currentCategory.bgColor} border ${currentCategory.borderColor} rounded-lg p-3 text-center hover:shadow-sm transition-shadow cursor-help`}
                              >
                                <p className={`font-medium text-sm ${currentCategory.textColor}`}>{food.name}</p>
                                <Info className="w-3 h-3 text-gray-400 mx-auto mt-1" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">{food.benefit}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Menu Scanner Modal */}
      <MenuScanner isOpen={showMenuScanner} onClose={() => setShowMenuScanner(false)} />
    </div>
  )
}
