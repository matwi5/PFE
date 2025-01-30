"use client"

import React, { useState, useEffect } from 'react'
import { auth, db } from '../../firebaseConfig'
import { collection, addDoc, getDocs, query, orderBy, limit, where, doc, getDoc, updateDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import PredictionForm from '../components/betComponent/betForm'
import PredictionDisplay from '../components/betComponent/betDisplay'
import router from 'next/router'
import { motion } from 'framer-motion'
import { Trophy, AlertCircle } from 'lucide-react'
import Typewriter from "typewriter-effect"

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export default function PredictionPage() {

  const [user, setUser] = useState<User | null>(null)
const [hasPredicted, setHasPredicted] = useState(false)
const [latestSession, setLatestSession] = useState<any>(null)
const [latestMeeting, setLatestMeeting] = useState<any>(null)
const [predictions, setPredictions] = useState<Prediction[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [drivers, setDrivers] = useState<string[]>([])
const [userPoints, setUserPoints] = useState<number | null>(null)
const [userName, setUserName] = useState<string>("")
const [trends, setTrends] = useState({
  pole: "N/A",
  winner: "N/A",
  fastestLap: "N/A",
})

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    try {
      if (user) {
        setUser(user)
        await Promise.all([
          fetchDrivers(),
          fetchLatestMeeting(),
          fetchLatestSession(),
          fetchUserPoints(user.uid)
        ])
        setLoading(false)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error("Erreur lors du chargement initial:", error)
      setError("Une erreur est survenue lors du chargement des données")
      setLoading(false)
    }
  })

  return () => unsubscribe()
}, [router])

useEffect(() => {
  const loadPredictions = async () => {
    try {
      if (latestSession?.id && user) {
        await fetchPredictions()
        await checkUserPrediction(user.uid)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des prédictions:", error)
      setError("Erreur lors du chargement des prédictions")
    }
  }

  loadPredictions()
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
    throw new Error("Impossible de récupérer les points de l'utilisateur")
  }
}

const fetchDrivers = async () => {
  try {
    const driversCollection = collection(db, "drivers")
    const driverDocs = await getDocs(driversCollection)
    const driverNames = driverDocs.docs
      .map(doc => doc.data().name)
      .sort((a, b) => a.localeCompare(b))
    setDrivers(driverNames)
  } catch (error) {
    throw new Error("Erreur lors de la récupération des pilotes")
  }
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
      throw new Error("Aucune session récente trouvée")
    }
  } catch (error) {
    throw new Error("Erreur lors de la récupération de la session")
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
      throw new Error("Aucun meeting récent trouvé")
    }
  } catch (error) {
    throw new Error("Erreur lors de la récupération du meeting")
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
  try {
    if (!latestSession?.id) return
  
    const predictionsCollection = collection(db, 'predictions')
    const q = query(
      predictionsCollection,
      where("userId", "==", userId),
      where("sessionId", "==", latestSession.id)
    )
    const querySnapshot = await getDocs(q)
  
    setHasPredicted(!querySnapshot.empty)
  } catch (error) {
    console.error("Erreur lors de la vérification des prédictions:", error)
    throw new Error("Impossible de vérifier les prédictions de l'utilisateur")
  }
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
    throw new Error("Impossible de récupérer les prédictions")
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
    throw new Error("Impossible de mettre à jour les points de l'utilisateur")
  }
}

const handleSubmitPrediction = async (predictionData: {
  pole: string
  winner: string
  fastestLap: string
  points: number
}) => {
  if (!user || userPoints === null) return

  if (hasPredicted) {
    toast({
      title: "Prédiction déjà soumise",
      description: "Vous avez déjà soumis une prédiction pour cette session.",
      variant: "destructive",
    })
    return
  }

  if (!latestMeeting?.id || !latestSession?.id) {
    toast({
      title: "Erreur",
      description: "Meeting ou session non trouvés. Veuillez réessayer.",
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
        ...predictionData,
        createdAt: new Date(),
      })

      setPredictions([{
        id: docRef.id,
        userId: user.uid,
        username: userName,
        meetingId: latestMeeting.id,
        sessionId: latestSession.id,
        ...predictionData,
      }, ...predictions])

      await updateUserPoints(user.uid, userPoints - predictionData.points)
      setHasPredicted(true)

      toast({
        title: "Prédiction soumise",
        description: `Votre prédiction a été enregistrée avec succès. Vous avez misé ${predictionData.points} points.`,
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#1B1C1D] flex flex-col justify-center items-center p-8">
        <AlertCircle className="w-24 h-24 text-red-500 mb-6" />
        <p className="text-red-500 text-xl mb-6">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B1C1D] flex justify-center items-center">
        <div className="text-[#5382ec] text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-[#1B1C1D] text-white py-24 px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.main 
        className="flex flex-col items-center justify-center"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Trophy className="w-24 h-24 mb-8 text-[#5382ec]" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <h1 className="text-4x h-20 md:text-6xl font-bold mb-8 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center">
            <Typewriter
              options={{
                strings: [
                  "Make Your Predictions",
                  "Win Points",
                  "Climb the Leaderboard",
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </h1>
        </motion.div>

        <motion.div 
          className="w-full max-w-6xl mx-auto space-y-12"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-[#5382ec]">
              {latestMeeting?.meeting_name || "Next Race"}
            </h2>
            <p className="text-xl text-[#2dd4bf]">
              Session: {latestSession?.session_name || "Unknown"}
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-[#282a2c] rounded-xl p-8 border border-gray-800"
          >
            <PredictionDisplay
              predictions={predictions}
              trends={trends}
            />
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-[#282a2c] rounded-xl p-8 border border-gray-800"
          >
            <PredictionForm
              drivers={drivers}
              userPoints={userPoints}
              hasPredicted={hasPredicted}
              onSubmit={handleSubmitPrediction}
            />
          </motion.div>
        </motion.div>
      </motion.main>
    </motion.div>
  )
}