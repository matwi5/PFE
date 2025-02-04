/* eslint-disable */
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

// Composant pour l'affichage mobile des prédictions
const MobilePredictionCard = ({ prediction }: { prediction: Prediction }) => {
  return (
    <Card className="mb-3 bg-[#282a2c] border-gray-800">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#5382ec] text-sm font-medium">Grand Prix</span>
            <span className="text-white text-sm">{prediction.meetingName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5382ec] text-sm font-medium">Session</span>
            <span className="text-gray-300 text-sm">{prediction.sessionName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5382ec] text-sm font-medium">Pole Position</span>
            <span className="text-gray-300 text-sm">{prediction.pole}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5382ec] text-sm font-medium">Winner</span>
            <span className="text-gray-300 text-sm">{prediction.winner}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5382ec] text-sm font-medium">Fastest Lap</span>
            <span className="text-gray-300 text-sm">{prediction.fastestLap}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5382ec] text-sm font-medium">Date</span>
            <span className="text-[#2dd4bf] text-sm">{prediction.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function UserPredictionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const predictionsPerPage = 10
  const router = useRouter()

  const indexOfLastPrediction = currentPage * predictionsPerPage
  const indexOfFirstPrediction = indexOfLastPrediction - predictionsPerPage
  const currentPredictions = predictions.slice(indexOfFirstPrediction, indexOfLastPrediction)
  const totalPages = Math.ceil(predictions.length / predictionsPerPage)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const PaginationControls = () => (
    <div className="flex items-center justify-center space-x-4 mt-6">
      <Button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className="bg-[#282a2c] hover:bg-[#323436] text-white disabled:opacity-50 text-sm md:text-base py-2 px-3 md:px-4"
      >
        Previous
      </Button>
      <span className="text-white text-sm md:text-base">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className="bg-[#282a2c] hover:bg-[#323436] text-white disabled:opacity-50 text-sm md:text-base py-2 px-3 md:px-4"
      >
        Next
      </Button>
    </div>
  )

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
        <div className="text-[#5382ec] text-xl md:text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-[#1B1C1D] text-white py-12 px-4 md:py-24 md:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.main 
        className="flex flex-col items-center justify-center"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <History className="w-16 h-16 md:w-24 md:h-24 mb-6 md:mb-8 text-[#5382ec]" />
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl lg:text-6xl font-bold mb-8 md:mb-12 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center h-16 md:h-20"
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

        <motion.div className="w-full max-w-6xl px-4 md:px-0" variants={itemVariants}>
          <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                Predictions History
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm md:text-base">
                View all your past predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {predictions.length > 0 ? (
                <>
                  {/* Vue mobile */}
                  <div className="md:hidden space-y-3">
                    {currentPredictions.map((prediction) => (
                      <MobilePredictionCard key={prediction.id} prediction={prediction} />
                    ))}
                  </div>

                  {/* Vue desktop */}
                  <div className="hidden md:block rounded-lg overflow-hidden">
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
                        {currentPredictions.map((prediction) => (
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
                  
                  {/* Pagination Controls */}
                  {predictions.length > predictionsPerPage && <PaginationControls />}
                </>
              ) : (
                <p className="text-center py-6 md:py-8 text-gray-400 text-sm md:text-base">
                  You haven&apos;t made any predictions yet.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 md:mt-8 text-center">
            <Button 
              onClick={() => router.push('/prediction')}
              className="bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white hover:opacity-90 transition-opacity text-sm md:text-base py-2 md:py-2.5"
            >
              Make a New Prediction
            </Button>
          </div>
        </motion.div>
      </motion.main>
    </motion.div>
  )
}