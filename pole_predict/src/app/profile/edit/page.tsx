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
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  if (!user || !profile) {
    return <div className="flex justify-center items-center h-screen">Utilisateur non trouvé</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">Modifier le profil</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">VerstaCoins</Label>
              <Input id="points" value={profile.points} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favoriteDriver">Pilote favori</Label>
              <Select
                value={profile.favoriteDriver}
                onValueChange={(value) => setProfile({ ...profile, favoriteDriver: value })}
              >
                <SelectTrigger id="favoriteDriver">
                  <SelectValue placeholder="Sélectionnez un pilote" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem 
                      key={driver.driver_number} 
                      value={`${driver.full_name}`}
                    >
                      {driver.full_name} ({driver.driver_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}