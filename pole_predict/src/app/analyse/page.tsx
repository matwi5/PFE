'use client'

import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"


// Données des pilotes
const driversData = [
  { 
    full_name: "Lewis Hamilton", 
    team_name: "Mercedes", 
    wins: 103, 
    podiums: 191, 
    points: 4405.5,
    championships: 7
  },
  { 
    full_name: "Max Verstappen", 
    team_name: "Red Bull Racing", 
    wins: 43, 
    podiums: 87, 
    points: 2080.5,
    championships: 2
  },
  { 
    full_name: "Charles Leclerc", 
    team_name: "Ferrari", 
    wins: 5, 
    podiums: 26, 
    points: 914,
    championships: 0
  },
  { 
    full_name: "Sergio Perez", 
    team_name: "Red Bull Racing", 
    wins: 6, 
    podiums: 30, 
    points: 1256,
    championships: 0
  },
  { 
    full_name: "Carlos Sainz", 
    team_name: "Ferrari", 
    wins: 2, 
    podiums: 16, 
    points: 836.5,
    championships: 0
  },
  { 
    full_name: "George Russell", 
    team_name: "Mercedes", 
    wins: 1, 
    podiums: 9, 
    points: 333,
    championships: 0
  },
]

const AnalysisPage: React.FC = () => {
  const chartData = driversData.map(driver => ({
    name: driver.full_name,
    wins: driver.wins,
    podiums: driver.podiums
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Analyse des Pilotes F1</h1>
      
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Résumé</TabsTrigger>
          <TabsTrigger value="chart">Graphique</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Résumé des Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Statistiques des pilotes de Formule 1</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Équipe</TableHead>
                    <TableHead>Victoires</TableHead>
                    <TableHead>Podiums</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Championnats</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driversData.map((driver) => (
                    <TableRow key={driver.full_name}>
                      <TableCell className="font-medium">{driver.full_name}</TableCell>
                      <TableCell>{driver.team_name}</TableCell>
                      <TableCell>{driver.wins}</TableCell>
                      <TableCell>{driver.podiums}</TableCell>
                      <TableCell>{driver.points}</TableCell>
                      <TableCell>{driver.championships}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Graphique des Performances</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="wins" name="Victoires" fill="#ef4444" />
                  <Bar dataKey="podiums" name="Podiums" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Analyse Détaillée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                D&apos;après les données présentées, nous pouvons tirer plusieurs conclusions importantes :
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4">
                <li>
                  <strong>Domination de Lewis Hamilton :</strong> Avec 103 victoires, 191 podiums et 7 championnats, 
                  Hamilton se démarque clairement comme le pilote le plus accompli de ce groupe.
                </li>
                <li>
                  <strong>Montée en puissance de Max Verstappen :</strong> Bien que plus jeune, Verstappen montre déjà 
                  des statistiques impressionnantes avec 43 victoires et 2 championnats, suggérant un potentiel pour 
                  défier les records de Hamilton à l&apos;avenir.
                </li>
                <li>
                  <strong>Écart significatif :</strong> Il existe un écart notable entre les deux premiers pilotes 
                  (Hamilton et Verstappen) et le reste du groupe en termes de victoires et de podiums.
                </li>
                <li>
                  <strong>Potentiel des jeunes pilotes :</strong> Des pilotes comme Leclerc, Sainz et Russell montrent 
                  du potentiel avec leurs podiums et victoires, mais ont encore du chemin à parcourir pour atteindre 
                  le niveau des leaders.
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnalysisPage