"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X, Shield, Zap, Settings } from "lucide-react"
import { toast } from "sonner"

interface IntegrationSetupProps {
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
  onComplete: (integrationId: string) => void
}

export function IntegrationSetup({ integration, isOpen, onClose, onComplete }: IntegrationSetupProps) {
  const [step, setStep] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })

  const totalSteps = integration.connected ? 2 : 4
  const progress = (step / totalSteps) * 100

  const getSetupSteps = () => {
    if (integration.connected) {
      return [
        { title: "Manage Connection", icon: Settings },
        { title: "Disconnect", icon: X },
      ]
    }

    return [
      { title: "Authorization", icon: Shield },
      { title: "Permissions", icon: Check },
      { title: "Configuration", icon: Settings },
      { title: "Complete", icon: Zap },
    ]
  }

  const handleConnect = async () => {
    setIsConnecting(true)

    // Simulate connection process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      toast.success(`${integration.name} connected successfully!`)
      onComplete(integration.id)
    }

    setIsConnecting(false)
  }

  const handleDisconnect = async () => {
    setIsConnecting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    toast.success(`${integration.name} disconnected`)
    onComplete(integration.id)
    setIsConnecting(false)
  }

  const renderKrogerSetup = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={`w-16 h-16 ${integration.color} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4`}
          >
            {integration.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">Authorize with Kroger</h3>
          <p className="text-gray-600">
            Securely authorize the app to manage your grocery orders with Kroger.
          </p>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">OAuth 2.0 Secure Authorization</p>
                <p className="text-sm text-blue-600">
                  You will be redirected to Kroger to sign in and authorize the app.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={async () => {
            setIsConnecting(true)
            try {
              // Get OAuth URL from MCP server
              const response = await fetch(`http://localhost:3001/auth/kroger?userId=demo-user-123`)
              const data = await response.json()
              
              if (data.success && data.authUrl) {
                // Open Kroger OAuth in new window
                window.open(data.authUrl, 'kroger-oauth', 'width=600,height=700')
                toast.success("Please complete authorization in the new window")
                
                // Listen for OAuth completion (simplified for demo)
                setTimeout(() => {
                  toast.success("Kroger authorization successful!")
                  onComplete(integration.id)
                  setIsConnecting(false)
                }, 5000)
              } else {
                throw new Error('Failed to get OAuth URL')
              }
            } catch (error) {
              toast.error("Authorization failed. Please try again.")
              setIsConnecting(false)
            }
          }}
          className="w-full"
          disabled={isConnecting}
        >
          {isConnecting ? "Authorizing..." : "Authorize with Kroger"}
        </Button>

        <p className="text-sm text-center text-gray-500 mt-2">
          By connecting, you agree to the app's Terms of Service and Privacy Policy.
        </p>
      </div>
    );
  }

  const renderStepContent = () => {
    // Special handling for Kroger
    if (integration.id === 'kroger' && !integration.connected) {
      return renderKrogerSetup();
    }
    
    if (integration.connected) {
      if (step === 1) {
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`w-16 h-16 ${integration.color} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4`}
              >
                {integration.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{integration.name}</h3>
              <p className="text-gray-600">This integration is currently active and syncing data.</p>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Connected & Syncing</p>
                    <p className="text-sm text-green-600">Last sync: 2 minutes ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-medium">Data Being Synced:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Daily activity and steps</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Heart rate measurements</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Sleep patterns and quality</span>
                </li>
              </ul>
            </div>

            <Button onClick={() => setStep(2)} variant="destructive" className="w-full">
              Disconnect Integration
            </Button>
          </div>
        )
      } else {
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl">⚠️</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Disconnect {integration.name}?</h3>
              <p className="text-gray-600 mb-4">
                This will stop syncing data from {integration.name}. You can reconnect at any time.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleDisconnect} variant="destructive" className="flex-1" disabled={isConnecting}>
                {isConnecting ? "Disconnecting..." : "Disconnect"}
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
              <div
                className={`w-16 h-16 ${integration.color} rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4`}
              >
                {integration.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect {integration.name}</h3>
              <p className="text-gray-600">{integration.description}</p>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Secure Connection</p>
                    <p className="text-sm text-blue-600">Your data is encrypted and never shared without permission.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username or Email</Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <Button
              onClick={handleConnect}
              className="w-full"
              disabled={isConnecting || !credentials.username || !credentials.password}
            >
              {isConnecting ? "Connecting..." : "Connect Account"}
            </Button>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Grant Permissions</h3>
              <p className="text-gray-600">Allow access to sync your health data</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Requested Permissions:</h4>
              <div className="space-y-2">
                {["Read activity data", "Access heart rate", "View sleep patterns", "Sync workout history"].map(
                  (permission, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <Button onClick={handleConnect} className="w-full" disabled={isConnecting}>
              {isConnecting ? "Granting Access..." : "Grant Permissions"}
            </Button>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Settings className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Configure Sync</h3>
              <p className="text-gray-600">Choose what data to sync and how often</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Sync Frequency:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {["Real-time", "Hourly", "Daily"].map((freq) => (
                    <Button key={freq} variant="outline" size="sm" className="text-xs">
                      {freq}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Data Types:</h4>
                <div className="space-y-2">
                  {["Steps & Activity", "Heart Rate", "Sleep Data", "Workouts"].map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{type}</span>
                      <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleConnect} className="w-full" disabled={isConnecting}>
              {isConnecting ? "Configuring..." : "Save Configuration"}
            </Button>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
              <p className="text-gray-600 mb-4">{integration.name} is now connected and syncing your data.</p>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-green-800">Sync Started</p>
                    <p className="text-sm text-green-600">Your data will appear in the app within a few minutes.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleConnect} className="w-full">
              Complete Setup
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const steps = getSetupSteps()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{integration.name} Setup</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Step {step} of {totalSteps}
              </span>
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
