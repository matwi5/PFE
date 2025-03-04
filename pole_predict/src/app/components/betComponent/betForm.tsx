import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

interface PredictionFormProps {
  drivers: string[]
  userPoints: number | null
  hasPredicted: boolean
  onSubmit: (prediction: PredictionData) => Promise<void>
}

interface PredictionData {
  pole: string
  winner: string
  fastestLap: string
  points: number
}

export default function PredictionForm({ drivers, userPoints, hasPredicted, onSubmit }: PredictionFormProps) {
  const [newPrediction, setNewPrediction] = React.useState<PredictionData>({
    pole: "",
    winner: "",
    fastestLap: "",
    points: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userPoints) return
    
    if (newPrediction.points < 1 || newPrediction.points > userPoints) {
      toast({
        title: "Error",
        description: `You must bet between 1 and ${userPoints} points.`,
        variant: "destructive",
      })
      return
    }

    await onSubmit(newPrediction)
    setNewPrediction({ pole: "", winner: "", fastestLap: "", points: 1 })
    window.location.reload();
  }

  return (
    <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
          Make Your Prediction
        </CardTitle>
        <CardDescription className="text-gray-400">
          Fill out the form to submit your prediction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasPredicted ? (
          <p className="text-center text-red-500">
            You have already submitted a prediction for this session.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pole" className="text-[#5382ec]">Pole Position</Label>
                <Select
                  value={newPrediction.pole}
                  onValueChange={(value) => setNewPrediction({ ...newPrediction, pole: value })}
                >
                  <SelectTrigger id="pole" className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282a2c] border-gray-700">
                    {drivers.map((driver) => (
                      <SelectItem 
                        key={driver} 
                        value={driver}
                        className="text-white hover:bg-[#383a3c] focus:bg-[#383a3c] focus:text-white"
                      >
                        {driver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="winner" className="text-[#5382ec]">Winner</Label>
                <Select
                  value={newPrediction.winner}
                  onValueChange={(value) => setNewPrediction({ ...newPrediction, winner: value })}
                >
                  <SelectTrigger id="winner" className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282a2c] border-gray-700">
                    {drivers.map((driver) => (
                      <SelectItem 
                        key={driver} 
                        value={driver}
                        className="text-white hover:bg-[#383a3c] focus:bg-[#383a3c] focus:text-white"
                      >
                        {driver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fastestLap" className="text-[#5382ec]">Fastest Lap</Label>
                <Select
                  value={newPrediction.fastestLap}
                  onValueChange={(value) => setNewPrediction({ ...newPrediction, fastestLap: value })}
                >
                  <SelectTrigger id="fastestLap" className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282a2c] border-gray-700">
                    {drivers.map((driver) => (
                      <SelectItem 
                        key={driver} 
                        value={driver}
                        className="text-white hover:bg-[#383a3c] focus:bg-[#383a3c] focus:text-white"
                      >
                        {driver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="points" className="text-[#5382ec]">
                  Points to Bet (max: {userPoints})
                </Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  max={userPoints || 0}
                  value={newPrediction.points}
                  onChange={(e) => setNewPrediction({ ...newPrediction, points: parseInt(e.target.value) })}
                  required
                  className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white hover:opacity-90 transition-opacity"
            >
              Submit Prediction
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}