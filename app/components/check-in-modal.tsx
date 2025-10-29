"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface CheckInModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckInModal({ isOpen, onClose }: CheckInModalProps) {
  const [checkInData, setCheckInData] = useState({
    energy: [3],
    stress: [3],
    bloating: [2],
    anxiety: [2],
    mood: "😊",
    notes: "",
  })

  const energyLabels = ["😴", "😐", "🙂", "😊", "🌟"]
  const stressLabels = ["😌", "🙂", "😐", "😰", "🤯"]
  const moodEmojis = ["😢", "😕", "😐", "😊", "😄"]

  const handleSave = () => {
    // Mock save functionality with all data
    console.log("Saving check-in:", checkInData)
    toast.success("Thanks for checking in! 🌟")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">How are you feeling?</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">🌤️ Energy Level</label>
              <span className="text-2xl">{energyLabels[checkInData.energy[0] - 1]}</span>
            </div>
            <Slider
              value={checkInData.energy}
              onValueChange={(value) => setCheckInData((prev) => ({ ...prev, energy: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">⚡ Stress Level</label>
              <span className="text-2xl">{stressLabels[checkInData.stress[0] - 1]}</span>
            </div>
            <Slider
              value={checkInData.stress}
              onValueChange={(value) => setCheckInData((prev) => ({ ...prev, stress: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">🤰 Bloating Level</label>
              <span className="text-lg">{checkInData.bloating[0]}/5</span>
            </div>
            <Slider
              value={checkInData.bloating}
              onValueChange={(value) => setCheckInData((prev) => ({ ...prev, bloating: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>None</span>
              <span>Severe</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">😰 Anxiety Level</label>
              <span className="text-lg">{checkInData.anxiety[0]}/5</span>
            </div>
            <Slider
              value={checkInData.anxiety}
              onValueChange={(value) => setCheckInData((prev) => ({ ...prev, anxiety: value }))}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Calm</span>
              <span>Very Anxious</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">😊 Overall Mood</label>
            <div className="flex justify-between">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setCheckInData((prev) => ({ ...prev, mood: emoji }))}
                  className={`text-3xl p-2 rounded-lg transition-colors ${
                    checkInData.mood === emoji ? "bg-green-100 scale-110" : "hover:bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">💭 Notes (Optional)</label>
            <Textarea
              value={checkInData.notes}
              onChange={(e) => setCheckInData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="How are you feeling? Any observations..."
              className="resize-none"
              rows={3}
            />
          </div>

          <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
            Save Check-in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
