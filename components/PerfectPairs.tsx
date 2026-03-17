"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAddEffectTrigger } from "./AddEffect";

interface PairItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    price: number;
    originalId: string;
}

interface PerfectPairsProps {
    pairs: PairItem[];
    onAdd: (id: string) => void;
}

export function PerfectPairs({ pairs, onAdd }: PerfectPairsProps) {
    const triggerFly = useAddEffectTrigger();
    
    return (
        <section className="space-y-6">
            <h3 className="text-[10px] font-black text-[#1E3932] uppercase tracking-[0.3em] px-2">
                🤤 Perfect Pairs
            </h3>

            <div className="grid grid-cols-1 gap-4">
                {pairs.map((pair) => (
                    <motion.div
                        key={pair.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-[2rem] p-6 border border-[#00704A]/5 shadow-xl shadow-[#00704A]/5 flex items-center group relative overflow-hidden"
                    >
                        {/* Abstract background shape */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#D4E9E2]/20 rounded-full blur-3xl group-hover:bg-[#D4E9E2]/40 transition-colors" />

                        <div className="w-24 h-24 rounded-full overflow-hidden mr-6 shadow-xl border-4 border-white shrink-0 relative z-10">
                            <img src={pair.image} alt={pair.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 min-w-0 relative z-10">
                            <h4 className="text-lg font-black text-[#1E3932] tracking-tight">{pair.title}</h4>
                            <p className="text-[#00704A] text-[10px] font-bold uppercase tracking-widest mt-1 mb-3">
                                {pair.subtitle}
                            </p>
                            <span className="text-xl font-black text-[#1E3932]">₹{pair.price}</span>
                        </div>

                        <button
                            onClick={(e) => {
                                triggerFly(pair.originalId, pair.image, e);
                                onAdd(pair.originalId);
                            }}
                            className="bg-[#00704A] text-white p-4 rounded-2xl shadow-lg shadow-[#00704A]/20 active:scale-90 transition-all relative z-10"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
