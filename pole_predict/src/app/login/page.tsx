/* eslint-disable */
"use client";

import { useState } from "react";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Mail, Lock } from 'lucide-react';
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

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cardRect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    });
    setIsHovering(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user.uid);
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      setError("Incorrect email or password.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User logged in with Google:", result.user.uid);
      router.push("/");
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to login with Google. Please try again.");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[#1B1C1D] text-white py-12 px-4 md:py-24 md:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.main 
        className="flex flex-col items-center justify-center h-full"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Lock 
            className="w-16 h-16 md:w-24 md:h-24 mb-6 md:mb-8 text-[#5382ec]"
          />
        </motion.div>

        <motion.h1
          className="text-3xl md:text-4xl lg:text-6xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent text-center h-16 md:h-20"
          variants={itemVariants}
        >
          <Typewriter
            options={{
              strings: [
                "Welcome Back",
                "Sign In",
                "Access Your Account",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </motion.h1>

        <motion.div
          className="w-full max-w-md px-4 md:px-0"
          variants={itemVariants}
        >
          <Card
            className="relative transition-all duration-300 bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsHovering(false)}
          >
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-gray-400 text-sm md:text-base">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {error && (
                <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500 text-red-500 text-sm md:text-base">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="email" className="text-gray-200 text-sm md:text-base">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-[#1d1f20] border-gray-700 focus:border-[#5382ec] text-white text-sm md:text-base h-9 md:h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="password" className="text-gray-200 text-sm md:text-base">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 bg-[#1d1f20] border-gray-700 focus:border-[#5382ec] text-white text-sm md:text-base h-9 md:h-10"
                    />
                  </div>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <Button
                    type="submit"
                    className="w-full relative group text-sm md:text-base h-9 md:h-10"
                    style={{
                      background: 'linear-gradient(to right, #5382ec, #2dd4bf)',
                    }}
                  >
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </Button>

                  <Button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-[#1d1f20] border border-gray-700 hover:border-[#5382ec] hover:bg-[#282a2c] text-white text-sm md:text-base h-9 md:h-10"
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
                    Sign in with Google
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="p-4 md:p-6">
              <p className="text-center w-full text-gray-400 text-sm md:text-base">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-[#5382ec] hover:text-[#2dd4bf] transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.main>
    </motion.div>
  );
};

export default LoginForm;