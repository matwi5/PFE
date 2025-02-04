import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Car, 
  Flag, 
  Gauge, 
  Wrench,
  ChevronsRight, 
  Plus, 
  Minus,
  PieChart, 
  Map, 
  Activity 
} from 'lucide-react';

const GuideSection = ({ 
  title, description, points, image, Icon, isOpen, onToggle, index 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="w-full"
    >
      <div 
        className={`
          rounded-xl border border-gray-800 overflow-hidden transition-all duration-300
          ${isOpen ? 'bg-[#1d1f20]' : 'bg-[#282a2c] hover:bg-[#2a2c2e]'}
        `}
      >
        <button
          onClick={onToggle}
          className="w-full p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="text-gray-400 text-sm">{description}</p>
            </div>
          </div>
          <div 
            className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          >
            {isOpen ? <Minus className="text-gray-400" /> : <Plus className="text-gray-400" />}
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-[#5382ec]">
                          <ChevronsRight className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                  <div className="relative group flex items-center justify-center h-54 mt-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] rounded-lg blur opacity-45 group-hover:opacity-85 transition duration-1000"></div>
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const F1Guide = () => {
  const [openSection, setOpenSection] = useState(null);

  const handleToggle = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const sections = [
    {
      title: "Formula 1 Basics",
      description: "An introduction to the pinnacle of motorsport",
      Icon: Flag,
      points: [
        "Formula 1 is the highest class of international racing, featuring the world's fastest circuit racing cars.",
        "20 drivers compete across approximately 22-24 races each season.",
        "Each race weekend consists of practice sessions, qualifying, and the main race.",
        "Points are awarded to the top 10 finishers: 25 for 1st, 18 for 2nd, 15 for 3rd, down to 1 point for 10th.",
        "Both Drivers' and Constructors' Championships are awarded at the season's end."
      ],
      image: "https://miro.medium.com/v2/resize:fit:1200/1*hlh2WRaYM2lBELYwdblxMw.gif"
    },
    {
      title: "Race Strategy",
      description: "Understanding the crucial decisions during a race",
      Icon: PieChart,
      points: [
        "Teams must make at least one pit stop to change tire compounds during a race.",
        "Strategy involves balancing tire wear, fuel consumption, and track position.",
        "Weather conditions can dramatically affect strategy decisions.",
        "Teams use real-time data and predictive models to optimize their strategy.",
        "The timing of pit stops can make the difference between winning and losing."
      ],
      image: "https://miro.medium.com/v2/resize:fit:1200/1*_4B8KCTLPaEXqu9q6-31zA.gif"
    },
    {
      title: "Tire Management",
      description: "The crucial role of tires in F1",
      Icon: Gauge,
      points: [
        "Pirelli provides three different tire compounds for each race weekend.",
        "Softer compounds offer more grip but degrade faster.",
        "Harder compounds last longer but provide less overall grip.",
        "Drivers must manage tire wear throughout their stint.",
        "Different tracks and conditions favor different tire strategies."
      ],
      image: "https://i.imgur.com/hZLgRQe.gif"
    },
    {
      title: "Car Technology",
      description: "The engineering marvel of F1 cars",
      Icon: Car,
      points: [
        "F1 cars are the most technologically advanced racing cars in the world.",
        "Cars use hybrid power units combining a V6 turbo engine with electric systems.",
        "Aerodynamics play a crucial role in performance and racing ability.",
        "DRS (Drag Reduction System) aids overtaking in designated zones.",
        "Cars can accelerate from 0-100 km/h in about 2.6 seconds."
      ],
      image: "https://i.postimg.cc/QM3stxgk/2022-2023-streamlines.gif"
    },
    {
      title: "Pit Stops",
      description: "The high-speed art of pit stops",
      Icon: Wrench,
      points: [
        "A team of about 20 mechanics performs each pit stop.",
        "The fastest pit stops can be completed in under 2 seconds.",
        "Tire changes, front wing adjustments, and damage repairs happen here.",
        "Perfect coordination is essential for quick and safe stops.",
        "The pit stop timing can greatly influence race outcomes."
      ],
      image: "https://meetgroove.com/wp-content/uploads/2018/06/pit-crew-gif-4801470.gif"
    },
    {
      title: "Track Dynamics",
      description: "Understanding different circuit characteristics",
      Icon: Map,
      points: [
        "Each F1 track has unique characteristics affecting car setup and strategy.",
        "Tracks can be high-speed, technical, or street circuits.",
        "Weather and temperature significantly impact track conditions.",
        "Different sections of tracks offer various overtaking opportunities.",
        "Track evolution throughout a race weekend affects grip levels."
      ],
      image: "https://miro.medium.com/v2/resize:fit:1200/1*x-OJbQ3arZCnAYQh-50X8Q.gif"
    },
    {
      title: "Race Performance",
      description: "Key factors in race performance",
      Icon: Activity,
      points: [
        "Drivers manage complex steering wheels with numerous controls.",
        "Energy deployment and recovery systems require strategic management.",
        "Fuel management is crucial for race distance completion.",
        "Communication between driver and team is constant during races.",
        "Performance data is continuously analyzed for optimization."
      ],
      image: "https://images.squarespace-cdn.com/content/v1/65e17d125655fd707264f641/4bcbe0ad-40b2-478a-96ff-ee6baf09be64/What+is+Drag+in+F1+animation"
    }
  ];

  return (
    <div className="w-full bg-[#1B1C1D] py-16 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent mb-6">
          Your Guide to Formula 1
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto text-lg">
          Everything you need to know about Formula 1 to better understand the sport and make the most of our analytical tools.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-4">
        {sections.map((section, index) => (
          <GuideSection
            key={index}
            {...section}
            isOpen={openSection === index}
            onToggle={() => handleToggle(index)}
            index={index}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <p className="text-gray-400 mb-8">
          Ready to explore F1 data with your new knowledge?
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/live-race">
            <button className="px-6 py-2.5 bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] rounded-lg text-white font-medium hover:opacity-90 transition-opacity">
              Explore Live Data
            </button>
          </Link>
          <Link href="/prediction">
            <button className="px-6 py-2.5 border border-[#5382ec] rounded-lg text-white font-medium hover:bg-[#5382ec]/10 transition-colors">
              Make Predictions
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default F1Guide;