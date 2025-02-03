"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../../firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge as LucideBadge, User as UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import Typewriter from "typewriter-effect"

interface UserBadge {
  name: string
  description: string
  obtainedAt: Date
  type: string
}

interface UserProfile {
  username: string
  email: string
  avatarUrl: string
  phone: string
  points: number
  favoriteDriver: string
  badges: UserBadge[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3, delayChildren: 0.2 }
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

const BadgeCard = ({ badge }: { badge: UserBadge }) => {
  return (
    <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
      <CardHeader className="p-3 md:p-4">
        <div className="flex items-center space-x-2">
          <LucideBadge className="h-5 w-5 md:h-6 md:w-6 text-[#5382ec]" />
          <CardTitle className="text-base md:text-lg text-white">{badge.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-0">
        <p className="text-gray-300 text-sm md:text-base">{badge.description}</p>
        <p className="text-[#2dd4bf] mt-2 text-xs md:text-sm">
          Obtained on: {new Date(badge.obtainedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const profileData = docSnap.data()
          const badgesWithDates = profileData.badges?.map((badge: any) => ({
            ...badge,
            obtainedAt: badge.obtainedAt?.toDate() || new Date()
          })) || []
          
          setProfile({
            ...profileData,
            badges: badgesWithDates
          } as UserProfile)
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B1C1D] flex justify-center items-center">
        <div className="text-[#5382ec] text-xl md:text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#1B1C1D] flex justify-center items-center">
        <div className="text-red-500 text-base md:text-lg">User not found</div>
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
          <UserIcon className="w-16 h-16 md:w-24 md:h-24 mb-6 md:mb-8 text-[#5382ec]" />
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl lg:text-6xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center h-16 md:h-20"
          variants={itemVariants}
        >
          <Typewriter
            options={{
              strings: [
                "My Profile",
                `Welcome back, ${profile.username}`,
                "Your F1 Dashboard",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </motion.h1>

        <motion.div className="w-full max-w-2xl px-4 md:px-0" variants={itemVariants}>
          <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-3 md:space-y-0">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-[#5382ec]">
                  <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                  <AvatarFallback className="bg-[#282a2c] text-[#5382ec]">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                    {profile.username}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              <div>
                <Label htmlFor="phone" className="text-[#5382ec] text-sm md:text-base">Phone</Label>
                <Input 
                  id="phone" 
                  value={profile.phone} 
                  readOnly 
                  className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0 h-9 md:h-10 text-sm md:text-base"
                />
              </div>
              <div>
                <Label htmlFor="points" className="text-[#5382ec] text-sm md:text-base">VerstaCoins</Label>
                <Input 
                  id="points" 
                  value={profile.points} 
                  readOnly 
                  className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0 h-9 md:h-10 text-sm md:text-base"
                />
              </div>
              <div>
                <Label htmlFor="favoriteDriver" className="text-[#5382ec] text-sm md:text-base">Favorite Driver</Label>
                <Input 
                  id="favoriteDriver" 
                  value={profile.favoriteDriver} 
                  readOnly 
                  className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0 h-9 md:h-10 text-sm md:text-base"
                />
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                  My Badges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {profile.badges?.map((badge, index) => (
                    <BadgeCard key={index} badge={badge} />
                  ))}
                </div>
                {(!profile.badges || profile.badges.length === 0) && (
                  <p className="text-center text-gray-500 text-sm md:text-base">No badges yet</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-4 md:p-6">
              <Button 
                className="w-full bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white hover:opacity-90 transition-opacity text-sm md:text-base py-2 md:py-2.5"
                onClick={() => router.push('profile/edit')}
              >
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.main>
    </motion.div>
  )
}