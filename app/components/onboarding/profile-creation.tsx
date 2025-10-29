"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Camera } from "lucide-react"

interface ProfileCreationProps {
  onComplete: (data: any) => void
}

export function ProfileCreation({ onComplete }: ProfileCreationProps) {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    occupation: "",
    photo: null as File | null,
    privacy: {
      keepPrivate: false,
      improveExperience: false,
      shareAnonymized: false,
    },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfile((prev) => ({ ...prev, photo: file }))
    }
  }

  const handlePrivacyChange = (key: string, checked: boolean) => {
    setProfile((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: checked },
    }))
  }

  const handleContinue = () => {
    onComplete({ profile })
  }

  const isValid = profile.firstName && profile.lastName && profile.age && profile.gender

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Let's Get Started</CardTitle>
          <p className="text-gray-600">This is your health journey. We personalize it based on your preferences.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div className="text-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            >
              {profile.photo ? (
                <img
                  src={URL.createObjectURL(profile.photo) || "/placeholder.svg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Add Photo</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <p className="text-xs text-gray-500 mt-2">Optional: Upload a selfie</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile((prev) => ({ ...prev, age: e.target.value }))}
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={profile.gender}
                onValueChange={(value) => setProfile((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={profile.occupation}
              onChange={(e) => setProfile((prev) => ({ ...prev, occupation: e.target.value }))}
              placeholder="Software Engineer"
            />
          </div>

          {/* Privacy Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Privacy Preferences</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keepPrivate"
                  checked={profile.privacy.keepPrivate}
                  onCheckedChange={(checked) => handlePrivacyChange("keepPrivate", checked as boolean)}
                />
                <Label htmlFor="keepPrivate" className="text-sm">
                  Keep my data private
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="improveExperience"
                  checked={profile.privacy.improveExperience}
                  onCheckedChange={(checked) => handlePrivacyChange("improveExperience", checked as boolean)}
                />
                <Label htmlFor="improveExperience" className="text-sm">
                  Use my data to improve my app experience
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shareAnonymized"
                  checked={profile.privacy.shareAnonymized}
                  onCheckedChange={(checked) => handlePrivacyChange("shareAnonymized", checked as boolean)}
                />
                <Label htmlFor="shareAnonymized" className="text-sm">
                  Share anonymized data with partners to tailor offers
                </Label>
              </div>
            </div>
          </div>

          <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-700" disabled={!isValid}>
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
