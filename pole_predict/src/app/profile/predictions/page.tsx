"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/firebaseConfig'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from 'lucide-react'

interface Prediction {
  id: string
  grandPrix: string
  pole: string
  winner: string
  fastestLap: string
  createdAt: Date
  results?: {
    pole: string
    winner: string
    fastestLap: string
  }
}

export default function UserPredictionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
        fetchPredictions(user.uid)
      } else {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchPredictions = async (userId: string) => {
    const predictionsCollection = collection(db, 'predictions')
    const q = query(
      predictionsCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const querySnapshot = await getDocs(q)
    const fetchedPredictions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as Prediction))
    setPredictions(fetchedPredictions)
    setLoading(false)
  }

  const isPredictionCorrect = (prediction: string, result: string) => {
    return prediction.toLowerCase() === result.toLowerCase()
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Vos prédictions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Historique de vos prédictions</CardTitle>
          <CardDescription>Voici toutes vos prédictions et leurs résultats.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grand Prix</TableHead>
                <TableHead>Pole Position</TableHead>
                <TableHead>Vainqueur</TableHead>
                <TableHead>Tour le plus rapide</TableHead>
                <TableHead>Date de prédiction</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction.id}>
                  <TableCell>{prediction.grandPrix}</TableCell>
                  <TableCell>
                    {prediction.pole}
                    {prediction.results && (
                      isPredictionCorrect(prediction.pole, prediction.results.pole) 
                        ? <CheckCircle2 className="inline-block ml-2 text-green-500" size={16} />
                        : <XCircle className="inline-block ml-2 text-red-500" size={16} />
                    )}
                  </TableCell>
                  <TableCell>
                    {prediction.winner}
                    {prediction.results && (
                      isPredictionCorrect(prediction.winner, prediction.results.winner)
                        ? <CheckCircle2 className="inline-block ml-2 text-green-500" size={16} />
                        : <XCircle className="inline-block ml-2 text-red-500" size={16} />
                    )}
                  </TableCell>
                  <TableCell>
                    {prediction.fastestLap}
                    {prediction.results && (
                      isPredictionCorrect(prediction.fastestLap, prediction.results.fastestLap)
                        ? <CheckCircle2 className="inline-block ml-2 text-green-500" size={16} />
                        : <XCircle className="inline-block ml-2 text-red-500" size={16} />
                    )}
                  </TableCell>
                  <TableCell>{prediction.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    {prediction.results ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Terminé
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        En attente
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}