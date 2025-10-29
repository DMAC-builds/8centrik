"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User,
  Settings,
  Heart,
  Watch,
  Stethoscope,
  ShoppingCart,
  Check,
  Plus,
  ExternalLink,
  Activity,
  Moon,
  Zap,
} from "lucide-react"
import { IntegrationSetup } from "./integration-setup"
import { KrogerIntegration } from "./kroger-integration"

const mockUserData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  sex: "Female",
  height: "5'6\"",
  weight: "140 lbs",
  age: 32,
  joinDate: "March 2024",
}

const integrationCategories = {
  "Health Data": [
    {
      id: "apple-health",
      name: "Apple Health",
      description: "Sync health metrics, workouts, and vitals",
      icon: "🍎",
      connected: true,
      color: "bg-gray-900",
    },
    {
      id: "google-fit",
      name: "Google Fit",
      description: "Track activities and health measurements",
      icon: "🏃",
      connected: false,
      color: "bg-blue-500",
    },
    {
      id: "myfitnesspal",
      name: "MyFitnessPal",
      description: "Import nutrition and calorie data",
      icon: "📊",
      connected: false,
      color: "bg-blue-600",
    },
  ],
  Wearables: [
    {
      id: "fitbit",
      name: "Fitbit",
      description: "Sync steps, heart rate, and sleep data",
      icon: "⌚",
      connected: true,
      color: "bg-teal-500",
    },
    {
      id: "apple-watch",
      name: "Apple Watch",
      description: "Track workouts, vitals, and activity rings",
      icon: "⌚",
      connected: false,
      color: "bg-gray-800",
    },
    {
      id: "garmin",
      name: "Garmin",
      description: "Advanced fitness and health tracking",
      icon: "🏃",
      connected: false,
      color: "bg-blue-700",
    },
    {
      id: "oura",
      name: "Oura Ring",
      description: "Sleep, recovery, and readiness insights",
      icon: "💍",
      connected: false,
      color: "bg-gray-700",
    },
  ],
  Telemedicine: [
    {
      id: "teladoc",
      name: "Teladoc",
      description: "Virtual consultations and health records",
      icon: "🩺",
      connected: false,
      color: "bg-purple-600",
    },
    {
      id: "mdlive",
      name: "MDLive",
      description: "Online doctor visits and prescriptions",
      icon: "👨‍⚕️",
      connected: false,
      color: "bg-green-600",
    },
    {
      id: "amwell",
      name: "Amwell",
      description: "Telehealth appointments and care plans",
      icon: "💊",
      connected: false,
      color: "bg-blue-500",
    },
  ],
  Groceries: [
    {
      id: "instacart",
      name: "Instacart",
      description: "Automated grocery delivery from meal plans",
      icon: "🛒",
      connected: true,
      color: "bg-green-500",
    },
    {
      id: "amazon-fresh",
      name: "Amazon Fresh",
      description: "Fresh groceries delivered to your door",
      icon: "📦",
      connected: false,
      color: "bg-orange-500",
    },
    {
      id: "whole-foods",
      name: "Whole Foods",
      description: "Organic and natural food delivery",
      icon: "🥬",
      connected: false,
      color: "bg-green-700",
    },
    {
      id: "kroger",
      name: "Kroger",
      description: "Grocery pickup and delivery service",
      icon: "🏪",
      connected: false,
      color: "bg-blue-600",
    },
  ],
}

export function Profile() {
  const [activeTab, setActiveTab] = useState("profile")
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [showSetup, setShowSetup] = useState(false)

  const handleIntegrationClick = (integration: any) => {
    setSelectedIntegration(integration)
    setShowSetup(true)
  }

  const handleSetupComplete = (integrationId: string, connected?: boolean) => {
    // Update the integration status in the local state
    if (integrationId === 'kroger' && connected !== undefined) {
      // Update Kroger connection status
      integrationCategories.Groceries.find(int => int.id === 'kroger')!.connected = connected
    }
    console.log(`Integration ${integrationId} setup completed`)
    setShowSetup(false)
    setSelectedIntegration(null)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Health Data":
        return <Heart className="w-5 h-5" />
      case "Wearables":
        return <Watch className="w-5 h-5" />
      case "Telemedicine":
        return <Stethoscope className="w-5 h-5" />
      case "Groceries":
        return <ShoppingCart className="w-5 h-5" />
      default:
        return <Settings className="w-5 h-5" />
    }
  }

  return (
    <div className="p-4 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* User Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-green-100 text-green-700 text-xl font-semibold">
                    {mockUserData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{mockUserData.name}</CardTitle>
                  <p className="text-gray-600">{mockUserData.email}</p>
                  <p className="text-sm text-gray-500">Member since {mockUserData.joinDate}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Sex</label>
                  <p className="text-lg">{mockUserData.sex}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <p className="text-lg">{mockUserData.age} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Height</label>
                  <p className="text-lg">{mockUserData.height}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Weight</label>
                  <p className="text-lg">{mockUserData.weight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Health Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Activity className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Steps Today</p>
                    <p className="text-xl font-bold text-blue-800">8,247</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Heart className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Avg Heart Rate</p>
                    <p className="text-xl font-bold text-green-800">72 bpm</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <Moon className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Sleep Score</p>
                    <p className="text-xl font-bold text-purple-800">85/100</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Zap className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Energy Level</p>
                    <p className="text-xl font-bold text-orange-800">4.2/5</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Integrations</h2>
            <p className="text-gray-600">Connect your favorite health and wellness apps</p>
          </div>

          {Object.entries(integrationCategories).map(([category, integrations]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getCategoryIcon(category)}
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleIntegrationClick(integration)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 ${integration.color} rounded-lg flex items-center justify-center text-white text-lg`}
                        >
                          {integration.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {integration.connected ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            <Check className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <Plus className="w-3 h-3 mr-1" />
                            Connect
                          </Badge>
                        )}
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Integration Setup Modal */}
      {showSetup && selectedIntegration && (
        selectedIntegration.id === 'kroger' ? (
          <KrogerIntegration
            integration={selectedIntegration}
            isOpen={showSetup}
            onClose={() => setShowSetup(false)}
            onComplete={handleSetupComplete}
          />
        ) : (
          <IntegrationSetup
            integration={selectedIntegration}
            isOpen={showSetup}
            onClose={() => setShowSetup(false)}
            onComplete={handleSetupComplete}
          />
        )
      )}
    </div>
  )
}
