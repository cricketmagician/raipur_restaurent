"use client";

import React from "react";
import { ArrowLeft, MapPin, Clock, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useHotelBranding } from "@/utils/store";

export default function InfoPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    return (
        <div className="pb-32 section-padding pt-10 min-h-screen bg-background text-foreground">
            <button onClick={() => router.back()} className="mb-8 flex items-center text-foreground/40 hover:text-foreground font-bold transition-all group">
                <div className="w-10 h-10 rounded-full glass flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                Return to Dashboard
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-4xl font-serif text-foreground leading-tight">Property<br />Information</h1>
                <p className="text-foreground/40 mt-4 font-black uppercase tracking-[0.25em] text-[10px]">Everything you need to know</p>
            </motion.div>

            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-dark p-8 rounded-[2.5rem] shadow-2xl shadow-black/10 border border-white/5 flex items-start"
                >
                    <div className="p-4 bg-white/5 rounded-2xl mr-5">
                        <Clock className="w-6 h-6 text-white" style={{ color: branding?.primaryColor }} />
                    </div>
                    <div>
                        <h3 className="font-serif text-xl text-white mb-2">Check-in / Check-out</h3>
                        <p className="text-sm text-white/40 font-medium">Arrival: 3:00 PM</p>
                        <p className="text-sm text-white/40 font-medium">Departure: 11:00 AM</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-dark p-8 rounded-[2.5rem] shadow-2xl shadow-black/10 border border-white/5 flex items-start"
                >
                    <div className="p-4 bg-white/5 rounded-2xl mr-5">
                        <MapPin className="w-6 h-6 text-white" style={{ color: branding?.primaryColor }} />
                    </div>
                    <div>
                        <h3 className="font-serif text-xl text-white mb-2">Location & Transport</h3>
                        <p className="text-sm text-white/40 font-medium leading-relaxed">123 Azure Coastal Ave.</p>
                        <p className="text-sm text-white/40 font-medium mt-3 leading-relaxed italic opacity-80">Airport shuttle runs every 30 minutes from the main lobby.</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-dark p-8 rounded-[2.5rem] shadow-2xl shadow-black/10 border border-white/5 flex items-start"
                >
                    <div className="p-4 bg-white/5 rounded-2xl mr-5">
                        <Phone className="w-6 h-6 text-white" style={{ color: branding?.primaryColor }} />
                    </div>
                    <div>
                        <h3 className="font-serif text-xl text-white mb-2">Important Numbers</h3>
                        <ul className="text-sm text-white/40 font-medium space-y-2">
                            <li className="flex justify-between w-full"><span>Reception</span> <span className="font-black text-white">Dial 0</span></li>
                            <li className="flex justify-between w-full"><span>Dining Service</span> <span className="font-black text-white">Dial 101</span></li>
                            <li className="flex justify-between w-full"><span>The Spa</span> <span className="font-black text-white">Dial 204</span></li>
                            <li className="flex justify-between w-full"><span>Emergency</span> <span className="font-black text-white">Dial 911</span></li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
