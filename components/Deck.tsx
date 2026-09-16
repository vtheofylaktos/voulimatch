"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import * as htmlToImage from "html-to-image";
import SwipeCard from "./SwipeCard";

export interface Bill {
  bill_id: string;
  title: string;
  date_voted: string;
  what_changes: string[];
  pros: string[];
  cons: string[];
  votes: Record<string, string>;
}

// Fisher-Yates Shuffle
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function DraggableCard({ bill, onSwipe, onVote }: { bill: Bill, onSwipe: (dir: "left" | "right") => void, onVote: (v: "ΥΠΕΡ" | "ΚΑΤΑ") => void }) {
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isDraggable, setIsDraggable] = useState(false);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const cardOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: any, info: any) => {
    if (!isDraggable) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      setDirection("right");
      onSwipe("right");
    } else if (offset < -100 || velocity < -500) {
      setDirection("left");
      onSwipe("left");
    }
  };

  const handleVote = (v: "ΥΠΕΡ" | "ΚΑΤΑ") => {
    onVote(v);
    setIsDraggable(true);
  };

  return (
    <motion.div
      className="absolute inset-0 z-10 origin-bottom"
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{
        x: direction === "left" ? -300 : 300,
        opacity: 0,
        rotate: direction === "left" ? -20 : 20,
        transition: { duration: 0.3 }
      }}
      style={{ x, rotate, opacity: cardOpacity }}
      drag={isDraggable ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={isDraggable ? { cursor: "grabbing" } : {}}
    >
      <SwipeCard bill={bill} onVote={handleVote} />
    </motion.div>
  );
}

export default function Deck() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, "ΥΠΕΡ" | "ΚΑΤΑ">>({});
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [hasLoggedTelemetry, setHasLoggedTelemetry] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/bills')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBills(shuffleArray(data));
        }
      })
      .catch(err => console.error("Failed to fetch bills:", err));
  }, []);

  const handleSwipe = (dir: "left" | "right") => {
    setCurrentIndex((prev) => prev + 1);
  };

  const calculateMatches = () => {
    const answeredBillsCount = Object.keys(userVotes).length;
    if (answeredBillsCount === 0) {
      return null;
    }

    const partyMatches: Record<string, number> = {};
    
    // Initialize all unique parties found across all bills
    bills.forEach(b => {
      Object.keys(b.votes).forEach(p => {
        if (partyMatches[p] === undefined) partyMatches[p] = 0;
      });
    });

    // Calculate matches
    bills.forEach(bill => {
      const userVote = userVotes[bill.bill_id];
      if (userVote) {
        // Iterate over all known parties
        Object.keys(partyMatches).forEach(party => {
          const partyVote = bill.votes[party];
          // Strict match: if party did not vote or voted 'ΠΑΡΩΝ', they get 0 points for this bill
          if (partyVote === userVote) {
            partyMatches[party] += 1;
          }
        });
      }
    });

    return Object.entries(partyMatches)
      .map(([party, matches]) => ({
        party,
        percentage: Math.round((matches / answeredBillsCount) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const handleShare = async () => {
    if (!resultsRef.current) return;
    try {
      // Use black background for share image
      const dataUrl = await htmlToImage.toJpeg(resultsRef.current, { quality: 0.95, backgroundColor: '#000000' });
      
      if (navigator.share) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'voulimatch-results.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'VouliMatch Results',
          text: 'Δες με ποιο κόμμα ταιριάζω στο VouliMatch!',
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = 'voulimatch-results.jpg';
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  const matches = currentIndex >= bills.length && bills.length > 0 ? calculateMatches() : [];

  useEffect(() => {
    if (currentIndex >= bills.length && bills.length > 0 && !hasLoggedTelemetry && ageGroup && matches && matches.length > 0) {
      const topMatch = matches[0];
      
      if (topMatch) {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            age_group: ageGroup,
            top_match_party: topMatch.party,
            top_match_percentage: topMatch.percentage
          })
        }).catch(err => console.error('Failed to log telemetry', err));
      }
      setHasLoggedTelemetry(true);
    }
  }, [currentIndex, bills.length, hasLoggedTelemetry, ageGroup, userVotes, matches]);

  if (bills.length === 0) {
    return <div className="flex justify-center items-center h-full text-zinc-500 font-medium">Φόρτωση...</div>;
  }

  if (!ageGroup) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto text-zinc-50 p-8 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800">
        <h2 className="text-2xl font-black mb-8 text-center text-white tracking-tight">Επίλεξε ηλικιακή ομάδα</h2>
        <div className="flex flex-col gap-3 w-full">
          {["17-24", "25-34", "35+"].map(age => (
            <button
              key={age}
              onClick={() => setAgeGroup(age)}
              className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-lg font-bold rounded-2xl border border-zinc-800 transition-colors"
            >
              {age}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (currentIndex >= bills.length) {
    if (!matches) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto text-zinc-50 p-8 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800">
          <span className="text-5xl mb-4">😶</span>
          <h2 className="text-2xl font-black text-white text-center mb-4 tracking-tight">Δεν καταγράφηκε ψήφος</h2>
          <p className="text-zinc-500 text-center mb-8 text-sm">
            Δεν καταγράψαμε καμία ψήφο σου. Δοκίμασε ξανά.
          </p>
          <button onClick={() => { setCurrentIndex(0); setUserVotes({}); setHasLoggedTelemetry(false); }} className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold transition-colors w-full text-sm">
            ΕΠΑΝΕΚΚΙΝΗΣΗ
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto h-[750px]">
        <div ref={resultsRef} className="flex flex-col items-center justify-start w-full text-zinc-50 p-6 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-y-auto custom-scrollbar">
          <span className="text-4xl mb-4">🏛️</span>
          <h2 className="text-2xl font-extrabold text-white text-center mb-1 tracking-tight">Το Προφίλ σου</h2>
          <div className="w-full space-y-3 mt-6">
            {matches.map((match, index) => (
              <div key={match.party} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold tracking-tight text-sm text-zinc-300">{match.party.replace("_", " ")}</span>
                  <span className="font-black text-indigo-400">{match.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${match.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full rounded-full ${match.percentage >= 70 ? 'bg-indigo-500' : match.percentage >= 40 ? 'bg-indigo-700' : 'bg-red-900'}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center text-xs font-bold tracking-widest text-zinc-600 uppercase">VouliMatch</div>
        </div>
        
        <button onClick={handleShare} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-colors shadow-lg w-full flex justify-center items-center gap-2 text-sm tracking-wide">
          ΜΟΙΡΑΣΟΥ ΤΟ 📸
        </button>
        <button onClick={() => { setCurrentIndex(0); setUserVotes({}); setHasLoggedTelemetry(false); }} className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-full font-bold transition-colors w-full text-xs tracking-widest uppercase">
          Επανεκκίνηση
        </button>
      </div>
    );
  }

  const progress = (currentIndex / bills.length) * 100;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[700px]">
      <div className="mb-6 flex flex-col gap-2 px-2">
        <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          <span>Πρόοδος</span><span>{currentIndex} / {bills.length}</span>
        </div>
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="relative flex-1 w-full perspective-1000">
        <AnimatePresence mode="popLayout">
          <DraggableCard
            key={currentIndex}
            bill={bills[currentIndex]}
            onSwipe={handleSwipe}
            onVote={(vote) => setUserVotes(prev => ({ ...prev, [bills[currentIndex].bill_id]: vote }))}
          />
          
          {currentIndex + 1 < bills.length && (
            <motion.div
              key={currentIndex + 1}
              className="absolute inset-0 z-0 origin-bottom"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 0.95, opacity: 0.5, y: 20 }}
            >
              <div className="w-full h-full bg-zinc-900 rounded-3xl opacity-50 shadow-2xl border border-zinc-800" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
