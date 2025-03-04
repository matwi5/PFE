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
        <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Predictions</CardTitle>
            <Users className="h-4 w-4 text-[#5382ec]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2dd4bf]">{predictions.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pole Position Favorite</CardTitle>
            <Trophy className="h-4 w-4 text-[#5382ec]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2dd4bf]">{trends.pole}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Winner Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#5382ec]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2dd4bf]">{trends.winner}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1d1f20] border-gray-800 hover:border-[#5382ec] transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
            Current Session Predictions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Here are the user predictions for the current session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-800">
                  <TableHead className="text-[#5382ec]">User</TableHead>
                  <TableHead className="text-[#5382ec]">Pole Position</TableHead>
                  <TableHead className="text-[#5382ec]">Winner</TableHead>
                  <TableHead className="text-[#5382ec]">Fastest Lap</TableHead>
                  <TableHead className="text-[#5382ec]">Points Bet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictions.map((prediction) => (
                  <TableRow 
                    key={prediction.id}
                    className="border-b border-gray-800 hover:bg-[#282a2c] transition-colors"
                  >
                    <TableCell className="text-white">{prediction.username}</TableCell>
                    <TableCell className="text-gray-300">{prediction.pole}</TableCell>
                    <TableCell className="text-gray-300">{prediction.winner}</TableCell>
                    <TableCell className="text-gray-300">{prediction.fastestLap}</TableCell>
                    <TableCell className="text-[#2dd4bf] font-medium">{prediction.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}