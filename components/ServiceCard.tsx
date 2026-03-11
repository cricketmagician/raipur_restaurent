"use client";

import React from "react";
import { motion } from "framer-motion";

interface ServiceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    delay?: number;
    featured?: boolean;
    image?: string;
}

export function ServiceCard({ icon, title, description, onClick, delay = 0, featured = false, image }: ServiceCardProps) {
    if (featured) {
        return (
            <motion.button
                whileHover={{ y: -8, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    delay: delay,
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1]
                }}
                onClick={onClick}
                className="group relative w-full h-56 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 border border-white/20"
            >
                {/* Background Image/Gradient */}
                <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-slate-900 group-hover:scale-105 transition-transform duration-700"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </div>

                <div className="absolute inset-0 p-8 flex flex-col justify-end text-left">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 glass rounded-2xl text-white">
                            {icon}
                        </div>
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/10">Recommended</span>
                    </div>
                    <h3 className="text-2xl font-serif text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">{title}</h3>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-[0.1em]">{description}</p>
                </div>
            </motion.button>
        );
    }

    return (
        <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: delay,
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1]
            }}
            onClick={onClick}
            className="group flex flex-col items-center justify-center p-6 glass-dark rounded-[2.5rem] shadow-2xl shadow-black/10 hover:shadow-black/20 transition-all duration-300 border border-white/5 text-center w-full aspect-square relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="text-white mb-4 text-3xl transform group-hover:scale-110 transition-transform duration-500 relative z-10 opacity-70 group-hover:opacity-100">
                {icon}
            </div>

            <h3 className="font-bold text-white text-sm tracking-tight relative z-10">{title}</h3>

            {description && (
                <p className="text-[9px] text-white/40 mt-2 font-black uppercase tracking-[0.15em] relative z-10">
                    {description}
                </p>
            )}
        </motion.button>
    );
}
