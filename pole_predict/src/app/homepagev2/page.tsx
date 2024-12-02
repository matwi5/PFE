"use client"; // This tells Next.js that this component is a Client Component

import React, { useState } from 'react';

const HomePage: React.FC = () => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div style={{ backgroundColor: "black", height: "100vh", color: "white", padding: "2rem", textAlign: "center" }}>
      {/* Main Content */}
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70%" }}>
        {/* F1 Car Illustration */}
        <div>
            <img src="/images/f1car.png" alt="F1 Car" style={{ width: "450px", marginBottom: "2rem" }} />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "2rem" }}>
          Ready to be an expert in Formula 1?
        </h1>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {["PAST", "UPCOMING", "LIVE", "ABOUT US"].map((text, index) => (
            <button
              key={index}
              style={{
                ...buttonStyle,
                transform: hoverIndex === index ? "scale(1.1)" : "scale(1)", // Increase button size on hover
                background: hoverIndex === index ? "orange" : "none", // Change background to orange on hover
                color: hoverIndex === index ? "black" : "white", // Change text color on hover
              }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              → {text}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid white",
  color: "white",
  padding: "0.5rem 1rem",
  fontSize: "1rem",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  justifyContent: "center",
  transition: "background 0.3s, color 0.3s, transform 0.3s", // Smooth transition for background, color, and size
};

export default HomePage;
