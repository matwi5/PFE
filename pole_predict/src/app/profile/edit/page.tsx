"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../../../firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import Typewriter from "typewriter-effect"

interface UserProfile {
  username: string
  email: string
  avatarUrl: string
  phone: string
  points: number
  favoriteDriver: string
}

interface Driver {
  driver_number: number
  full_name: string
  headshot_url: string
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

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        const docRef = doc(db, "users", user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile)
        }
        await fetchDrivers()
      } else {
        router.push('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchDrivers = async () => {
    try {
      const response = await fetch('https://api.openf1.org/v1/drivers?session_key=latest')
      const data = await response.json()
      
      // Typer les données avant le filtrage et le tri
      const typedData = data as Driver[]
      
      // Filtrer les pilotes qui ont une headshot_url et enlever les doublons
      const uniqueDrivers = Array.from(new Map(
        typedData
          .filter((driver) => driver.headshot_url)
          .map((driver) => [driver.driver_number, driver])
      ).values()) as Driver[]
      
      // Trier par numéro de pilote
      const sortedDrivers = uniqueDrivers.sort((a, b) => 
        a.driver_number - b.driver_number
      )
      
      setDrivers(sortedDrivers)
    } catch (error) {
      console.error("Erreur lors de la récupération des pilotes:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des pilotes.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setSaving(true)
    try {
      const docRef = doc(db, "users", user.uid)
      await updateDoc(docRef, {
        username: profile.username,
        phone: profile.phone,
        favoriteDriver: profile.favoriteDriver
      })
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées avec succès.",
      })
      router.push('/profile')
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

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
          <Settings className="w-16 h-16 md:w-24 md:h-24 mb-6 md:mb-8 text-[#5382ec]" />
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl lg:text-6xl font-bold mb-8 md:mb-12 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center h-16 md:h-20"
          variants={itemVariants}
        >
          <Typewriter
            options={{
              strings: [
                "Edit Profile",
                "Update Your Details",
                "Customize Profile",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </motion.h1>

        <motion.div className="w-full max-w-2xl px-4 md:px-0" variants={itemVariants}>
          <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
            <form onSubmit={handleSubmit}>
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
                      Edit Profile
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm md:text-base">
                      {profile.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="username" className="text-[#5382ec] text-sm md:text-base">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    required
                    className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0 h-9 md:h-10 text-sm md:text-base"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="phone" className="text-[#5382ec] text-sm md:text-base">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    required
                    className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0 h-9 md:h-10 text-sm md:text-base"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="points" className="text-[#5382ec] text-sm md:text-base">
                    VerstaCoins
                  </Label>
                  <Input
                    id="points"
                    value={profile.points}
                    readOnly
                    className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0 h-9 md:h-10 text-sm md:text-base"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="favoriteDriver" className="text-[#5382ec] text-sm md:text-base">
                    Favorite Driver
                  </Label>
                  <Select
                    value={profile.favoriteDriver}
                    onValueChange={(value) => setProfile({ ...profile, favoriteDriver: value })}
                  >
                    <SelectTrigger 
                      id="favoriteDriver"
                      className="bg-[#282a2c] border-gray-700 text-white focus:border-[#5382ec] focus:ring-0 h-9 md:h-10 text-sm md:text-base"
                    >
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#282a2c] border-gray-700">
                      {drivers.map((driver) => (
                        <SelectItem 
                          key={driver.driver_number} 
                          value={`${driver.full_name}`}
                          className="text-white hover:bg-[#383a3c] focus:bg-[#383a3c] focus:text-white text-sm md:text-base"
                        >
                          {driver.full_name} ({driver.driver_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>

              <CardFooter className="p-4 md:p-6">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] text-white hover:opacity-90 transition-opacity text-sm md:text-base py-2 md:py-2.5"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </motion.main>
    </motion.div>
  )
}