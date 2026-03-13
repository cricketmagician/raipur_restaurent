"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, QrCode, ExternalLink, Search, Loader2, Hotel, CheckCircle2, XCircle } from "lucide-react";
import { useHotelBranding, getHotelRooms, addRoom, deleteRoom, Room, useHotelRooms } from "@/utils/store";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { RequestDetailModal } from "@/components/RequestDetailModal";

export default function TableManagement() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading: brandingLoading } = useHotelBranding(hotelSlug);

    const { rooms, loading: roomsLoading, refresh: fetchRooms } = useHotelRooms(branding?.id);
    const [searchQuery, setSearchQuery] = useState("");
    const [newRoomNumber, setNewRoomNumber] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [exportRoom, setExportRoom] = useState<Room | null>(null);
    const [detailRoom, setDetailRoom] = useState<Room | null>(null);

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branding?.id || !newRoomNumber.trim()) return;

        setIsAdding(true);
        const { error } = await addRoom(branding.id, newRoomNumber.trim());
        if (!error) {
            setNewRoomNumber("");
        } else {
            alert(error.message || "Failed to add room");
        }
        setIsAdding(false);
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!branding?.id || !window.confirm("Are you sure you want to delete this table?")) return;

        const { error } = await deleteRoom(roomId, branding.id);
        if (!error) {
            // UI will update via useHotelRooms subscription
        }
    };

    const filteredRooms = rooms.filter(room => 
        room.room_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (brandingLoading || (roomsLoading && rooms.length === 0)) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tables & QR Codes</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Manage your physical tables and generate guest access codes</p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search Tables..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <form onSubmit={handleAddRoom} className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Table #"
                            value={newRoomNumber}
                            onChange={(e) => setNewRoomNumber(e.target.value)}
                            className="w-24 bg-white border border-slate-200 rounded-2xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/10 transition-all outline-none font-bold"
                        />
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4 mr-2" /> {isAdding ? 'Adding...' : 'Add Table'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredRooms.map((room) => (
                        <motion.div
                            key={room.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center">
                                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg mr-4">
                                        {room.room_number}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 leading-tight">Table {room.room_number}</h3>
                                        <div className="flex items-center mt-1">
                                            {room.is_occupied ? (
                                                <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Occupied
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                    <XCircle className="w-3 h-3 mr-1" /> Vacant
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteRoom(room.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center mb-6 relative overflow-hidden group/qr border border-slate-50 shadow-inner">
                                <QRCode
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${hotelSlug}/welcome?room=${room.room_number}`}
                                    size={160}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover/qr:opacity-100 transition-all flex items-center justify-center">
                                    <button 
                                        onClick={() => window.open(`/${hotelSlug}/welcome?room=${room.room_number}`, '_blank')}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-xl"
                                    >
                                        <ExternalLink className="w-3 h-3 mr-2" /> Open Preview
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setExportRoom(room)}
                                    className="flex items-center justify-center py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    <QrCode className="w-3 h-3 mr-2" /> HD Export
                                </button>
                                <button
                                    onClick={() => setDetailRoom(room)}
                                    className="flex items-center justify-center py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    <Hotel className="w-3 h-3 mr-2" /> Detail
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Simple Modal for HD QR */}
            <AnimatePresence>
                {exportRoom && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl"
                        >
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Table {exportRoom.room_number}</h2>
                            <p className="text-slate-500 font-medium mb-8">Scan to open digital menu</p>
                            
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-inner mb-8 flex justify-center">
                                <QRCode
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${hotelSlug}/welcome?room=${exportRoom.room_number}`}
                                    size={200}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>

                            <button
                                onClick={() => setExportRoom(null)}
                                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold transition-all active:scale-95"
                            >
                                Close Export
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <RequestDetailModal
                roomNumber={detailRoom?.room_number}
                hotelId={branding?.id || ""}
                onClose={() => setDetailRoom(null)}
            />
        </div>
    );
}
