"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Flag, Users, Hash } from 'lucide-react'

interface Driver {
  broadcast_name: string
  country_code: string
  driver_number: number
  first_name: string
  full_name: string
  headshot_url: string
  last_name: string
  team_name: string
  team_colour: string
}

export default function DriverDetailPage() {
  const params = useParams()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const response = await fetch(`/api/drivers/${params.driverNumber}`)
        if (!response.ok) throw new Error('Failed to fetch driver data')
        const data = await response.json()
        setDriver(data.data)
      } catch (err) {
        setError('Unable to load driver data. Please try again later.')
        console.error('Error fetching driver:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDriver()
  }, [params.driverNumber])

  if (loading) {
    return <DriverSkeleton />
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (!driver) {
    return <div className="text-center">Driver not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
          <img
            src={driver.headshot_url}
            alt={driver.full_name}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-40 h-40 rounded-full border-4 border-white"
          />
        </div>
        <CardHeader className="pt-24 text-center">
          <CardTitle className="text-3xl font-bold">{driver.full_name}</CardTitle>
          <Badge 
            variant="outline" 
            className="mt-2"
            style={{backgroundColor: driver.team_colour, color: '#ffffff'}}
          >
            {driver.team_name}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <InfoCard icon={<Trophy className="w-5 h-5" />} title="Nom de diffusion" value={driver.broadcast_name} />
            <InfoCard icon={<Flag className="w-5 h-5" />} title="Pays" value={driver.country_code} />
            <InfoCard icon={<Users className="w-5 h-5" />} title="Équipe" value={driver.team_name} />
            <InfoCard icon={<Hash className="w-5 h-5" />} title="Numéro" value={driver.driver_number.toString()} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center p-4">
        {icon}
        <div className="ml-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function DriverSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gray-200">
          <Skeleton className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-40 h-40 rounded-full" />
        </div>
        <CardHeader className="pt-24 text-center">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-6 w-32 mx-auto mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center p-4">
                  <Skeleton className="w-5 h-5" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}