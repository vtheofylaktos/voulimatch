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
    <div className="bg-slate-900 rounded-3xl shadow-2xl p-6 h-full flex flex-col border border-slate-700/50 text-slate-100 overflow-hidden relative">
      <div className="flex-none mb-4">
        <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent leading-tight mb-2">
          {bill.title}
        </h2>
        <p className="text-sm text-slate-400 font-medium">Ψηφίστηκε: {bill.date_voted}</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center">?</span>
            Τι αλλάζει;
          </h3>
          <ul className="space-y-3">
            {bill.what_changes.map((change, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-3 leading-relaxed">
                <span className="text-blue-400 mt-1">•</span>
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-900/50">
            <h3 className="font-bold text-emerald-400 mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">✓</span> Υπέρ
            </h3>
            <ul className="space-y-2">
              {bill.pros.map((pro, i) => (
                <li key={i} className="text-slate-300 text-xs leading-relaxed">
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-rose-950/30 p-4 rounded-xl border border-rose-900/50">
            <h3 className="font-bold text-rose-400 mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">✕</span> Κατά
            </h3>
            <ul className="space-y-2">
              {bill.cons.map((con, i) => (
                <li key={i} className="text-slate-300 text-xs leading-relaxed">
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-none pt-4 border-t border-slate-700/50 mt-4 min-h-[80px]">
        <AnimatePresence mode="wait">
          {!showVotes ? (
            <motion.div 
              key="buttons"
              className="grid grid-cols-2 gap-4"
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
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl tracking-wider rounded-2xl py-4 shadow-md transition-shadow"
              >
                ΥΠΕΡ
              </button>
              <button 
                onClick={() => {
                  onVote("ΚΑΤΑ");
                  setShowVotes(true);
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xl tracking-wider rounded-2xl py-4 shadow-md transition-shadow"
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
              className="bg-slate-800 rounded-2xl p-4 shadow-inner flex flex-col gap-4"
            >
              <div className="text-center text-xs text-slate-400 mb-1 uppercase tracking-widest">
                Πως ψήφισαν τα κόμματα
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col items-center gap-2">
                   <span className="text-emerald-400 font-bold text-sm tracking-widest">ΥΠΕΡ</span>
                   <div className="flex flex-wrap justify-center gap-2">
                     {proParties.map(p => (
                       <span key={p} className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
                         {p.replace("_", " ")}
                       </span>
                     ))}
                     {proParties.length === 0 && <span className="text-sm opacity-60">Κανένα</span>}
                   </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <span className="text-rose-400 font-bold text-sm tracking-widest">ΚΑΤΑ</span>
                   <div className="flex flex-wrap justify-center gap-2">
                     {conParties.map(p => (
                       <span key={p} className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-900/50 text-rose-300 border border-rose-700/50">
                         {p.replace("_", " ")}
                       </span>
                     ))}
                     {conParties.length === 0 && <span className="text-sm opacity-60">Κανένα</span>}
                   </div>
                </div>
              </div>
              <div className="text-center text-emerald-400 text-xs font-bold animate-pulse mt-2 uppercase tracking-widest">
                👉 Κάνε Swipe για να συνεχίσεις 👈
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
