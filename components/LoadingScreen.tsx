"use client";

import React from "react";
import { motion } from "framer-motion";
import { getDirectImageUrl } from "@/utils/image";

interface LoadingScreenProps {
    hotelName?: string;
    logo?: string;
    backgroundImage?: string;
}

export function LoadingScreen({ hotelName, logo, backgroundImage }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#F5F1E8] overflow-hidden">
            {/* Background Image / Gradient */}
            {backgroundImage ? (
                <motion.div 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img 
                        src={getDirectImageUrl(backgroundImage)} 
                        className="w-full h-full object-cover"
                        alt="Loading Background"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                </motion.div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5F1E8] via-white to-[#E8E1D5]" />
            )}

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex flex-col items-center space-y-8"
                >
                    {logo && (
                        <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-xl border border-white/40 p-4 shadow-2xl flex items-center justify-center overflow-hidden">
                            <img 
                                src={getDirectImageUrl(logo)} 
                                alt={hotelName} 
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    <div className="text-center space-y-2">
                        <h1 className={`text-4xl font-black italic tracking-tighter ${backgroundImage ? 'text-white' : 'text-[#0F3D2E]'}`}>
                            {hotelName ? hotelName.toUpperCase() : "DINEFLOW"}
                        </h1>
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${backgroundImage ? 'text-white/60' : 'text-[#C8A96A]'}`}>
                            Preparing Excellence
                        </p>
                    </div>

                    {/* Minimal Progress Bar */}
                    <div className="w-48 h-[1px] bg-black/10 relative overflow-hidden mt-12">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className={`absolute inset-0 ${backgroundImage ? 'bg-white' : 'bg-[#C8A96A]'}`}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Quote / Subtext at bottom */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-12 left-0 right-0 text-center"
            >
                <p className={`text-[10px] italic font-medium tracking-wide ${backgroundImage ? 'text-white/40' : 'text-[#0F3D2E]/20'}`}>
                    "Handcrafted for your sensory delight."
                </p>
            </motion.div>
        </div>
    );
}
