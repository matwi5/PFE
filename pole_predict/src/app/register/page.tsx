"use client";

import { useState } from "react";
import { auth, db, googleProvider } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Typewriter from "typewriter-effect";

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

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [favoriteDriver, setFavoriteDriver] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const handleMouseMove = (e) => {
    const cardRect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    });
    setIsHovering(true);
  };

  const createWelcomeBadge = () => {
    return {
      name: "Badge de Bienvenue",
      description: "Bienvenue dans la communauté F1 !",
      obtainedAt: new Date(),
      type: "welcome"
    };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const userDocRef = doc(db, "users", email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setError("Cet utilisateur existe déjà.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const welcomeBadge = createWelcomeBadge();

      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        phone: phone,
        points: 100,
        favoriteDriver: favoriteDriver,
        createdAt: new Date(),
        badges: [welcomeBadge],
      });

      await sendEmailVerification(user);
      setMessage("Un e-mail de vérification a été envoyé. Veuillez vérifier votre boîte de réception.");

      setTimeout(() => router.push("/login"), 5000);
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      setError("Erreur lors de l'inscription, veuillez réessayer.");
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setMessage("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const welcomeBadge = createWelcomeBadge();
        
        await setDoc(userDocRef, {
          username: user.displayName,
          email: user.email,
          favoriteDriver: favoriteDriver,
          phone: "",
          points: 100,
          createdAt: new Date(),
          badges: [welcomeBadge],
        });
      }

      router.push("/");
    } catch (error) {
      console.error("Erreur lors de l'inscription avec Google :", error);
      setError("Échec de l'inscription avec Google. Veuillez réessayer.");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#1B1C1D] text-white py-24 px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.main 
        className="flex flex-col items-center justify-center h-full"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <UserPlus 
            className="w-24 h-24 mb-8 text-[#5382ec]"
          />
        </motion.div>

        <motion.h1
          className="text-4xl h-20 md:text-6xl font-bold mb-8 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center"
          variants={itemVariants}
        >
          <Typewriter
            options={{
              strings: [
                "Rejoignez-nous",
                "Créez votre compte",
                "Bienvenue",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </motion.h1>

        <motion.div
          className="w-full max-w-md"
          variants={itemVariants}
        >
          <Card
            className="relative transition-all duration-300 bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsHovering(false)}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                S'inscrire
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Créez votre compte pour accéder à toutes les fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500 text-red-500">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {message && (
                <Alert variant="default" className="mb-4 bg-green-500/10 border-green-500 text-green-500">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-200">Nom d'utilisateur</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Entrez votre nom d'utilisateur"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="pl-10 bg-[#1d1f20] border-gray-700 focus:border-[#5382ec] text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">Adresse e-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-[#1d1f20] border-gray-700 focus:border-[#5382ec] text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-200">Numéro de téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Entrez votre numéro de téléphone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="pl-10 bg-[#1d1f20] border-gray-700 focus:border-[#5382ec] text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 bg-[#1d1f20] border-gray-700 focus:border-[#5382ec] text-white"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full relative group"
                    style={{
                      background: 'linear-gradient(to right, #5382ec, #2dd4bf)',
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> S'inscrire
                  </Button>

                  <Button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="w-full bg-[#1d1f20] border border-gray-700 hover:border-[#5382ec] hover:bg-[#282a2c] text-white"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    S'inscrire avec Google
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center w-full text-gray-400">
                Vous avez déjà un compte ?{' '}
                <Link 
                  href="/login" 
                  className="text-[#5382ec] hover:text-[#2dd4bf] transition-colors"
                >
                  Connectez-vous
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.main>
    </motion.div>
  );
};

export default RegisterForm;