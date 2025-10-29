"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Dot } from "recharts"
import { CheckInModal } from "./check-in-modal"
import { Badge } from "@/components/ui/badge"

const mockData = [
  {
    day: "Mon",
    energy: 3,
    mood: 4,
    bloating: 2,
    anxiety: 3,
    stress: 4,
    meals: [{ name: "Salmon Bowl", time: "12:30 PM", rating: 4 }],
  },
  {
    day: "Tue",
    energy: 4,
    mood: 4,
    bloating: 1,
    anxiety: 2,
    stress: 2,
    meals: [{ name: "Chicken Salad", time: "1:00 PM", rating: 5 }],
  },
  {
    day: "Wed",
    energy: 2,
    mood: 3,
    bloating: 4,
    anxiety: 4,
    stress: 5,
    meals: [{ name: "Quinoa Bowl", time: "12:45 PM", rating: 3 }],
  },
  {
    day: "Thu",
    energy: 5,
    mood: 5,
    bloating: 1,
    anxiety: 1,
    stress: 1,
    meals: [{ name: "Turkey Wrap", time: "1:15 PM", rating: 4 }],
  },
  {
    day: "Fri",
    energy: 4,
    mood: 4,
    bloating: 2,
    anxiety: 2,
    stress: 3,
    meals: [{ name: "Greek Bowl", time: "12:20 PM", rating: 5 }],
  },
  {
    day: "Sat",
    energy: 3,
    mood: 3,
    bloating: 3,
    anxiety: 3,
    stress: 2,
    meals: [{ name: "Veggie Stir-fry", time: "1:30 PM", rating: 4 }],
  },
  {
    day: "Sun",
    energy: 4,
    mood: 4,
    bloating: 1,
    anxiety: 2,
    stress: 2,
    meals: [{ name: "Protein Bowl", time: "12:50 PM", rating: 5 }],
  },
]

const todaysMeals = [
  { name: "Berry Smoothie Bowl", completed: true },
  { name: "Salmon Salad", completed: true },
  { name: "Apple with Almond Butter", completed: false },
  { name: "Grass-fed Beef with Vegetables", completed: false },
]

const todaysSupplements = [
  { name: "Adrenal Support", completed: true },
  { name: "Digestive Enzymes", completed: true },
  { name: "Magnesium", completed: false },
  { name: "Omega-3", completed: false },
]

interface DashboardProps {
  userData: any
}

export function Dashboard({ userData }: DashboardProps) {
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<any>(null)
  const [quickCheckIn, setQuickCheckIn] = useState({
    energy: [3],
    mood: "😊",
    bloating: [2],
    anxiety: [2],
    stress: [2],
  })

  const moodEmojis = ["😢", "😕", "😐", "😊", "😄"]

  const handlePointClick = (data: any) => {
    setSelectedPoint(data)
  }

  const handleMealToggle = (index: number) => {
    // Mock meal completion toggle
    console.log(`Toggled meal ${index}`)
  }

  const handleSupplementToggle = (index: number) => {
    // Mock supplement completion toggle
    console.log(`Toggled supplement ${index}`)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userData.profile?.firstName || "there"}! 👋</h1>
        <p className="text-gray-600 mt-1">Day 3 of your health journey</p>
      </div>

      {/* Completion Stats */}
      {userData.totalQuestions && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-800">Questionnaire Progress</p>
                <p className="text-xs text-blue-600">
                  {userData.answeredQuestions} of {userData.totalQuestions} questions answered
                </p>
              </div>
              <div className="text-2xl">{userData.answeredQuestions === userData.totalQuestions ? "✅" : "📝"}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <CardContent className="p-4 text-center">
          <p className="font-medium">You're doing amazing! 🌟</p>
          <p className="text-sm opacity-90 mt-1">This isn't a diet. This is your plan.</p>
        </CardContent>
      </Card>

      {/* Quick Check-in */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Energy (1-5)</label>
              <Slider
                value={quickCheckIn.energy}
                onValueChange={(value) => setQuickCheckIn((prev) => ({ ...prev, energy: value }))}
                min={1}
                max={5}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mood</label>
              <div className="flex justify-between mt-2">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setQuickCheckIn((prev) => ({ ...prev, mood: emoji }))}
                    className={`text-2xl p-1 rounded ${quickCheckIn.mood === emoji ? "bg-green-100" : ""}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={() => setShowCheckIn(true)} variant="outline" className="w-full">
            Full Check-in
          </Button>
        </CardContent>
      </Card>

      {/* Today's Meals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Today's Meals
            <Badge variant="outline">3/4 Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysMeals.map((meal, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Checkbox checked={meal.completed} onCheckedChange={() => handleMealToggle(index)} />
                <span className={`flex-1 ${meal.completed ? "line-through text-gray-500" : ""}`}>{meal.name}</span>
                {meal.completed && <span className="text-green-500">✓</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Supplements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Today's Supplements
            <Badge variant="outline">2/4 Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysSupplements.map((supplement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Checkbox checked={supplement.completed} onCheckedChange={() => handleSupplementToggle(index)} />
                <span className={`flex-1 ${supplement.completed ? "line-through text-gray-500" : ""}`}>
                  {supplement.name}
                </span>
                {supplement.completed && <span className="text-green-500">✓</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Insights Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Health Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[1, 5]} />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={
                    <Dot fill="#10b981" strokeWidth={2} r={4} onClick={handlePointClick} className="cursor-pointer" />
                  }
                  name="Energy"
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={
                    <Dot fill="#3b82f6" strokeWidth={2} r={4} onClick={handlePointClick} className="cursor-pointer" />
                  }
                  name="Mood"
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={
                    <Dot fill="#ef4444" strokeWidth={2} r={4} onClick={handlePointClick} className="cursor-pointer" />
                  }
                  name="Stress"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Energy</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Mood</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Stress</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Point Details */}
      {selectedPoint && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800">{selectedPoint.day} Check-in</h3>
            <div className="flex justify-between mt-2 text-sm">
              <span>🌤️ Energy: {selectedPoint.energy}/5</span>
              <span>😊 Mood: {selectedPoint.mood}/5</span>
              <span>⚡ Stress: {selectedPoint.stress}/5</span>
            </div>
            {selectedPoint.meals && selectedPoint.meals.length > 0 && (
              <div className="mt-2 text-sm text-green-700">
                <strong>Meal:</strong> {selectedPoint.meals[0].name} at {selectedPoint.meals[0].time}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <CheckInModal isOpen={showCheckIn} onClose={() => setShowCheckIn(false)} />
    </div>
  )
}
