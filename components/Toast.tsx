"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "success" | "error";
    isVisible: boolean;
    onClose: () => void;
}

export function Toast({ message, type = "success", isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-sm"
                >
                    <div className="glass-dark border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {type === "success" ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-rose-400" />
                            )}
                            <p className="text-xs font-bold text-white tracking-wide">{message}</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                            <X className="w-4 h-4 text-white/40" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
