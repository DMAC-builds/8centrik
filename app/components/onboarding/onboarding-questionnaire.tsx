"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

// POC: Using 1-5 scale (will migrate to 1-3 post-POC)
// TODO P2: Migrate UI to 1-3 radio buttons after validation

interface Question {
  id: string
  code: string
  question_text: string
  group: string
  scale_min: number
  scale_max: number
  scale_labels: string[]
}

interface OnboardingQuestionnaireProps {
  onComplete: (data: any) => void
}

export function OnboardingQuestionnaire({ onComplete }: OnboardingQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)

  // Hardcoded questions for POC - matches database seed
  const questions = [
    {
      id: 1,
      code: 'FATIGUE_01',
      question_text: 'How often do you feel tired or low energy?',
      group: 'Energy & Fatigue',
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 2,
      code: 'DIGESTION_01',
      question_text: 'How often do you experience bloating after meals?',
      group: 'Digestive Health',
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 3,
      code: 'MENTAL_01',
      question_text: 'How would you rate your anxiety levels?',
      group: 'Mental Health',
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
    },
    {
      id: 4,
      code: 'CRAVINGS_01',
      question_text: 'How often do you crave sugar or processed foods?',
      group: 'Nutrition & Cravings',
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 5,
      code: 'SLEEP_01',
      question_text: 'How would you rate your sleep quality?',
      group: 'Sleep & Recovery',
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
    },
    {
      id: 6,
      code: 'DIGESTION_02',
      question_text: 'How often do you experience digestive issues?',
      group: 'Digestive Health',
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
    },
    {
      id: 7,
      code: 'MENTAL_02',
      question_text: 'How stable is your mood throughout the day?',
      group: 'Mental Health',
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Very Unstable', 'Unstable', 'Moderate', 'Stable', 'Very Stable']
    },
    {
      id: 8,
      code: 'FOCUS_01',
      question_text: 'How would you rate your mental clarity and focus?',
      group: 'Cognitive Function',
      scale_min: 1,
      scale_max: 5,
      scale_labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
    }
  ]

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    // Pass answers to parent component
    onComplete({ questionnaire: answers })
  }

  const question = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const currentAnswer = answers[question.id] || 3
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <span className="text-green-600 font-semibold">{question.group?.charAt(0) || 'Q'}</span>
            </div>
            <CardTitle className="text-xl font-bold text-gray-800 mb-2">{question.group || 'Health Assessment'}</CardTitle>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-6">{question.question_text}</h3>

            <div className="space-y-6">
              <div className="px-4">
                <Slider
                  value={[currentAnswer]}
                  onValueChange={(value) => handleAnswer(question.id, value[0])}
                  min={question.scale_min}
                  max={question.scale_max}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500 px-2">
                <span>{question.scale_labels[0]}</span>
                <span>{question.scale_labels[question.scale_labels.length - 1]}</span>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full">
                  <span className="text-2xl font-bold text-green-600">{currentAnswer}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{question.scale_labels[currentAnswer - 1]}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {currentQuestionIndex > 0 && (
              <Button 
                onClick={handlePrevious} 
                variant="outline"
                className="w-1/3"
              >
                Previous
              </Button>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <Button 
                onClick={handleNext} 
                className="flex-1 bg-green-600 hover:bg-green-700 py-3"
              >
                Next Question
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-green-600 hover:bg-green-700 py-3"
              >
                Complete Assessment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
