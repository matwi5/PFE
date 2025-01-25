"use client"

import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LapTimesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Lap Times Analysis</h1>

      <Card className="mb-8 bg-[#282a2c] border-none">
        <CardHeader>
          <CardTitle className="text-white">Configuration</CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Select a session and driver to view lap times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            <div className="w-64">
              
            </div>

            {selectedSession && (
              <div className="w-64">
                
              </div>
            )}
          </div>
        </CardContent>
      </Card>      
    </div>
  );
}