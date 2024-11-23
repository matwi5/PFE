"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../../firebaseConfig'
import { collection, addDoc, getDocs, query, orderBy, limit, where, doc, getDoc, updateDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Trophy, Users, TrendingUp } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface Prediction {
  id: string
  userId: string
  username: string
  pole: string
  winner: string
  fastestLap: string
  meetingId: string
  sessionId: string
  points: number
}

export default function PredictionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [hasPredicted, setHasPredicted] = useState(false)
  const [latestSession, setLatestSession] = useState<any>(null)
  const [latestMeeting, setLatestMeeting] = useState<any>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [newPrediction, setNewPrediction] = useState({ pole: "", winner: "", fastestLap: "", points: 1 })
  const [loading, setLoading] = useState(true)
  const [drivers, setDrivers] = useState<string[]>([])
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [trends, setTrends] = useState({
    pole: "N/A",
    winner: "N/A",
    fastestLap: "N/A",
  })
  
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        await fetchDrivers()
        await fetchLatestMeeting()
        await fetchLatestSession()
        await fetchUserPoints(user.uid)
      } else {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (latestSession?.id && user) {
      fetchPredictions()
      checkUserPrediction(user.uid)
    }
  }, [latestSession, user])

  const fetchUserPoints = async (userId: string) => {
    try {
      const userDocRef = doc(db, "users", userId)
      const userDocSnap = await getDoc(userDocRef)
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        const points = userData.points || 0
        const name = userData.username || ""
        setUserPoints(points)
        setUserName(name)
      } else {
        console.log("Aucun document utilisateur trouvé")
        setUserPoints(0)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des points de l'utilisateur:", error)
      setUserPoints(0)
    }
  }

  const fetchDrivers = async () => {
    const driversCollection = collection(db, "drivers")
    const driverDocs = await getDocs(driversCollection)
    const driverNames = driverDocs.docs
      .map(doc => doc.data().full_name)
      .sort((a, b) => a.localeCompare(b))
    setDrivers(driverNames)
  }

  const fetchLatestSession = async () => {
    try {
      const sessionQuery = query(collection(db, "sessions"), orderBy("date_start", "desc"), limit(1))
      const sessionSnapshot = await getDocs(sessionQuery)
  
      if (!sessionSnapshot.empty) {
        const sessionDoc = sessionSnapshot.docs[0]
        setLatestSession({
          id: sessionDoc.id,
          ...sessionDoc.data(),
        })
      } else {
        console.error("Aucune session récente trouvée.")
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la session :", error)
    }
  }

  const fetchLatestMeeting = async () => {
    try {
      const meetingQuery = query(collection(db, "meetings"), orderBy("date_start", "desc"), limit(1))
      const meetingSnapshot = await getDocs(meetingQuery)
  
      if (!meetingSnapshot.empty) {
        const meetingDoc = meetingSnapshot.docs[0]
        setLatestMeeting({
          id: meetingDoc.id,
          ...meetingDoc.data(),
        })
      } else {
        console.error("Aucun meeting récent trouvé.")
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du meeting :", error)
    }
  }

  const calculateTrends = (predictions: Prediction[]) => {
    const trendCounts = {
      pole: {} as Record<string, number>,
      winner: {} as Record<string, number>,
      fastestLap: {} as Record<string, number>,
    }
  
    predictions.forEach(prediction => {
      trendCounts.pole[prediction.pole] = (trendCounts.pole[prediction.pole] || 0) + 1
      trendCounts.winner[prediction.winner] = (trendCounts.winner[prediction.winner] || 0) + 1
      trendCounts.fastestLap[prediction.fastestLap] = (trendCounts.fastestLap[prediction.fastestLap] || 0) + 1
    })
  
    const getMostFrequent = (counts: Record<string, number>) => {
      return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "")
    }
  
    setTrends({
      pole: getMostFrequent(trendCounts.pole) || "N/A",
      winner: getMostFrequent(trendCounts.winner) || "N/A",
      fastestLap: getMostFrequent(trendCounts.fastestLap) || "N/A",
    })
  }

  const checkUserPrediction = async (userId: string) => {
    if (!latestSession?.id) return
  
    const predictionsCollection = collection(db, 'predictions')
    const q = query(
      predictionsCollection,
      where("userId", "==", userId),
      where("sessionId", "==", latestSession.id)
    )
    const querySnapshot = await getDocs(q)
  
    setHasPredicted(!querySnapshot.empty)
  }

  const fetchPredictions = async () => {
    if (!latestSession?.id) return

    try {
      const predictionsCollection = collection(db, 'predictions')
      const q = query(
        predictionsCollection,
        where("sessionId", "==", latestSession.id),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const fetchedPredictions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Prediction))
      setPredictions(fetchedPredictions)
      setLoading(false)
      calculateTrends(fetchedPredictions)
    } catch (error) {
      console.error("Erreur lors de la récupération des prédictions:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les prédictions.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || userPoints === null) return

    if (!latestMeeting?.id || !latestSession?.id) {
      toast({
        title: "Erreur",
        description: "Meeting ou session non trouvés. Veuillez réessayer.",
        variant: "destructive",
      })
      return
    }

    if (newPrediction.points < 1 || newPrediction.points > userPoints) {
      toast({
        title: "Erreur",
        description: `Vous devez miser entre 1 et ${userPoints} points.`,
        variant: "destructive",
      })
      return
    }

    try {
      const predictionsCollection = collection(db, 'predictions')
      const docRef = await addDoc(predictionsCollection, {
        userId: user.uid,
        username: userName,
        meetingId: latestMeeting.id,
        sessionId: latestSession.id,
        ...newPrediction,
        createdAt: new Date(),
      })

      setPredictions([{
        id: docRef.id,
        userId: user.uid,
        username: userName,
        meetingId: latestMeeting.id,
        sessionId: latestSession.id,
        ...newPrediction,
      }, ...predictions])

      await updateUserPoints(user.uid, userPoints - newPrediction.points)

      setNewPrediction({ pole: "", winner: "", fastestLap: "", points: 1 })
      setHasPredicted(true)

      toast({
        title: "Prédiction soumise",
        description: `Votre prédiction a été enregistrée avec succès. Vous avez misé ${newPrediction.points} points.`,
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

  const updateUserPoints = async (userId: string, newPoints: number) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        points: newPoints
      })
      setUserPoints(newPoints)
    } catch (error) {
      console.error("Erreur lors de la mise à jour des points de l'utilisateur:", error)
    }
  }

  if (loading || userPoints === null) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Prédictions pour {latestMeeting?.meeting_name || "la prochaine course"} </h1>
      <h2 className="text-3xl font-bold mb-8 text-center"> Session : {latestSession?.session_name || "Unknown"}</h2>

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
            <div className="text-2xl font-bold">{trends.pole}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendance du vainqueur</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trends.winner}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Prédictions pour la session actuelle</CardTitle>
          <CardDescription>Voici les prédictions des utilisateurs pour {latestSession?.session_name || "la session en cours"}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Pole Position</TableHead>
                <TableHead>Vainqueur</TableHead>
                <TableHead>Tour le plus rapide</TableHead>
                <TableHead>Points misés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction.id}>
                  <TableCell>{prediction.username}</TableCell>
                  <TableCell>{prediction.pole}</TableCell>
                  <TableCell>{prediction.winner}</TableCell>
                  <TableCell>{prediction.fastestLap}</TableCell>
                  <TableCell>{prediction.points}</TableCell>
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
                  max={userPoints}
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
    </div>
  )
}