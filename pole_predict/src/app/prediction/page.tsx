"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../../firebaseConfig'
import { collection, addDoc, getDocs, query, orderBy, limit, where} from 'firebase/firestore'
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
  meeting_key: number
  session_key: number
}

export default function PredictionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [hasPredicted, setHasPredicted] = useState(false);
  const [latestSession, setLatestSession] = useState<any>(null);
  const [latestMeeting, setLatestMeeting] = useState<any>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [newPrediction, setNewPrediction] = useState({ pole: "", winner: "", fastestLap: "" })
  const [loading, setLoading] = useState(true)
  const [drivers, setDrivers] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        await fetchDrivers();
        await fetchLatestMeeting();
        await fetchLatestSession();
      } else {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

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
      const sessionQuery = query(collection(db, "sessions"), orderBy("date_start", "desc"), limit(1));
      const sessionSnapshot = await getDocs(sessionQuery);
  
      if (!sessionSnapshot.empty) {
        const sessionDoc = sessionSnapshot.docs[0];
        setLatestSession({
          id: sessionDoc.id,
          ...sessionDoc.data(), // Ajoute toutes les données du document
        });
      } else {
        console.error("Aucune session récente trouvée.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la session :", error);
    }
  };
  

  const fetchLatestMeeting = async () => {
    try {
      const meetingQuery = query(collection(db, "meetings"), orderBy("date_start", "desc"), limit(1));
      const meetingSnapshot = await getDocs(meetingQuery);
  
      if (!meetingSnapshot.empty) {
        const meetingDoc = meetingSnapshot.docs[0]; // Récupère le premier document
        setLatestMeeting({
          id: meetingDoc.id,
          ...meetingDoc.data(), // Ajoute toutes les données du document
        });
      } else {
        console.error("Aucun meeting récent trouvé.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du meeting :", error);
    }
  };
  

  

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
    
    fetchPredictions();
  }, []);

  useEffect(() => {
    const checkUserPrediction = async () => {
      if (!user || !latestSession?.id) return;
  
      const predictionsCollection = collection(db, 'predictions');
      const q = query(
        predictionsCollection,
        where("userId", "==", user.uid),
        where("sessionId", "==", latestSession.id)
      );
      const querySnapshot = await getDocs(q);
  
      setHasPredicted(!querySnapshot.empty);
    };
  
    checkUserPrediction();
  }, [user, latestSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
  
    if (!latestMeeting?.id || !latestSession?.id) {
      toast({
        title: "Erreur",
        description: "Meeting ou session non trouvés. Veuillez réessayer.",
        variant: "destructive",
      });
      return;
    }
  
    try {
      // Vérifiez si une prédiction existe déjà pour cet utilisateur et cette session
      const predictionsCollection = collection(db, 'predictions');
      const q = query(
        predictionsCollection,
        where("userId", "==", user.uid),
        where("sessionId", "==", latestSession.id)
      );
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        toast({
          title: "Prédiction existante",
          description: "Vous avez déjà soumis une prédiction pour cette session.",
          variant: "destructive",
        });
        return;
      }
  
      // Ajouter une nouvelle prédiction
      const docRef = await addDoc(predictionsCollection, {
        userId: user.uid,
        meetingId: latestMeeting.id, // Ajout de l'ID du meeting
        sessionId: latestSession.id, // Ajout de l'ID de la session
        ...newPrediction,
        createdAt: new Date(),
      });
  
      setPredictions([{
        id: docRef.id,
        userId: user.uid,
        meeting_key: latestMeeting.id,
        session_key: latestSession.id,
        ...newPrediction,
      }, ...predictions]);
  
      setNewPrediction({ pole: "", winner: "", fastestLap: "" });
  
      toast({
        title: "Prédiction soumise",
        description: "Votre prédiction a été enregistrée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la prédiction:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre prédiction.",
        variant: "destructive",
      });
    }
  };
  

  if (loading) {
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
          <CardDescription>Voici les dernières prédictions des utilisateurs pour la prochaine course.</CardDescription>
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
              {predictions.slice(0, 5).map((prediction) => (
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
        {hasPredicted ? (
      <p className="text-center text-red-500">
        Vous avez déjà soumis une prédiction pour cette session.
      </p>
    ) : (
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
    )}
        </CardContent>
      </Card>
    </div>
  )
}