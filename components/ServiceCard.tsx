"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

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
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);

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
                className="group relative w-full h-56 overflow-hidden shadow-2xl border transition-all"
                style={{ borderRadius: theme.radius, borderColor: `${theme.primary}10` }}
            >
                {/* Background Image/Gradient */}
                <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: theme.primary }}>
                    {image ? (
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out opacity-60"
                        />
                    ) : (
                        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700" style={{ backgroundColor: theme.primary }}></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>

                <div className="absolute inset-0 p-8 flex flex-col justify-end text-left">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-3 glass rounded-2xl text-white shadow-xl">
                            {icon}
                        </div>
                        <span 
                            className="backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border"
                            style={{ backgroundColor: `${theme.secondary}33`, color: theme.secondary, borderColor: `${theme.secondary}33` }}
                        >
                            Recommended
                        </span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">{title}</h3>
                    <p className="text-white/70 text-xs font-black uppercase tracking-[0.1em]">{description}</p>
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
            className="group flex flex-col items-center justify-center p-6 bg-white shadow-2xl transition-all duration-300 border text-center w-full aspect-square relative overflow-hidden"
            style={{ borderRadius: theme.radius, borderColor: `${theme.primary}05` }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div 
                className="mb-4 text-3xl transform group-hover:scale-110 transition-transform duration-500 relative z-10 opacity-70 group-hover:opacity-100"
                style={{ color: theme.primary }}
            >
                {icon}
            </div>

            <h3 className="font-black text-sm tracking-tight relative z-10" style={{ color: theme.primary }}>{title}</h3>

            {description && (
                <p 
                    className="text-[9px] mt-2 font-black uppercase tracking-[0.15em] relative z-10 opacity-40"
                    style={{ color: theme.primary }}
                >
                    {description}
                </p>
            )}
        </motion.button>
    );
}
