"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X, ShoppingCart, ExternalLink, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface KrogerIntegrationProps {
  integration: {
    id: string
    name: string
    description: string
    icon: string
    connected: boolean
    color: string
  }
  isOpen: boolean
  onClose: () => void
  onComplete: (integrationId: string, connected: boolean) => void
}

const MCP_SERVER_URL = "http://localhost:3001"

export function KrogerIntegration({ integration, isOpen, onClose, onComplete }: KrogerIntegrationProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [authUrl, setAuthUrl] = useState("")
  const [isConnected, setIsConnected] = useState(integration.connected)
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState("")

  // Generate a unique user ID (in production, this would come from your auth system)
  const userId = "user-" + Date.now()

  const totalSteps = isConnected ? 2 : 4
  const progress = (step / totalSteps) * 100

  const steps = isConnected 
    ? [
        { title: "Manage", icon: ShoppingCart },
        { title: "Disconnect", icon: X },
      ]
    : [
        { title: "Authorize", icon: ExternalLink },
        { title: "Verify", icon: Check },
        { title: "Setup Stores", icon: ShoppingCart },
        { title: "Complete", icon: Check },
      ]

  // Initialize Kroger OAuth flow
  const handleStartAuth = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch(`${MCP_SERVER_URL}/auth/kroger?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Failed to start OAuth flow")
      }
      
      const data = await response.json()
      setAuthUrl(data.authUrl)
      setStep(2)
      
      // Open Kroger OAuth page in a new tab
      window.open(data.authUrl, '_blank', 'width=600,height=700')
      
      toast.success("Redirecting to Kroger authentication...")
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to start authentication")
    } finally {
      setIsLoading(false)
    }
  }

  // Check if OAuth was completed (simulate polling)
  const checkAuthStatus = async () => {
    setIsLoading(true)
    
    try {
      // In a real implementation, you'd check if the user completed OAuth
      // For now, simulate successful auth after user confirms
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStep(3)
      toast.success("Kroger account connected successfully!")
    } catch (err: any) {
      setError("Authentication failed. Please try again.")
      toast.error("Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Setup store preferences
  const handleStoreSetup = async () => {
    setIsLoading(true)
    
    try {
      // Fetch nearby stores
      const response = await fetch(`${MCP_SERVER_URL}/api/stores?userId=${userId}&lat=30.2672&lon=-97.7431`)
      if (!response.ok) {
        throw new Error("Failed to fetch stores")
      }
      
      const data = await response.json()
      setUserData({ stores: data.stores })
      setStep(4)
      
      toast.success("Store preferences configured!")
    } catch (err: any) {
      setError(err.message)
      toast.error("Failed to setup stores")
    } finally {
      setIsLoading(false)
    }
  }

  // Complete setup
  const handleComplete = () => {
    setIsConnected(true)
    onComplete(integration.id, true)
    toast.success("Kroger integration complete!")
  }

  // Disconnect integration
  const handleDisconnect = async () => {
    setIsLoading(true)
    
    try {
      // In production, you'd call the MCP server to revoke tokens
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsConnected(false)
      onComplete(integration.id, false)
      toast.success("Kroger disconnected successfully")
    } catch (err: any) {
      toast.error("Failed to disconnect")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    if (isConnected) {
      if (step === 1) {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                🏪
              </div>
              <h3 className="text-xl font-semibold mb-2">Kroger Connected</h3>
              <p className="text-gray-600">Your Kroger account is active and ready for grocery orders.</p>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Connected & Ready</p>
                    <p className="text-sm text-green-600">Grocery orders will be sent to your Kroger cart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-medium">Available Features:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Automatic grocery list generation from meal plans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Direct add-to-cart for Kroger pickup/delivery</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Store location and preferences management</span>
                </li>
              </ul>
            </div>

            <Button onClick={() => setStep(2)} variant="destructive" className="w-full">
              Disconnect Kroger
            </Button>
          </div>
        )
      } else {
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl">⚠️</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Disconnect Kroger?</h3>
              <p className="text-gray-600 mb-4">
                This will remove your Kroger account connection. You can reconnect at any time.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleDisconnect} variant="destructive" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </Button>
            </div>
          </div>
        )
      }
    }

    // New connection flow
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                🏪
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Kroger</h3>
              <p className="text-gray-600">Link your Kroger account to enable automatic grocery ordering from meal plans.</p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <ShoppingCart className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Seamless Grocery Integration</p>
                    <p className="text-sm text-blue-600">Your meal plans will automatically generate shopping lists and add items to your Kroger cart.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Error</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleStartAuth} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect with Kroger
                </>
              )}
            </Button>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ExternalLink className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Authorization</h3>
              <p className="text-gray-600">Sign in to your Kroger account in the popup window, then click "I've Signed In" below.</p>
            </div>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Popup Blocked?</p>
                    <p className="text-sm text-yellow-600">
                      If the Kroger login didn't open, 
                      <a href={authUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                        click here to open it manually
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={checkAuthStatus} className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "I've Signed In"
                )}
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Choose Your Store</h3>
              <p className="text-gray-600">Select your preferred Kroger location for pickup and delivery</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Nearby Kroger Stores:</h4>
              <div className="space-y-2">
                {[
                  { name: "Kroger Pharmacy", address: "123 Main St, Austin, TX", distance: "2.1 miles" },
                  { name: "Kroger Marketplace", address: "456 Oak Ave, Austin, TX", distance: "3.5 miles" }
                ].map((store, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{store.name}</p>
                      <p className="text-sm text-gray-600">{store.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">{store.distance}</p>
                      <Button size="sm" variant="outline">Select</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleStoreSetup} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Continue with First Store"
              )}
            </Button>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Kroger Connected!</h3>
              <p className="text-gray-600 mb-4">Your Kroger account is now linked and ready for grocery ordering.</p>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-green-800">Integration Active</p>
                    <p className="text-sm text-green-600">Meal plans will now generate Kroger grocery orders automatically</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleComplete} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Complete Setup
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Kroger Integration</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between">
            {steps.map((stepInfo, index) => {
              const StepIcon = stepInfo.icon
              const isActive = index + 1 === step
              const isCompleted = index + 1 < step

              return (
                <div key={index} className="flex flex-col items-center space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-gray-600 text-center">{stepInfo.title}</span>
                </div>
              )
            })}
          </div>

          {/* Step content */}
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
