"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../../firebaseConfig'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "lucide-react"

// Interface pour la structure d'un badge
interface UserBadge {
  name: string
  description: string
  obtainedAt: Date
  type: string
}

// Mise à jour de l'interface UserProfile
interface UserProfile {
  username: string
  email: string
  avatarUrl: string
  phone: string
  points: number
  favoriteDriver: string
  badges: UserBadge[]
}

// Composant pour afficher un badge individuel
const BadgeCard = ({ badge }: { badge: UserBadge }) => {
  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <div className="flex items-center space-x-2">
          <Badge className="h-6 w-6 text-blue-500" />
          <CardTitle className="text-lg">{badge.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-400">{badge.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          Obtenu le : {new Date(badge.obtainedAt).toLocaleDateString()}
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
          // Récupérer les données du profil
          const profileData = docSnap.data()
          
          // Convertir les timestamps en Date pour les badges
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
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  if (!user || !profile) {
    return <div className="flex justify-center items-center h-screen">Utilisateur non trouvé</div>
  }

  const handleEditClick = () => {
    router.push(`profile/edit`)
  }

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
          
          {/* Section des badges */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Mes badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.badges?.map((badge, index) => (
                <BadgeCard key={index} badge={badge} />
              ))}
            </div>
            {(!profile.badges || profile.badges.length === 0) && (
              <p className="text-center text-gray-500">Aucun badge pour le moment</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={handleEditClick}>
            Modifier le profil
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}