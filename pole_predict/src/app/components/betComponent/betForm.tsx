// PredictionForm.tsx
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
        title: "Erreur",
        description: `Vous devez miser entre 1 et ${userPoints} points.`,
        variant: "destructive",
      })
      return
    }

    await onSubmit(newPrediction)
    setNewPrediction({ pole: "", winner: "", fastestLap: "", points: 1 })
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faites votre prédiction</CardTitle>
        <CardDescription>Remplissez le formulaire pour ajouter votre prédiction.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasPredicted ? (
          <p className="text-center text-red-500">
            Vous avez déjà soumis une prédiction pour cette session.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pole">Pole Position</Label>
                <Select
                  value={newPrediction.pole}
                  onValueChange={(value) => setNewPrediction({ ...newPrediction, pole: value })}
                >
                  <SelectTrigger id="pole">
                    <SelectValue placeholder="Sélectionnez un pilote" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver} value={driver}>
                        {driver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="winner">Vainqueur</Label>
                <Select
                  value={newPrediction.winner}
                  onValueChange={(value) => setNewPrediction({ ...newPrediction, winner: value })}
                >
                  <SelectTrigger id="winner">
                    <SelectValue placeholder="Sélectionnez un pilote" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver} value={driver}>
                        {driver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fastestLap">Tour le plus rapide</Label>
                <Select
                  value={newPrediction.fastestLap}
                  onValueChange={(value) => setNewPrediction({ ...newPrediction, fastestLap: value })}
                >
                  <SelectTrigger id="fastestLap">
                    <SelectValue placeholder="Sélectionnez un pilote" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver} value={driver}>
                        {driver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Points à miser (max: {userPoints})</Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  max={userPoints || 0}
                  value={newPrediction.points}
                  onChange={(e) => setNewPrediction({ ...newPrediction, points: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">Soumettre la prédiction</Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}