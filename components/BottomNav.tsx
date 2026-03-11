"use client";

import React from "react";
import { Home, Grip, Bell, Info } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { motion } from "framer-motion";

export function BottomNav() {
    const pathname = usePathname();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    const isActive = (path: string) => pathname?.includes(path);

    const items = [
        { href: `/${hotelSlug}/guest/dashboard`, icon: Home, label: "Home", key: "dashboard" },
        { href: `/${hotelSlug}/guest/services`, icon: Grip, label: "Services", key: "services" },
        { href: `/${hotelSlug}/guest/status`, icon: Bell, label: "Requests", key: "status" },
        { href: `/${hotelSlug}/guest/info`, icon: Info, label: "Profile", key: "info" },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md z-40">
            <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-2 shadow-[0_15px_45px_-12px_rgba(0,0,0,0.1)] border border-white">
                <div className="flex justify-around items-center px-2">
                    {items.map((item) => {
                        const active = isActive(item.key);
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className="relative flex flex-col items-center flex-1 py-3 outline-none group"
                            >
                                <div className="relative mb-1">
                                    <item.icon className={`w-5 h-5 transition-all duration-500 scale-90 group-hover:scale-100 ${active ? "text-slate-900" : "text-slate-400"}`} />
                                    {active && (
                                        <motion.div
                                            layoutId="active-nav-glow"
                                            className="absolute inset-0 bg-amber-500/10 blur-md rounded-full"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-500 ${active ? "text-slate-900" : "text-slate-400"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
