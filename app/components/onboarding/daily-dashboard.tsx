"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Sparkles } from "lucide-react"

interface DailyDashboardProps {
  onComplete: (data: any) => void
  userData: any
}

export function DailyDashboard({ onComplete, userData }: DailyDashboardProps) {
  const handleGetStarted = () => {
    onComplete({ setupComplete: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Welcome, {userData.profile?.firstName}! 🎉</CardTitle>
          <p className="text-gray-600">Your personalized health journey is ready</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">Profile created</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">Health assessment completed</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">Nutrition plan personalized</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">Meal path selected</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">Motivation defined</span>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardContent className="p-4 text-center">
              <p className="font-semibold mb-2">Your Journey Starts Now! 🌟</p>
              <p className="text-sm opacity-90">Remember: "{userData.why?.motivation?.slice(0, 50)}..."</p>
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Track meals, supplements, and daily check-ins to optimize your health
            </p>
          </div>

          <Button onClick={handleGetStarted} className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg">
            Start My Health Journey
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
