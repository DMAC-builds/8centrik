"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckInModal } from "./check-in-modal"
import { Calendar, TrendingUp, TrendingDown } from "lucide-react"

const mockCheckIns = [
  {
    date: "Today, June 25",
    energy: 4,
    mood: "😊",
    bloating: 2,
    anxiety: 2,
    stress: 2,
    time: "2:30 PM",
    notes: "Feeling great after lunch!",
  },
  {
    date: "Yesterday, June 24",
    energy: 3,
    mood: "😐",
    bloating: 3,
    anxiety: 3,
    stress: 3,
    time: "1:15 PM",
    notes: "Slight afternoon dip",
  },
  {
    date: "Wed, June 23",
    energy: 5,
    mood: "😄",
    bloating: 1,
    anxiety: 1,
    stress: 1,
    time: "12:45 PM",
    notes: "Amazing energy today!",
  },
  {
    date: "Tue, June 22",
    energy: 2,
    mood: "😕",
    bloating: 4,
    anxiety: 4,
    stress: 4,
    time: "3:20 PM",
    notes: "Feeling bloated after meal",
  },
  {
    date: "Mon, June 21",
    energy: 4,
    mood: "😊",
    bloating: 2,
    anxiety: 2,
    stress: 2,
    time: "11:30 AM",
    notes: "Good start to the week",
  },
]

interface EnhancedCheckInsProps {
  userData: any
}

export function EnhancedCheckIns({ userData }: EnhancedCheckInsProps) {
  const [showCheckIn, setShowCheckIn] = useState(false)

  const getScoreColor = (score: number) => {
    if (score <= 2) return "text-green-600"
    if (score <= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score <= 2) return "bg-green-100 text-green-800"
    if (score <= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: "text-red-500", text: "↑" }
    if (current < previous) return { icon: TrendingDown, color: "text-green-500", text: "↓" }
    return { icon: null, color: "text-gray-500", text: "→" }
  }

  const calculateAverages = () => {
    const recent = mockCheckIns.slice(0, 3)
    return {
      energy: (recent.reduce((sum, item) => sum + item.energy, 0) / recent.length).toFixed(1),
      stress: (recent.reduce((sum, item) => sum + item.stress, 0) / recent.length).toFixed(1),
      bloating: (recent.reduce((sum, item) => sum + item.bloating, 0) / recent.length).toFixed(1),
      anxiety: (recent.reduce((sum, item) => sum + item.anxiety, 0) / recent.length).toFixed(1),
    }
  }

  const averages = calculateAverages()

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Check-Ins</h1>
          <p className="text-gray-600">Track your daily wellness</p>
        </div>
        <Button onClick={() => setShowCheckIn(true)} className="bg-green-600 hover:bg-green-700">
          Add Check-In
        </Button>
      </div>

      {/* Weekly Averages */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            3-Day Averages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{averages.energy}</p>
              <p className="text-sm text-gray-600">Energy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{averages.stress}</p>
              <p className="text-sm text-gray-600">Stress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{averages.bloating}</p>
              <p className="text-sm text-gray-600">Bloating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{averages.anxiety}</p>
              <p className="text-sm text-gray-600">Anxiety</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-in History */}
      <div className="space-y-3">
        {mockCheckIns.map((checkIn, index) => {
          const previousCheckIn = mockCheckIns[index + 1]

          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-800">{checkIn.date}</h3>
                    <p className="text-sm text-gray-500">{checkIn.time}</p>
                  </div>
                  <div className="text-2xl">{checkIn.mood}</div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Energy</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getScoreBadge(checkIn.energy)}>{checkIn.energy}/5</Badge>
                      {previousCheckIn && (
                        <span className={`text-xs ${getTrend(checkIn.energy, previousCheckIn.energy).color}`}>
                          {getTrend(checkIn.energy, previousCheckIn.energy).text}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Stress</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getScoreBadge(checkIn.stress)}>{checkIn.stress}/5</Badge>
                      {previousCheckIn && (
                        <span className={`text-xs ${getTrend(checkIn.stress, previousCheckIn.stress).color}`}>
                          {getTrend(checkIn.stress, previousCheckIn.stress).text}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Bloating</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getScoreBadge(checkIn.bloating)}>{checkIn.bloating}/5</Badge>
                      {previousCheckIn && (
                        <span className={`text-xs ${getTrend(checkIn.bloating, previousCheckIn.bloating).color}`}>
                          {getTrend(checkIn.bloating, previousCheckIn.bloating).text}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Anxiety</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getScoreBadge(checkIn.anxiety)}>{checkIn.anxiety}/5</Badge>
                      {previousCheckIn && (
                        <span className={`text-xs ${getTrend(checkIn.anxiety, previousCheckIn.anxiety).color}`}>
                          {getTrend(checkIn.anxiety, previousCheckIn.anxiety).text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {checkIn.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">💭 {checkIn.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Enhanced Check-in Modal */}
      <CheckInModal isOpen={showCheckIn} onClose={() => setShowCheckIn(false)} />
    </div>
  )
}
