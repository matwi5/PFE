"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../../firebaseConfig'
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, TrendingUp } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface Prediction {
  id: string
  userId: string
  pole: string
  winner: string
  fastestLap: string
}

const drivers = [
  "Max Verstappen", "Lewis Hamilton", "Charles Leclerc", "Lando Norris", "Sergio Perez",
  "Carlos Sainz", "Fernando Alonso", "George Russell", "Valtteri Bottas", "Pierre Gasly"
]

export default function PredictionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [newPrediction, setNewPrediction] = useState({ pole: "", winner: "", fastestLap: "" })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const fetchPredictions = async () => {
      const predictionsCollection = collection(db, 'predictions')
      const q = query(predictionsCollection, orderBy('createdAt', 'desc'), limit(10))
      const querySnapshot = await getDocs(q)
      const fetchedPredictions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Prediction))
      setPredictions(fetchedPredictions)
      setLoading(false)
    }

    fetchPredictions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const docRef = await addDoc(collection(db, 'predictions'), {
        userId: user.uid,
        ...newPrediction,
        createdAt: new Date()
      })
      
      setPredictions([{
        id: docRef.id,
        userId: user.uid,
        ...newPrediction
      }, ...predictions])
      
      setNewPrediction({ pole: "", winner: "", fastestLap: "" })
      toast({
        title: "Prédiction soumise",
        description: "Votre prédiction a été enregistrée avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de l'ajout de la prédiction:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre prédiction.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
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
            <div className="text-2xl font-bold">{predictions[0]?.pole || "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendance du vainqueur</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions[0]?.winner || "N/A"}</div>
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
                <TableHead>Pole Position</TableHead>
                <TableHead>Vainqueur</TableHead>
                <TableHead>Tour le plus rapide</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction.id}>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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