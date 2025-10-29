"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, X, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface MenuScannerProps {
  isOpen: boolean
  onClose: () => void
}

const mockMenuItems = [
  {
    name: "Grilled Chicken Caesar Salad",
    description: "Romaine lettuce, grilled chicken, parmesan, croutons, caesar dressing",
    healthScore: 8,
    recommendation: "Great choice! Remove croutons and ask for dressing on the side.",
    reasons: ["✅ Free-range chicken (protein)", "✅ Leafy greens", "⚠️ Dairy (parmesan)", "❌ Processed croutons"],
  },
  {
    name: "Salmon with Roasted Vegetables",
    description: "Atlantic salmon, seasonal vegetables, herb butter",
    healthScore: 9,
    recommendation: "Excellent choice! This aligns perfectly with your plan.",
    reasons: ["✅ Wild-caught salmon", "✅ Seasonal vegetables", "✅ Herbs", "⚠️ Ask about butter ingredients"],
  },
  {
    name: "Pasta Carbonara",
    description: "Spaghetti, bacon, eggs, parmesan, cream sauce",
    healthScore: 3,
    recommendation: "Avoid this option. High in gluten and dairy.",
    reasons: ["❌ Gluten (pasta)", "❌ Dairy (cream, parmesan)", "❌ Processed bacon", "⚠️ Eggs are okay"],
  },
  {
    name: "Quinoa Buddha Bowl",
    description: "Quinoa, mixed greens, avocado, chickpeas, tahini dressing",
    healthScore: 7,
    recommendation: "Good option! Ask to substitute quinoa with extra vegetables.",
    reasons: ["✅ Mixed greens", "✅ Avocado", "✅ Tahini", "⚠️ Quinoa (grain)", "⚠️ Chickpeas (legumes)"],
  },
]

export function MenuScanner({ isOpen, onClose }: MenuScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanResult, setScanResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, isScanning])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }

      setHasPermission(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasPermission(false)
      toast.error("Camera access denied. Please enable camera permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const handleScanMenu = async () => {
    setIsAnalyzing(true)

    // Simulate menu analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock result - randomly select a menu item
    const randomItem = mockMenuItems[Math.floor(Math.random() * mockMenuItems.length)]
    setScanResult(randomItem)
    setIsAnalyzing(false)
    setIsScanning(false)
    stopCamera()
  }

  const handleStartScan = () => {
    setIsScanning(true)
    setScanResult(null)
  }

  const handleClose = () => {
    stopCamera()
    setIsScanning(false)
    setScanResult(null)
    setHasPermission(null)
    onClose()
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 6) return <AlertCircle className="w-5 h-5 text-yellow-600" />
    return <AlertCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Menu Scan
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {!isScanning && !scanResult && (
            <div className="text-center space-y-4">
              <div className="text-6xl">📱</div>
              <div>
                <h3 className="font-semibold mb-2">Scan a Menu</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Point your camera at a restaurant menu to get personalized healthy recommendations.
                </p>
                <Button onClick={handleStartScan} className="bg-green-600 hover:bg-green-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            </div>
          )}

          {isScanning && !isAnalyzing && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                <div className="absolute inset-0 border-2 border-green-500 border-dashed rounded-lg flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    Position menu in frame
                  </div>
                </div>
              </div>

              {hasPermission === false && (
                <div className="text-center text-red-600 text-sm">
                  Camera access denied. Please enable camera permissions and try again.
                </div>
              )}

              <div className="flex space-x-2">
                <Button onClick={handleScanMenu} className="flex-1 bg-green-600 hover:bg-green-700">
                  Analyze Menu
                </Button>
                <Button onClick={() => setIsScanning(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
              <div>
                <h3 className="font-semibold mb-2">Analyzing Menu...</h3>
                <p className="text-sm text-gray-600">
                  Reading menu items and checking against your dietary preferences.
                </p>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="space-y-4">
              <Card className="border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{scanResult.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{scanResult.description}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {getScoreIcon(scanResult.healthScore)}
                      <span className={`font-bold ${getScoreColor(scanResult.healthScore)}`}>
                        {scanResult.healthScore}/10
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <h4 className="font-medium text-blue-800 mb-1">💡 Recommendation</h4>
                    <p className="text-sm text-blue-700">{scanResult.recommendation}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Analysis:</h4>
                    <div className="space-y-1">
                      {scanResult.reasons.map((reason: string, index: number) => (
                        <div key={index} className="text-sm flex items-start gap-2">
                          <span className="mt-0.5">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-2">
                <Button onClick={handleStartScan} variant="outline" className="flex-1">
                  Scan Another
                </Button>
                <Button onClick={handleClose} className="flex-1 bg-green-600 hover:bg-green-700">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
