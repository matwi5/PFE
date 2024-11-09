"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, TrendingUp } from 'lucide-react'

// Données factices
const fakePredictions = [
  { id: 1, user: "JohnF1", pole: "Max Verstappen", winner: "Lewis Hamilton", fastestLap: "Charles Leclerc" },
  { id: 2, user: "MariaRacer", pole: "Charles Leclerc", winner: "Max Verstappen", fastestLap: "Lando Norris" },
  { id: 3, user: "F1Fanatic", pole: "Lewis Hamilton", winner: "Max Verstappen", fastestLap: "Max Verstappen" },
]

const drivers = [
  "Max Verstappen", "Lewis Hamilton", "Charles Leclerc", "Lando Norris", "Sergio Perez",
  "Carlos Sainz", "Fernando Alonso", "George Russell", "Valtteri Bottas", "Pierre Gasly"
]

export default function PredictionPage() {
  const [predictions, setPredictions] = useState(fakePredictions)
  const [newPrediction, setNewPrediction] = useState({ user: "", pole: "", winner: "", fastestLap: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPredictions([...predictions, { id: predictions.length + 1, ...newPrediction }])
    setNewPrediction({ user: "", pole: "", winner: "", fastestLap: "" })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Prédictions pour le Grand Prix de Monaco</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des prédictions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favori pour la pole</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Max Verstappen</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendance du vainqueur</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Lewis Hamilton</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Prédictions actuelles</CardTitle>
          <CardDescription>Voici les prédictions des utilisateurs pour la prochaine course.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Pole Position</TableHead>
                <TableHead>Vainqueur</TableHead>
                <TableHead>Tour le plus rapide</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction.id}>
                  <TableCell>{prediction.user}</TableCell>
                  <TableCell>{prediction.pole}</TableCell>
                  <TableCell>{prediction.winner}</TableCell>
                  <TableCell>{prediction.fastestLap}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faites votre prédiction</CardTitle>
          <CardDescription>Remplissez le formulaire pour ajouter votre prédiction.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user">Nom d&apos;utilisateur</Label>
                <Input
                  id="user"
                  value={newPrediction.user}
                  onChange={(e) => setNewPrediction({ ...newPrediction, user: e.target.value })}
                  required
                />
              </div>
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
            </div>
            <Button type="submit" className="w-full">Soumettre la prédiction</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}