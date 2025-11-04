"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface InsightsResultsProps {
  answers: Record<number, number>
  onComplete: () => void
}

export function InsightsResults({ answers, onComplete }: InsightsResultsProps) {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch('http://localhost:3001/api/insights/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers })
        })

        if (!response.ok) {
          throw new Error('Failed to generate insights')
        }

        const data = await response.json()
        setInsights(data.insights)
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching insights:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchInsights()
  }, [answers])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Analyzing Your Responses...</h2>
        <p className="text-gray-600 mt-2">This may take a few moments</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center text-green-700">
              Your Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            {insights?.summary && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Summary</h3>
                <p className="text-gray-700">{insights.summary}</p>
              </div>
            )}

            {/* Top Concerns */}
            {insights?.top_concerns && insights.top_concerns.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Top Concerns</h3>
                <ul className="list-disc list-inside space-y-1">
                  {insights.top_concerns.map((concern: string, i: number) => (
                    <li key={i} className="text-gray-700">{concern}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {insights?.recommendations && insights.recommendations.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Recommendations</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {insights.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-gray-700">{rec}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Supplements */}
            {insights?.supplements && insights.supplements.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Suggested Supplements</h3>
                <div className="space-y-3">
                  {insights.supplements.map((supp: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800">{supp.name}</h4>
                      <p className="text-sm text-gray-600">{supp.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Foods to Emphasize */}
            {insights?.foods_emphasize && insights.foods_emphasize.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Foods to Emphasize</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.foods_emphasize.map((food: string, i: number) => (
                    <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Foods to Avoid */}
            {insights?.foods_avoid && insights.foods_avoid.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Foods to Avoid</h3>
                <div className="flex flex-wrap gap-2">
                  {insights.foods_avoid.map((food: string, i: number) => (
                    <span key={i} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={onComplete} 
              className="w-full bg-green-600 hover:bg-green-700 py-3 mt-6"
            >
              Continue to Next Step
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
