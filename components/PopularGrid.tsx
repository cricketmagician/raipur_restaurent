"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Plus } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";

interface PopularGridProps {
    items: any[];
    onAdd: (item: any) => void;
}

export function PopularGrid({ items, onAdd }: PopularGridProps) {
    if (!items.length) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <h3 className="text-xl font-semibold tracking-tight text-[#0F3D2E]">Popular right now</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {items.slice(0, 4).map((item) => (
                    <motion.div 
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white rounded-[2rem] p-4 shadow-sm border border-black/5 flex flex-col gap-3"
                    >
                        <div className="aspect-square rounded-2xl overflow-hidden border border-black/5 relative">
                            <img 
                                src={getDirectImageUrl(item.image_url)} 
                                className="w-full h-full object-cover" 
                                alt={item.title} 
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">🔥 Bestseller</span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-[#0F3D2E] line-clamp-1">{item.title}</h4>
                            <p className="text-[#0F3D2E]/40 text-[10px] uppercase font-black tracking-widest mt-1">₹{item.price}</p>
                        </div>

                        <button 
                            onClick={() => onAdd(item)}
                            className="w-full py-3 bg-[#0F3D2E]/5 rounded-xl text-[#0F3D2E] text-[10px] font-black uppercase tracking-widest hover:bg-[#0F3D2E] hover:text-white transition-all active:scale-90"
                        >
                            Add Now
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
