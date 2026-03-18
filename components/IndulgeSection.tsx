"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Plus } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";

interface IndulgeSectionProps {
    items: any[];
    onAdd: (item: any) => void;
    title?: string;
}

export function IndulgeSection({ items, onAdd, title }: IndulgeSectionProps) {
    if (!items.length) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
                <Star className="w-4 h-4 text-purple-500 fill-purple-500" />
                <h3 className="text-xl font-semibold tracking-tight text-[#0F3D2E]">{title || "Indulge yourself"}</h3>
            </div>

            <div className="space-y-6">
                {items.slice(0, 2).map((item) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group relative h-[300px] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-purple-900/10"
                    >
                        <img 
                            src={getDirectImageUrl(item.image_url)} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={item.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
                            <div className="space-y-2">
                                <h4 className="text-2xl font-semibold text-white tracking-tight">{item.title}</h4>
                                <p className="text-white/60 text-[10px] uppercase font-black tracking-widest italic">{item.description}</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <span className="text-white font-black text-xl">₹{item.price}</span>
                                </div>
                            </div>
                            
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onAdd(item)}
                                className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#0F3D2E] shadow-xl hover:bg-purple-500 hover:text-white transition-all"
                            >
                                <Plus className="w-6 h-6" />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
