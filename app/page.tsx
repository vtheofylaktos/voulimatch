"use client";

import React, { useState } from "react";
import Deck from "@/components/Deck";

export default function Page() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center pt-8 px-4 font-sans text-zinc-50 pb-12 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md flex flex-col gap-8 h-full">
        {/* Header / Decision Input */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tighter text-white text-center">
            VouliMatch<span className="text-indigo-500">.</span>
          </h1>
        </div>

        {/* Deck */}
        <div className="flex-1 w-full flex items-center justify-center">
          <Deck />
        </div>
        
        <p className="text-center text-xs text-zinc-600 mt-4 font-medium uppercase tracking-widest">
          Swipe δεξιά ή αριστερά για το επόμενο
        </p>
      </div>
    </main>
  );
}
