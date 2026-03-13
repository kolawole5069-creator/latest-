import React from 'react';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-neutral-50 flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">EduScore</h1>
        <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest mt-1">Loading your workspace...</p>
      </motion.div>
    </div>
  );
}
