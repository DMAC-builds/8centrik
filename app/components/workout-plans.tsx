"\"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function WorkoutPlans() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center">Workout Plans</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sample Workout Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for workout plans.</p>
        </CardContent>
      </Card>
    </div>
  )
}
