"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/firebaseConfig'
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import Typewriter from 'typewriter-effect'

interface Prediction {
  id: string
  pole: string
  winner: string
  fastestLap: string
  meetingName: string
  sessionName: string
  createdAt: Date
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
          <History className="w-24 h-24 mb-8 text-[#5382ec]" />
        </motion.div>

        <motion.h1
          className="text-4xl h-20 md:text-6xl font-bold mb-12 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center"
          variants={itemVariants}
        >
          <Typewriter
            options={{
              strings: [
                "My Predictions",
                "Prediction History",
                "Past Bets",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </motion.h1>

        <motion.div className="w-full max-w-6xl" variants={itemVariants}>
          <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                Predictions History
              </CardTitle>
              <CardDescription className="text-gray-400">
                View all your past predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length > 0 ? (
                <div className="rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-800">
                        <TableHead className="text-[#5382ec]">Grand Prix</TableHead>
                        <TableHead className="text-[#5382ec]">Session</TableHead>
                        <TableHead className="text-[#5382ec]">Pole Position</TableHead>
                        <TableHead className="text-[#5382ec]">Winner</TableHead>
                        <TableHead className="text-[#5382ec]">Fastest Lap</TableHead>
                        <TableHead className="text-[#5382ec]">Prediction Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {predictions.map((prediction) => (
                        <TableRow 
                          key={prediction.id}
                          className="border-b border-gray-800 hover:bg-[#282a2c] transition-colors"
                        >
                          <TableCell className="text-white">{prediction.meetingName}</TableCell>
                          <TableCell className="text-gray-300">{prediction.sessionName}</TableCell>
                          <TableCell className="text-gray-300">{prediction.pole}</TableCell>
                          <TableCell className="text-gray-300">{prediction.winner}</TableCell>
                          <TableCell className="text-gray-300">{prediction.fastestLap}</TableCell>
                          <TableCell className="text-[#2dd4bf]">
                            {prediction.createdAt.toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400">You haven't made any predictions yet.</p>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button 
              onClick={() => router.push('/prediction')}
              className="bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white hover:opacity-90 transition-opacity"
            >
              Make a New Prediction
            </Button>
          </div>
        </motion.div>
      </motion.main>
    </motion.div>
  )
}