"use client"

import { useState } from "react"
import { ProfileCreation } from "./onboarding/profile-creation"
import { OnboardingQuestionnaire } from "./onboarding/onboarding-questionnaire"
import { InsightsResults } from "./onboarding/insights-results"
import { BodyProfile } from "./onboarding/body-profile"
import { LegalDisclaimer } from "./onboarding/legal-disclaimer"
import { SupplementRecommendations } from "./onboarding/supplement-recommendations"
import { NutritionOverview } from "./onboarding/nutrition-overview"
import { MealPathSelection } from "./onboarding/meal-path-selection"
import { DefineYourWhy } from "./onboarding/define-your-why"
import { DailyDashboard } from "./onboarding/daily-dashboard"

interface OnboardingFlowProps {
  onComplete: (data: any) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<any>({})

  const handleStepComplete = (stepData: any) => {
    const updatedData = { ...onboardingData, ...stepData }
    setOnboardingData(updatedData)

    if (currentStep < 10) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(updatedData)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProfileCreation onComplete={handleStepComplete} />
      case 2:
        return <OnboardingQuestionnaire onComplete={handleStepComplete} />
      case 3:
        return <InsightsResults answers={onboardingData.questionnaire || {}} onComplete={handleStepComplete} />
      case 4:
        return <BodyProfile onComplete={handleStepComplete} />
      case 5:
        return <LegalDisclaimer onComplete={handleStepComplete} />
      case 6:
        return (
          <SupplementRecommendations onComplete={handleStepComplete} questionnaireData={onboardingData.questionnaire} />
        )
      case 7:
        return <NutritionOverview onComplete={handleStepComplete} />
      case 8:
        return <MealPathSelection onComplete={handleStepComplete} />
      case 9:
        return <DefineYourWhy onComplete={handleStepComplete} />
      case 10:
        return <DailyDashboard onComplete={handleStepComplete} userData={onboardingData} />
      default:
        return <ProfileCreation onComplete={handleStepComplete} />
    }
  }

  return <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">{renderStep()}</div>
}
