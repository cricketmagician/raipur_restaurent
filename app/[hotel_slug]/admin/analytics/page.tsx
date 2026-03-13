"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, ShoppingBag, Calendar, ArrowUpRight, ArrowDownRight, Filter, Download } from "lucide-react";
import { useHotelBranding, useSupabaseRequests, useHotelRooms } from "@/utils/store";

export default function AnalyticsPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const hotelId = branding?.id || "";
    const requests = useSupabaseRequests(hotelId);
    const { rooms } = useHotelRooms(hotelId);

    const [range, setRange] = useState("7d");

    // Derived Stats
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'Completed').length;
    const billedRequests = requests.filter(r => (r.price || 0) > 0);
    const totalRevenue = billedRequests.reduce((sum, r) => sum + (r.total || 0), 0);
    const avgOrderValue = totalRevenue / (billedRequests.length || 1);

    const metrics = [
        { label: "Gross Revenue", value: `₹${totalRevenue.toLocaleString()}`, trend: "+12.5%", isUp: true, icon: <TrendingUp className="w-5 h-5" /> },
        { label: "Active Guests", value: rooms.filter(r => r.is_occupied).length, trend: "+4.2%", isUp: true, icon: <Users className="w-5 h-5" /> },
        { label: "Total Orders", value: totalRequests, trend: "+18.1%", isUp: true, icon: <ShoppingBag className="w-5 h-5" /> },
        { label: "Completion Rate", value: `${((completedRequests / (totalRequests || 1)) * 100).toFixed(1)}%`, trend: "-0.5%", isUp: false, icon: <BarChart3 className="w-5 h-5" /> },
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Business Intelligence</p>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                        Dine<span className="text-indigo-600">Insights</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center">
                        <Calendar className="w-3 h-3 mr-2" />
                        Analyzing performance for the last 30 days
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="bg-white border border-slate-200 rounded-full p-1 flex">
                        {["24h", "7d", "30d", "All"].map(t => (
                            <button
                                key={t}
                                onClick={() => setRange(t)}
                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${range === t ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button className="bg-white border border-slate-200 p-3 rounded-full hover:bg-slate-50 transition-all text-slate-600 shadow-sm">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Metrics Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-4 bg-slate-50 rounded-2xl text-slate-900 group-hover:scale-110 transition-transform">
                                {m.icon}
                            </div>
                            <div className={`flex items-center px-3 py-1 rounded-full text-[10px] font-black ${m.isUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                {m.isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {m.trend}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight">{m.value}</p>
                        
                        <div className="absolute bottom-0 right-0 w-20 h-20 bg-slate-50/50 rounded-tl-[3rem] -z-0 opacity-40 group-hover:scale-110 transition-transform" />
                    </motion.div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Chart Placeholder */}
                <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Revenue Growth</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Stripe-style Performance Monitoring</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Gross Revenue</span>
                        </div>
                    </div>

                    <div className="h-[350px] flex items-end justify-between space-x-4">
                        {[40, 65, 45, 80, 55, 90, 75, 85, 60, 95, 80, 100].map((v, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${v}%` }}
                                    transition={{ delay: 0.5 + (i * 0.05), type: "spring", damping: 15 }}
                                    className="w-full bg-indigo-600/10 group-hover:bg-indigo-600 transition-all rounded-full relative"
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md">
                                        ₹{(v * 1200).toLocaleString()}
                                    </div>
                                </motion.div>
                                <span className="text-[8px] font-black text-slate-300 uppercase mt-4">Mar {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Items / Peak Hours */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl overflow-hidden relative group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black tracking-tight mb-6">Peak Operational Windows</h3>
                            <div className="space-y-6">
                                {[
                                    { window: "Breakfast", span: "08:00 - 10:00", load: 85 },
                                    { window: "Lunch Peak", span: "13:00 - 15:00", load: 92 },
                                    { window: "Dinner Drift", span: "20:00 - 22:00", load: 78 }
                                ].map((w) => (
                                    <div key={w.window} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black uppercase tracking-widest">{w.window}</p>
                                            <p className="text-[10px] font-bold opacity-60">{w.load}% Load</p>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${w.load}%` }}
                                                transition={{ delay: 1, duration: 1.5 }}
                                                className="h-full bg-indigo-400"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-0" />
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Velocity Report</h3>
                        <div className="space-y-4">
                            {[
                                { name: "Veg Thali", cat: "Main Course", trend: "+14%" },
                                { name: "Cold Coffee", cat: "Beverages", trend: "+28%" },
                                { name: "Paneer Tikka", cat: "Starters", trend: "+5%" }
                            ].map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mr-4 font-black text-slate-900 group-hover:scale-110 transition-transform">
                                            {item.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.cat}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600">{item.trend}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:scale-[1.02] transition-transform active:scale-95">
                            Full Catalog Performance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
