"use client"

import { useState } from "react"
import { Dashboard } from "./dashboard"
import { CheckIns } from "./check-ins"
import { Foods } from "./foods"
import { MealPlanner } from "./meal-planner"
import { Profile } from "./profile"
import { WorkoutPlans } from "./workout-plans"
import { Home, Activity, Apple, Calendar, User, Dumbbell } from "lucide-react"

interface MainAppProps {
  userData: any
}

export function MainApp({ userData }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("dashboard")

  const tabs = [
    { id: "dashboard", label: "Home", icon: Home, component: Dashboard },
    { id: "checkins", label: "Check-Ins", icon: Activity, component: CheckIns },
    { id: "foods", label: "Foods", icon: Apple, component: Foods },
    { id: "meal-planner", label: "Meals", icon: Calendar, component: MealPlanner },
    { id: "workouts", label: "Workouts", icon: Dumbbell, component: WorkoutPlans },
    { id: "profile", label: "Profile", icon: User, component: Profile },
  ]

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || Dashboard

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        <ActiveComponent userData={userData} />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="grid grid-cols-6 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-1 transition-colors ${
                  activeTab === tab.id ? "text-green-600 bg-green-50" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
