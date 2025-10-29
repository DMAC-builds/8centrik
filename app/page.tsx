"use client"

import { useState } from "react"
import { OnboardingFlow } from "./components/onboarding-flow"
import { MainApp } from "./components/main-app"

export default function HealthApp() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [userData, setUserData] = useState({})

  const handleOnboardingComplete = (data: any) => {
    setUserData(data)
    setHasCompletedOnboarding(true)
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return <MainApp userData={userData} />
}
