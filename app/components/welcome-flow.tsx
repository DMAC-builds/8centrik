"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface WelcomeFlowProps {
  onComplete: (data: any) => void
}

const questions = [
  {
    id: 1,
    text: "How often do you feel bloated after meals?",
    type: "radio",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 2,
    text: "Do you experience fatigue after eating?",
    type: "radio",
    options: ["Never", "Sometimes", "Often"],
  },
  {
    id: 3,
    text: "How often do you crave sugar or sweets?",
    type: "radio",
    options: ["Rarely", "Sometimes", "Often", "Very Often"],
  },
  {
    id: 4,
    text: "Do you have any known reactions to dairy products?",
    type: "radio",
    options: ["Yes", "No"],
  },
  {
    id: 5,
    text: "How would you rate your morning energy levels?",
    type: "slider",
    min: 1,
    max: 5,
    labels: ["Very Low", "Low", "Moderate", "High", "Very High"],
  },
]

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAnswer = (questionId: number, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      handleGeneratePlan()
    }
  }

  const handleSkip = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      handleGeneratePlan()
    }
  }

  const handleGeneratePlan = async () => {
    setIsGenerating(true)
    // Simulate plan generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onComplete({ answers, totalQuestions: questions.length, answeredQuestions: Object.keys(answers).length })
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Generating your plan...</h2>
            <p className="text-gray-600">Analyzing your responses to create the perfect health plan for you.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const hasAnswer = answers[currentQ.id] !== undefined

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-gray-800">Let's Personalize Your Plan</CardTitle>
          <Progress value={progress} className="mt-4" />
          <p className="text-center text-sm text-gray-600 mt-2">
            {currentQuestion + 1} of {questions.length}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-center">{currentQ.text}</h3>

            {currentQ.type === "radio" && (
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
              >
                {currentQ.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${currentQ.id}-${index}`} />
                    <Label htmlFor={`${currentQ.id}-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === "slider" && (
              <div className="space-y-4">
                <Slider
                  value={[answers[currentQ.id] || currentQ.min || 1]}
                  onValueChange={(value) => handleAnswer(currentQ.id, value[0])}
                  min={currentQ.min || 1}
                  max={currentQ.max || 5}
                  step={1}
                  className="w-full"
                />
                {currentQ.labels && (
                  <div className="flex justify-between text-xs text-gray-500">
                    {currentQ.labels.map((label, index) => (
                      <span key={index}>{label}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <Button onClick={handleSkip} variant="outline" className="flex-1">
                Admin Skip
              </Button>
              <Button
                onClick={handleNext}
                className={`flex-1 ${hasAnswer ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}
              >
                {currentQuestion === questions.length - 1 ? "Generate My Plan" : "Next"}
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500">You can skip questions and still access the app</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
