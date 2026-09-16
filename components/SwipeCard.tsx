"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Bill {
  bill_id: string;
  title: string;
  date_voted: string;
  what_changes: string[];
  pros: string[];
  cons: string[];
  votes: Record<string, string>;
}

interface SwipeCardProps {
  bill: Bill;
  onVote: (vote: "ΥΠΕΡ" | "ΚΑΤΑ") => void;
}

export default function SwipeCard({ bill, onVote }: SwipeCardProps) {
  const [showVotes, setShowVotes] = useState(false);

  const proParties = Object.entries(bill.votes)
    .filter(([_, vote]) => vote === "ΥΠΕΡ")
    .map(([party]) => party);

  const conParties = Object.entries(bill.votes)
    .filter(([_, vote]) => vote === "ΚΑΤΑ")
    .map(([party]) => party);

  return (
    <div className="bg-zinc-900 rounded-3xl shadow-2xl p-6 h-full flex flex-col border border-zinc-800 text-zinc-50 overflow-hidden relative">
      <div className="flex-none mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-white leading-snug mb-2">
          {bill.title}
        </h2>
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">
          Ψηφίστηκε: {bill.date_voted}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        <div>
          <h3 className="text-xs font-bold text-zinc-300 mb-3 uppercase tracking-widest flex items-center gap-2">
            Τι αλλαζει;
          </h3>
          <ul className="space-y-3">
            {bill.what_changes.map((change, i) => (
              <li key={i} className="text-zinc-400 text-sm flex gap-3 leading-relaxed">
                <span className="text-indigo-500 mt-1">―</span>
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
            <h3 className="font-bold text-indigo-400 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
              Υπερ
            </h3>
            <ul className="space-y-2">
              {bill.pros.map((pro, i) => (
                <li key={i} className="text-zinc-400 text-xs leading-relaxed">
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
            <h3 className="font-bold text-red-400 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
              Κατα
            </h3>
            <ul className="space-y-2">
              {bill.cons.map((con, i) => (
                <li key={i} className="text-zinc-400 text-xs leading-relaxed">
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-none pt-4 mt-4 min-h-[90px]">
        <AnimatePresence mode="wait">
          {!showVotes ? (
            <motion.div 
              key="buttons"
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <button 
                onClick={() => {
                  onVote("ΥΠΕΡ");
                  setShowVotes(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm tracking-widest uppercase rounded-2xl py-4 transition-colors"
              >
                ΥΠΕΡ
              </button>
              <button 
                onClick={() => {
                  onVote("ΚΑΤΑ");
                  setShowVotes(true);
                }}
                className="bg-[#b91c1c] hover:bg-[#dc2626] text-white font-black text-sm tracking-widest uppercase rounded-2xl py-4 transition-colors"
              >
                ΚΑΤΑ
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-950 rounded-2xl p-4 flex flex-col gap-4 border border-zinc-800"
            >
              <div className="text-center text-[10px] text-zinc-500 mb-1 uppercase tracking-widest font-bold">
                Πως ψηφισαν τα κομματα
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-2">
                   <span className="text-indigo-400 font-bold text-xs tracking-widest uppercase">ΥΠΕΡ</span>
                   <div className="flex flex-wrap justify-center gap-1.5">
                     {proParties.map(p => (
                       <span key={p} className="px-2 py-1 text-[10px] font-bold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-900/50 uppercase tracking-wide">
                         {p.replace("_", " ")}
                       </span>
                     ))}
                     {proParties.length === 0 && <span className="text-xs text-zinc-600">Κανένα</span>}
                   </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <span className="text-red-400 font-bold text-xs tracking-widest uppercase">ΚΑΤΑ</span>
                   <div className="flex flex-wrap justify-center gap-1.5">
                     {conParties.map(p => (
                       <span key={p} className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-950 text-red-300 border border-red-900/50 uppercase tracking-wide">
                         {p.replace("_", " ")}
                       </span>
                     ))}
                     {conParties.length === 0 && <span className="text-xs text-zinc-600">Κανένα</span>}
                   </div>
                </div>
              </div>
              <div className="text-center text-zinc-400 text-[10px] font-bold animate-pulse mt-2 uppercase tracking-widest">
                Swipe για συνεχεια
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
