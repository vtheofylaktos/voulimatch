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

function DraggableCard({ bill, onSwipe, onVote }: { bill: Bill, onSwipe: (dir: "left" | "right") => void, onVote: (v: "ΥΠΕΡ" | "ΚΑΤΑ") => void }) {
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const cardOpacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      setDirection("right");
      onVote("ΥΠΕΡ");
      onSwipe("right");
    } else if (offset < -100 || velocity < -500) {
      setDirection("left");
      onVote("ΚΑΤΑ");
      onSwipe("left");
    }
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
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      <SwipeCard bill={bill} onVote={onVote} />
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
      .then(data => setBills(data))
      .catch(err => console.error("Failed to fetch bills:", err));
  }, []);

  const handleSwipe = (dir: "left" | "right") => {
    setCurrentIndex((prev) => prev + 1);
  };

  const calculateMatches = () => {
    const partyMatches: Record<string, { total: number; matches: number }> = {};
    bills.forEach(b => {
      Object.keys(b.votes).forEach(p => {
        if (!partyMatches[p]) partyMatches[p] = { total: 0, matches: 0 };
      });
    });

    bills.forEach(bill => {
      const userVote = userVotes[bill.bill_id];
      if (userVote) {
        Object.entries(bill.votes).forEach(([party, partyVote]) => {
          if (partyVote === "ΥΠΕΡ" || partyVote === "ΚΑΤΑ") {
            partyMatches[party].total += 1;
            if (partyVote === userVote) partyMatches[party].matches += 1;
          }
        });
      }
    });

    return Object.entries(partyMatches)
      .map(([party, stats]) => ({
        party,
        percentage: stats.total > 0 ? Math.round((stats.matches / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const handleShare = async () => {
    if (!resultsRef.current) return;
    try {
      const dataUrl = await htmlToImage.toJpeg(resultsRef.current, { quality: 0.95, backgroundColor: '#020617' });
      
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

  useEffect(() => {
    if (currentIndex >= bills.length && bills.length > 0 && !hasLoggedTelemetry && ageGroup) {
      const matches = calculateMatches();
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
  }, [currentIndex, bills.length, hasLoggedTelemetry, ageGroup, userVotes]);

  if (bills.length === 0) {
    return <div className="flex justify-center items-center h-full text-slate-400">Φόρτωση νομοσχεδίων...</div>;
  }

  if (!ageGroup) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto text-slate-100 p-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/50">
        <h2 className="text-3xl font-black mb-8 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Ποια είναι η ηλικία σου;</h2>
        <div className="flex flex-col gap-4 w-full">
          {["17-24", "25-34", "35+"].map(age => (
            <button
              key={age}
              onClick={() => setAgeGroup(age)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-xl font-bold rounded-2xl border border-slate-600 transition"
            >
              {age}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (currentIndex >= bills.length) {
    const matches = calculateMatches();
    return (
      <div className="flex flex-col gap-4 w-full max-w-md mx-auto h-[750px]">
        <div ref={resultsRef} className="flex flex-col items-center justify-start w-full text-slate-100 p-6 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/50 overflow-y-auto custom-scrollbar">
          <span className="text-5xl mb-4">🎯</span>
          <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent text-center mb-2">Το Προφίλ σου</h2>
          <div className="w-full space-y-4 mt-6">
            {matches.map((match, index) => (
              <div key={match.party} className="bg-slate-800 p-4 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold tracking-wide text-sm">{match.party.replace("_", " ")}</span>
                  <span className="font-black text-blue-400">{match.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${match.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full rounded-full ${match.percentage >= 70 ? 'bg-emerald-500' : match.percentage >= 40 ? 'bg-blue-500' : 'bg-rose-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center text-xs text-slate-500">VouliMatch</div>
        </div>
        
        <button onClick={handleShare} className="px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-400 hover:opacity-90 text-white rounded-full font-bold transition shadow-lg w-full flex justify-center items-center gap-2">
          📸 Μοιράσου το στο Instagram
        </button>
        <button onClick={() => { setCurrentIndex(0); setUserVotes({}); setHasLoggedTelemetry(false); }} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition shadow-lg w-full">
          Ξανά από την αρχή
        </button>
      </div>
    );
  }

  const progress = (currentIndex / bills.length) * 100;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[700px]">
      <div className="mb-6 flex flex-col gap-2 px-2">
        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>Πρόοδος</span><span>{currentIndex} / {bills.length}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
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
              <div className="w-full h-full bg-slate-900 rounded-3xl opacity-50 shadow-xl border border-slate-700/50" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
