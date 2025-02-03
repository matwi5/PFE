import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Clock, Activity, TrendingUp, Brain, Users, Trophy, Layout,
  Timer, ChevronRight, LineChart, Car, Medal, Database
} from 'lucide-react';

const FeatureSection = ({ title, description, features, image, reverse = false, gradient = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center mb-16`}
  >
    <div className="flex-1">
      <div className={`p-6 rounded-xl border border-gray-800 bg-[#282a2c] 
        ${gradient ? 'bg-gradient-to-r from-[#5382ec]/10 to-[#2dd4bf]/10' : ''}`}>
        <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-gray-300 mb-6">{description}</p>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${gradient ? 'bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]' : 'bg-[#1d1f20]'}`}>
                <feature.icon className={`w-5 h-5 ${gradient ? 'text-white' : 'text-[#5382ec]'}`} />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="flex-1">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
        <img 
          src={image} 
          alt={title}
          className="relative w-full rounded-lg shadow-2xl border border-gray-800"
        />
      </div>
    </div>
  </motion.div>
);

const FeaturesWidget = () => {
  const mainSections = [
    {
      title: "Past Races Analysis",
      description: "Dive deep into historical Formula 1 race data with comprehensive analysis tools and interactive visualizations.",
      features: [
        {
          icon: Clock,
          title: "Race Timeline",
          description: "Explore lap-by-lap race progression, pit stops, and key events from past races."
        },
        {
          icon: LineChart,
          title: "Performance Analysis",
          description: "Compare driver and team performances across different seasons and circuits."
        },
        {
          icon: Car,
          title: "Strategy Insights",
          description: "Understand tire strategies, fuel management, and racing lines used in previous races."
        }
      ],
      image: "/api/placeholder/600/400"
    },
    {
      title: "Live Race Experience",
      description: "Experience Formula 1 races in real-time with our advanced tracking and visualization system.",
      features: [
        {
          icon: Activity,
          title: "Real-time Telemetry",
          description: "Monitor live car data including speed, throttle, brake, and DRS usage."
        },
        {
          icon: Layout,
          title: "Customizable Dashboard",
          description: "Create your perfect viewing experience by arranging and selecting different data widgets."
        },
        {
          icon: Timer,
          title: "Sector Times",
          description: "Track live sector times, gaps, and position changes during the race."
        }
      ],
      image: "/api/placeholder/600/400",
      reverse: true
    },
    {
      title: "Upcoming Race Predictions",
      description: "Get ahead of the race weekend with detailed previews and AI-powered predictions.",
      features: [
        {
          icon: Database,
          title: "Circuit Information",
          description: "Access detailed track layouts, DRS zones, and historical race statistics."
        },
        {
          icon: Brain,
          title: "Strategy Predictions",
          description: "AI-generated insights on potential race strategies and pit stop windows."
        },
        {
          icon: Medal,
          title: "Performance Forecasts",
          description: "Predicted qualifying and race performance based on practice session data."
        }
      ],
      image: "/api/placeholder/600/400"
    }
  ];

  const aiSection = {
    title: "AI-Powered Race Predictions",
    description: "Our advanced artificial intelligence system processes real-time race data to provide accurate predictions and insights.",
    features: [
      {
        icon: Brain,
        title: "Lap Time Predictions",
        description: "AI predicts upcoming lap times based on current race conditions and historical data."
      },
      {
        icon: Timer,
        title: "Tire Strategy Analysis",
        description: "Forecast tire degradation and optimal pit stop windows for each driver."
      },
      {
        icon: LineChart,
        title: "Race Position Projections",
        description: "Predict final race positions and potential overtaking opportunities."
      }
    ],
    image: "/api/placeholder/600/400",
    gradient: true,
    reverse: false
  };

  const socialSection = {
    title: "Social Features & Rewards",
    description: "Join a community of F1 enthusiasts and compete with your predictions.",
    features: [
      {
        icon: Trophy,
        title: "VerstaCoins System",
        description: "Earn points for accurate predictions and climb the global leaderboard."
      },
      {
        icon: Users,
        title: "Community Engagement",
        description: "Share insights, discuss strategies, and compare predictions with other fans."
      },
      {
        icon: Medal,
        title: "Achievement Badges",
        description: "Unlock special badges for consistent accuracy and participation milestones."
      }
    ],
    image: "/api/placeholder/600/400",
    reverse: true
  };

  return (
    <div className="w-full bg-[#1B1C1D] py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent mb-6">
          Experience Formula 1 Like Never Before
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto text-lg">
          Immerse yourself in the world of Formula 1 with our comprehensive platform featuring real-time data, AI-powered predictions, and interactive analysis tools.
        </p>
      </motion.div>

      <FeatureSection {...aiSection} reverse={false} />
      
      {mainSections.map((section, index) => (
        <FeatureSection key={index} {...section} reverse={index % 2 === 0} />
      ))}
      
      <FeatureSection {...socialSection} reverse={mainSections.length % 2 === 0} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <h3 className="text-2xl font-semibold mb-4 text-white">Ready to enhance your F1 experience?</h3>
        <p className="text-gray-400 mb-8">
          Create an account to start making predictions and earning rewards.
        </p>
        <Link href="/login">
          <button className="px-8 py-3 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] rounded-lg text-white font-medium hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default FeaturesWidget;