"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/firebaseConfig'
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Prediction {
  id: string
  pole: string
  winner: string
  fastestLap: string
  meetingName: string
  sessionName: string
  createdAt: Date
}

export default function UserPredictionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        await fetchUserPredictions(user.uid)
      } else {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchUserPredictions = async (userId: string) => {
    try {
      const predictionsQuery = query(
        collection(db, 'predictions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(predictionsQuery)
      const fetchedPredictions = await Promise.all(querySnapshot.docs.map(async (predictionDoc) => {
        const predictionData = predictionDoc.data()
        const meetingDoc = await getDoc(doc(db, 'meetings', predictionData.meetingId))
        const sessionDoc = await getDoc(doc(db, 'sessions', predictionData.sessionId))
        return {
          id: predictionDoc.id,
          pole: predictionData.pole,
          winner: predictionData.winner,
          fastestLap: predictionData.fastestLap,
          meetingName: meetingDoc.data()?.meeting_name || 'Unknown Meeting',
          sessionName: sessionDoc.data()?.session_name || 'Unknown Session',
          createdAt: predictionData.createdAt.toDate()
        } as Prediction
      }))
      setPredictions(fetchedPredictions)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching user predictions:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Mes Prédictions</CardTitle>
          <CardDescription>Historique de toutes vos prédictions</CardDescription>
        </CardHeader>
        <CardContent>
          {predictions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grand Prix</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Pole Position</TableHead>
                  <TableHead>Vainqueur</TableHead>
                  <TableHead>Tour le plus rapide</TableHead>
                  <TableHead>Date de prédiction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((prediction) => (
                  <TableRow key={prediction.id}>
                    <TableCell>{prediction.meetingName}</TableCell>
                    <TableCell>{prediction.sessionName}</TableCell>
                    <TableCell>{prediction.pole}</TableCell>
                    <TableCell>{prediction.winner}</TableCell>
                    <TableCell>{prediction.fastestLap}</TableCell>
                    <TableCell>{prediction.createdAt.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4">Vous n'avez pas encore fait de prédictions.</p>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 text-center">
        <Button onClick={() => router.push('/prediction')}>Faire une nouvelle prédiction</Button>
      </div>
    </div>
  )
}