"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useTheme } from "@/utils/themes";
import { useHotelBranding, SeasonalStory } from "@/utils/store";
import { useParams } from "next/navigation";

interface StoryOverlayProps {
    stories: SeasonalStory[];
    initialIndex: number;
    isVisible: boolean;
    onClose: () => void;
    onOrder: (story: SeasonalStory, event: React.MouseEvent) => void;
}

export function StoryOverlay({ stories, initialIndex, isVisible, onClose, onOrder }: StoryOverlayProps) {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isVisible) {
            setCurrentIndex(initialIndex);
            setProgress(0);
        }
    }, [initialIndex, isVisible]);

    useEffect(() => {
        if (!isVisible) return;
        
        setProgress(0);
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (currentIndex < stories.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                        setProgress(0);
                    } else {
                        onClose();
                    }
                    return 0;
                }
                return prev + 1;
            });
        }, 50); // 5 seconds total (100 * 50ms)

        return () => clearInterval(timer);
    }, [currentIndex, isVisible, onClose, stories.length]);

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
        } else {
            setProgress(0); // Restart current story if at start
        }
    };

    if (!isVisible) return null;

    const currentStory = stories[currentIndex];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
                >
                    {/* Top Progress Bars */}
                    <div className="absolute top-10 left-6 right-6 flex space-x-2 z-50">
                        {stories.map((_, index) => (
                            <div key={index} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={{ width: 0 }}
                                    animate={{ 
                                        width: index === currentIndex ? `${progress}%` : index < currentIndex ? "100%" : "0%" 
                                    }}
                                    transition={{ duration: 0.1, ease: "linear" }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Header: Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-16 right-6 z-50 w-12 h-12 bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Story Content */}
                    <div className="relative w-full h-full mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute inset-0"
                            >
                                <img 
                                    src={currentStory.image_url} 
                                    alt={currentStory.label} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

                                {/* Item Info */}
                                <div className="absolute bottom-40 left-8 right-8 text-white z-30">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <span 
                                            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block shadow-lg"
                                            style={{ backgroundColor: theme.secondary, color: theme.primary }}
                                        >
                                            {currentStory.type}
                                        </span>
                                        <h2 className="text-5xl font-black tracking-tighter mb-2 leading-tight">
                                            {currentStory.label}
                                        </h2>
                                        <div className="flex items-center space-x-3 text-white/60">
                                            <span className="text-2xl font-black text-white">₹{currentStory.price}</span>
                                            <span className="text-sm font-bold uppercase tracking-widest">• Handcrafted</span>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Order Now Action */}
                                <div className="absolute bottom-12 left-8 right-8 z-30">
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => onOrder(currentStory, e)}
                                        className="w-full py-8 rounded-full font-black uppercase tracking-widest flex items-center justify-center space-x-4 shadow-2xl"
                                        style={{ backgroundColor: theme.background, color: theme.primary, borderRadius: theme.radius }}
                                    >
                                        <ShoppingBag className="w-6 h-6" />
                                        <span>Order Now</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Interaction Areas */}
                        <div className="absolute inset-0 flex z-20">
                            <div 
                                className="flex-[0.4] h-full cursor-pointer" 
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
                            />
                            <div 
                                className="flex-[0.6] h-full cursor-pointer" 
                                onClick={(e) => { e.stopPropagation(); handleNext(); }} 
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
