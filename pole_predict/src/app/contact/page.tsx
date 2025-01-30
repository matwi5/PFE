"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react';
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

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cardRect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top,
    });
    setIsHovering(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          to: 'mathis.baudrillard@gmail.com'
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
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
          <Mail 
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
                "Get in Touch",
                "Contact Us",
                "Send us a Message",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </motion.h1>
      </motion.main>

      <motion.div
        className="max-w-2xl mx-auto mt-12"
        variants={itemVariants}
      >
        <Card
          className="relative transition-all duration-300 bg-[#282a2c] border border-gray-800 hover:border-[#5382ec] overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsHovering(false)}
        >
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
              Contact Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-[#1d1f20] border-gray-700 focus:border-[#5382ec] text-white"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#1d1f20] border-gray-700 focus:border-[#5382ec] text-white"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Subject</label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="bg-[#1d1f20] border-gray-700 focus:border-[#5382ec] text-white"
                  placeholder="Message subject"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full min-h-[150px] rounded-md border border-gray-700 bg-[#1d1f20] px-3 py-2 text-white focus:outline-none focus:border-[#5382ec] transition-colors"
                  placeholder="Your message..."
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={status === 'sending'}
                  className="relative group"
                  style={{
                    background: status === 'success' ? '#10B981' : status === 'error' ? '#EF4444' : 'linear-gradient(to right, #5382ec, #2dd4bf)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {status === 'sending' ? (
                    <>Sending...</>
                  ) : status === 'success' ? (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Sent Successfully</>
                  ) : status === 'error' ? (
                    <><XCircle className="mr-2 h-4 w-4" /> Error Sending</>
                  ) : (
                    <>Send Message <Send className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}