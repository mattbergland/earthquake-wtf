"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGES = [
    { text: "wait... was that an earthquake?", domain: ".wtf" },
    { text: "lmao the ground just moved", domain: ".lol" },
    { text: "umm... did you feel that too?", domain: ".wtf" },
    { text: "my plants are SHAKING", domain: ".lol" },
    { text: "bro my whole desk just vibrated", domain: ".wtf" },
    { text: "the cat knows something we don't", domain: ".lol" },
    { text: "was that a truck or...?", domain: ".wtf" },
    { text: "ok that was NOT just me", domain: ".lol" },
    { text: "my water glass is doing the jurassic park thing", domain: ".wtf" },
    { text: "should i be under a doorframe rn", domain: ".lol" },
    { text: "the chandelier is swinging 👀", domain: ".wtf" },
    { text: "california moment™", domain: ".lol" },
    { text: "felt that from my overpriced studio", domain: ".wtf" },
    { text: "the hayward fault said hello", domain: ".lol" },
    { text: "my oat milk latte is vibrating", domain: ".wtf" },
    { text: "even the tech bros felt that one", domain: ".lol" },
    { text: "shook harder than BART at rush hour", domain: ".wtf" },
    { text: "my rent is too high for this", domain: ".lol" },
  ];

export default function AnimatedLogo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const bubble = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animation = bubble.current?.animate([
      { opacity: 0, transform: "scale(0.8) translateY(20px)" },
      { transform: "scale(1.02) translateY(-2px)", offset: 0.5 },
      { opacity: 1, transform: "scale(1) translateY(0)" },
    ], { duration: 700, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" });
    return () => animation?.cancel();
  }, [currentIndex]);

  const current = MESSAGES[currentIndex];
  const isLol = current.domain === ".lol";

  return (
    <div className="text-center mb-8 w-full max-w-sm h-[108px]">
      <div
        ref={bubble}
        className={`h-20 flex items-center justify-center px-6 py-3 rounded-2xl rounded-br-md text-lg font-medium shadow-lg ${
          isLol
            ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
            : "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
        }`}
      >
        {current.text}
      </div>
      <div className="mt-2 text-right opacity-0 animate-fade-in" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
        <span className="text-sm text-gray-400">
          earthquake<span className={`inline-block w-7 text-left font-semibold ${isLol ? "text-green-500" : "text-blue-500"}`}>{current.domain}</span>
        </span>
      </div>
    </div>
  );
}
