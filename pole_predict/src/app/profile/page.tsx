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

// velaur chercher dans la collection des users
interface UserProfile {
  username: string
  email: string
  avatarUrl: string
  phone : string
  points : number
  favoriteDriver: string
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
          setProfile(docSnap.data() as UserProfile)
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  if (!user || !profile) {
    return <div className="flex justify-center items-center h-screen">Utilisateur non trouvé</div>
  }

  const handleEditClick = () => {
    router.push(`profile/edit`); // Ajoute "/edit" à l'URL actuelle
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatarUrl} alt={profile.username} />
              <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.username}</CardTitle>
              <CardDescription>{profile.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" value={profile.phone} readOnly />
          </div>
          <div>
            <Label htmlFor="points">VerstaCoins</Label>
            <Input id="points" value={profile.points} readOnly />
          </div>
          <div>
            <Label htmlFor="favoriteDriver">Pilote favori</Label>
            <Input id="favoriteDriver" value={profile.favoriteDriver} readOnly />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleEditClick
            
          }>Modifier le profil</Button>
        </CardFooter>
      </Card>
    </div>
  )
}