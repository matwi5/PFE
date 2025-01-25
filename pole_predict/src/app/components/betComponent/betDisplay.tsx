// PredictionDisplay.tsx
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Users, TrendingUp } from 'lucide-react'

interface Prediction {
  id: string
  userId: string
  username: string
  pole: string
  winner: string
  fastestLap: string
  points: number
}

interface PredictionDisplayProps {
  predictions: Prediction[]
  trends: {
    pole: string
    winner: string
    fastestLap: string
  }
}

export default function PredictionDisplay({ predictions, trends }: PredictionDisplayProps) {
  return (
    <>
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
            <div className="text-2xl font-bold">{trends.pole}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendance du vainqueur</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trends.winner}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Prédictions pour la session actuelle</CardTitle>
          <CardDescription>Voici les prédictions des utilisateurs pour la session en cours.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Pole Position</TableHead>
                <TableHead>Vainqueur</TableHead>
                <TableHead>Tour le plus rapide</TableHead>
                <TableHead>Points misés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction.id}>
                  <TableCell>{prediction.username}</TableCell>
                  <TableCell>{prediction.pole}</TableCell>
                  <TableCell>{prediction.winner}</TableCell>
                  <TableCell>{prediction.fastestLap}</TableCell>
                  <TableCell>{prediction.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}