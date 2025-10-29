"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Heart } from "lucide-react"

interface DefineYourWhyProps {
  onComplete: (data: any) => void
}

export function DefineYourWhy({ onComplete }: DefineYourWhyProps) {
  const [whyData, setWhyData] = useState({
    motivation: "",
    feelingGoal: "",
    forWhom: "",
  })

  const handleContinue = () => {
    onComplete({ why: whyData })
  }

  const isValid = whyData.motivation.trim() && whyData.feelingGoal.trim()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-pink-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Define Your "Why"</CardTitle>
          <p className="text-gray-600">Your motivation will keep you going when things get tough</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="motivation" className="text-sm font-medium">
              Why are you doing this? *
            </Label>
            <Textarea
              id="motivation"
              value={whyData.motivation}
              onChange={(e) => setWhyData((prev) => ({ ...prev, motivation: e.target.value }))}
              placeholder="I want to have more energy to play with my kids..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feelingGoal" className="text-sm font-medium">
              How do you want to feel in 30 days? *
            </Label>
            <Textarea
              id="feelingGoal"
              value={whyData.feelingGoal}
              onChange={(e) => setWhyData((prev) => ({ ...prev, feelingGoal: e.target.value }))}
              placeholder="Energized, confident, and in control of my health..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forWhom" className="text-sm font-medium">
              Who are you doing this for? (Optional)
            </Label>
            <Textarea
              id="forWhom"
              value={whyData.forWhom}
              onChange={(e) => setWhyData((prev) => ({ ...prev, forWhom: e.target.value }))}
              placeholder="My family, my future self, my children..."
              className="resize-none"
              rows={2}
            />
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> We'll use your answers to send personalized motivation reminders and celebrate
                your progress along the way.
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-700 py-3" disabled={!isValid}>
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
