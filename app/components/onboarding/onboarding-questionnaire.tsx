"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"

const questions = [
  {
    id: 1,
    category: "Fatigue",
    title: "How often do you feel tired or low energy?",
    min: 1,
    max: 5,
    labels: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 2,
    category: "Bloating",
    title: "How often do you experience bloating after meals?",
    min: 1,
    max: 5,
    labels: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 3,
    category: "Anxiety",
    title: "How would you rate your anxiety levels?",
    min: 1,
    max: 5,
    labels: ["Very Low", "Low", "Moderate", "High", "Very High"],
  },
  {
    id: 4,
    category: "Cravings",
    title: "How often do you crave sugar or processed foods?",
    min: 1,
    max: 5,
    labels: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 5,
    category: "Sleep",
    title: "How would you rate your sleep quality?",
    min: 1,
    max: 5,
    labels: ["Very Poor", "Poor", "Fair", "Good", "Excellent"],
  },
  {
    id: 6,
    category: "Digestion",
    title: "How often do you experience digestive issues?",
    min: 1,
    max: 5,
    labels: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 7,
    category: "Mood",
    title: "How stable is your mood throughout the day?",
    min: 1,
    max: 5,
    labels: ["Very Unstable", "Unstable", "Moderate", "Stable", "Very Stable"],
  },
  {
    id: 8,
    category: "Focus",
    title: "How would you rate your mental clarity and focus?",
    min: 1,
    max: 5,
    labels: ["Very Poor", "Poor", "Fair", "Good", "Excellent"],
  },
]

interface OnboardingQuestionnaireProps {
  onComplete: (data: any) => void
}

export function OnboardingQuestionnaire({ onComplete }: OnboardingQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      onComplete({ questionnaire: answers })
    }
  }

  const currentAnswer = answers[question.id] || 3

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <span className="text-green-600 font-semibold">{question.category.charAt(0)}</span>
            </div>
            <CardTitle className="text-xl font-bold text-gray-800 mb-2">{question.category}</CardTitle>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-6">{question.title}</h3>

            <div className="space-y-6">
              <div className="px-4">
                <Slider
                  value={[currentAnswer]}
                  onValueChange={(value) => handleAnswer(value[0])}
                  min={question.min}
                  max={question.max}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500 px-2">
                <span>{question.labels[0]}</span>
                <span>{question.labels[question.labels.length - 1]}</span>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full">
                  <span className="text-2xl font-bold text-green-600">{currentAnswer}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{question.labels[currentAnswer - 1]}</p>
              </div>
            </div>
          </div>

          <Button onClick={handleNext} className="w-full bg-green-600 hover:bg-green-700 py-3">
            {currentQuestion === questions.length - 1 ? "Complete Assessment" : "Next Question"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
