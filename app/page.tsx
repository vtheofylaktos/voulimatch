"use client";

import React, { useState } from "react";
import Deck from "@/components/Deck";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center pt-8 px-4 font-sans text-slate-100 pb-12">
      <div className="w-full max-w-md flex flex-col gap-8 h-full">
        {/* Header / Decision Input */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent text-center">
            VouliMatch
          </h1>
        </div>

        {/* Deck */}
        <div className="flex-1 w-full flex items-center justify-center">
          <Deck />
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-4 font-medium uppercase tracking-widest">
          Swipe δεξιά ή αριστερά για το επόμενο
        </p>
      </div>
    </main>
  );
}
