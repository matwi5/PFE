"use client";

import { useState } from "react";
import { auth, db, googleProvider } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, GlobeLockIcon } from "lucide-react";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  /* eslint-disable */
  const [favoriteDriver, setFavoriteDriver] = useState("");
  /* eslint-enable */
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
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

      // Save user information to Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        phone: phone,
        points: 100,
        favoriteDriver:favoriteDriver,
        createdAt: new Date(),
      });

      // Send verification email
      await sendEmailVerification(user);
      setMessage("Un e-mail de vérification a été envoyé. Veuillez vérifier votre boîte de réception.");

      // Redirect after a few seconds
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

      // Check if user already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // If the user is new, add them to Firestore
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          username: user.displayName,
          email: user.email,
          favoriteDriver: favoriteDriver,
          phone: "", // Optional: ask for phone after Google sign-up
          points: 100,
          createdAt: new Date(),
        });
      }

      // Redirect to dashboard or any other page after sign-up
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de l'inscription avec Google :", error);
      setError("Échec de l'inscription avec Google. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-6 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">S&apos;inscrire</CardTitle>
          <CardDescription className="text-center">
            Créez votre compte pour accéder à toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert variant="default" className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleRegister}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Entrez votre numéro de téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6 bg-red-600 hover:bg-red-700">
              <UserPlus className="mr-2 h-4 w-4" /> S&apos;inscrire
            </Button>
          </form>
          <Button onClick={handleGoogleSignUp} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            <GlobeLockIcon className="mr-2 h-4 w-4" /> S&apos;inscrire avec Google
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-center w-full">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-red-600 hover:underline">
              Connectez-vous
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterForm;
