import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface CartProgressBarProps {
    currentAmount: number;
    targetAmount: number;
    offerText: string;
}

export function CartProgressBar({ currentAmount, targetAmount, offerText }: CartProgressBarProps) {
    const progress = Math.min((currentAmount / targetAmount) * 100, 100);
    const remaining = Math.max(targetAmount - currentAmount, 0);

    return (
        <div className="bg-black/5 rounded-[2rem] p-6 mb-8 border border-black/5 relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-[#D4AF37]" />
                        Unlock Premium Offer
                    </p>
                    <h4 className="font-serif text-lg text-black leading-tight">
                        {progress >= 100 ? (
                            <span className="text-[#D4AF37]">Offer Unlocked! 🎉</span>
                        ) : (
                            <>Add <span className="text-[#D4AF37]">₹{remaining.toFixed(0)}</span> more to unlock <span className="italic">{offerText}</span></>
                        )}
                    </h4>
                </div>
            </div>
            
            <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="absolute inset-0 bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                />
            </div>
            
            {progress >= 100 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-[#D4AF37]/5 pointer-events-none"
                />
            )}
        </div>
    );
}
