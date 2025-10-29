"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield } from "lucide-react"

interface LegalDisclaimerProps {
  onComplete: (data: any) => void
}

export function LegalDisclaimer({ onComplete }: LegalDisclaimerProps) {
  const [hasScrolled, setHasScrolled] = useState(false)

  const handleScroll = (event: any) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolled(true)
    }
  }

  const handleAccept = () => {
    onComplete({ legalAccepted: true, acceptedAt: new Date().toISOString() })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Terms & Conditions</CardTitle>
          <p className="text-gray-600">Please review our terms before continuing</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-64 w-full border rounded-lg p-4" onScrollCapture={handleScroll}>
            <div className="space-y-4 text-sm text-gray-700">
              <h3 className="font-semibold">Health Disclaimer</h3>
              <p>
                This app provides general health and wellness information and is not intended as medical advice. Always
                consult with a healthcare professional before making significant changes to your diet, exercise routine,
                or supplement regimen.
              </p>

              <h3 className="font-semibold">Data Privacy</h3>
              <p>
                We take your privacy seriously. Your health data is encrypted and stored securely. We will never sell
                your personal information to third parties without your explicit consent.
              </p>

              <h3 className="font-semibold">Supplement Recommendations</h3>
              <p>
                Supplement recommendations are based on your questionnaire responses and general health principles.
                Individual results may vary. Consult your healthcare provider before starting any new supplements.
              </p>

              <h3 className="font-semibold">Meal Plans</h3>
              <p>
                Meal plans are designed for general wellness and may not be suitable for individuals with specific
                medical conditions, allergies, or dietary restrictions. Please review all ingredients carefully.
              </p>

              <h3 className="font-semibold">Limitation of Liability</h3>
              <p>
                This app is provided "as is" without warranties. We are not liable for any health outcomes resulting
                from the use of this application or following its recommendations.
              </p>

              <h3 className="font-semibold">Changes to Terms</h3>
              <p>
                We may update these terms periodically. Continued use of the app constitutes acceptance of any changes
                to these terms.
              </p>

              <p className="text-xs text-gray-500 mt-6">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </ScrollArea>

          <Button onClick={handleAccept} className="w-full bg-green-600 hover:bg-green-700" disabled={!hasScrolled}>
            I Acknowledge and Accept
          </Button>

          {!hasScrolled && <p className="text-xs text-gray-500 text-center">Please scroll to the bottom to continue</p>}
        </CardContent>
      </Card>
    </div>
  )
}
