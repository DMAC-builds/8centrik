"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Scale, ShoppingCart } from "lucide-react"

interface BodyProfileProps {
  onComplete: (data: any) => void
}

export function BodyProfile({ onComplete }: BodyProfileProps) {
  const [bodyData, setBodyData] = useState({
    weight: "",
    waist: "",
    chest: "",
    hips: "",
    photos: [] as File[],
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setBodyData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }))
  }

  const handleContinue = () => {
    onComplete({ bodyProfile: bodyData })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Body Profile</CardTitle>
          <p className="text-gray-600">Track your progress with baseline measurements</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual Measurements */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Measurements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={bodyData.weight}
                  onChange={(e) => setBodyData((prev) => ({ ...prev, weight: e.target.value }))}
                  placeholder="150"
                />
              </div>
              <div>
                <Label htmlFor="waist">Waist (in)</Label>
                <Input
                  id="waist"
                  type="number"
                  value={bodyData.waist}
                  onChange={(e) => setBodyData((prev) => ({ ...prev, waist: e.target.value }))}
                  placeholder="32"
                />
              </div>
              <div>
                <Label htmlFor="chest">Chest (in)</Label>
                <Input
                  id="chest"
                  type="number"
                  value={bodyData.chest}
                  onChange={(e) => setBodyData((prev) => ({ ...prev, chest: e.target.value }))}
                  placeholder="36"
                />
              </div>
              <div>
                <Label htmlFor="hips">Hips (in)</Label>
                <Input
                  id="hips"
                  type="number"
                  value={bodyData.hips}
                  onChange={(e) => setBodyData((prev) => ({ ...prev, hips: e.target.value }))}
                  placeholder="38"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">Progress Photos (Optional)</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload Day 1 photos</p>
              <p className="text-xs text-gray-500 mt-1">Front, side, back views recommended</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {bodyData.photos.length > 0 && (
              <p className="text-sm text-green-600">{bodyData.photos.length} photo(s) uploaded</p>
            )}
          </div>

          {/* Partner CTA */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Don't have a food or weight scale?</p>
                  <p className="text-sm text-blue-600">Get accurate measurements with professional tools</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-3 border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
              >
                Shop Tools at Discount – powered by Renpho
              </Button>
            </CardContent>
          </Card>

          <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-700">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
