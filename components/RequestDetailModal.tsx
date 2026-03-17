import React from 'react';
import { X, MapPin, Clock, Info, Utensils, Bell, ShoppingBag, CreditCard, CheckCircle } from "lucide-react";
import { StatusBadge, RequestStatus } from "./StatusBadge";
import { HotelRequest, useSupabaseRequests, settleTableRequests, isDiningRequest, isBillRequest } from "@/utils/store";
import { motion, AnimatePresence } from "framer-motion";

interface RequestDetailModalProps {
    request?: HotelRequest | null;
    roomNumber?: string | null;
    hotelId: string;
    onClose: () => void;
}

export function RequestDetailModal({ request, roomNumber, hotelId, onClose }: RequestDetailModalProps) {
    const allRequests = useSupabaseRequests(hotelId);
    const [isSettling, setIsSettling] = React.useState(false);

    const targetRoom = request?.room || roomNumber;
    if (!targetRoom) return null;

    // Aggregate all requests for this specific table that are not completed or not paid
    const tableRequests = allRequests.filter(r => 
        r.room === targetRoom && 
        (r.status !== 'Completed' || !r.is_paid) &&
        (r.price || 0) > 0 &&
        !isBillRequest(r.type) // Don't sum the bill signals themselves
    );

    const totalBill = tableRequests.reduce((sum, r) => sum + (r.total || 0), 0);

    const isRestaurant = request ? isDiningRequest(request.type) : false;
    const isTakeaway = targetRoom.toLowerCase() === "takeaway";
    const isBillingDesk = request ? isBillRequest(request.type) : false;

    const handleSettle = async () => {
        if (!window.confirm(`Mark all items for Table ${targetRoom} as PAID and complete the session?`)) return;
        setIsSettling(true);
        await settleTableRequests(hotelId, targetRoom);
        setIsSettling(false);
        onClose();
    };

    let headerBgClass = "bg-blue-50";
    let iconBgClass = "bg-blue-100 text-blue-700";
    if (isTakeaway) {
        headerBgClass = "bg-purple-100";
        iconBgClass = "bg-purple-200 text-purple-700";
    } else if (isBillingDesk) {
        headerBgClass = "bg-emerald-50";
        iconBgClass = "bg-emerald-100 text-emerald-700";
    } else if (isRestaurant) {
        headerBgClass = "bg-amber-50";
        iconBgClass = "bg-amber-100 text-amber-700";
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col"
                >
                    <div className={`p-8 flex justify-between items-center ${headerBgClass}`}>
                        <div className="flex items-center">
                            <div className={`p-4 rounded-2xl mr-4 ${iconBgClass} shadow-sm`}>
                                {isTakeaway ? <ShoppingBag className="w-6 h-6" /> : (isBillingDesk ? <CreditCard className="w-6 h-6" /> : (isRestaurant ? <Utensils className="w-6 h-6" /> : <Bell className="w-6 h-6" />))}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {request ? (isTakeaway ? "Takeaway Order" : (isBillingDesk ? "Live Bill Request" : (isRestaurant ? "Dining Order" : "Service Request"))) : "Table Detail"}
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-70">Table {targetRoom} • {request?.time || 'Current Session'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 overflow-y-auto flex-1">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                             <div className="flex items-center">
                                <Clock className="w-4 h-4 text-slate-400 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</span>
                             </div>
                             {request ? (
                                 <StatusBadge status={request.status} />
                             ) : (
                                 <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active Session</span>
                             )}
                        </div>

                        {/* Live Itemized Bill Section */}
                        {tableRequests.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Live Table Bill</h3>
                                <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
                                    <div className="p-5 space-y-3">
                                        {tableRequests.map((r) => (
                                            <div key={r.id} className="space-y-2">
                                                {r.items && Array.isArray(r.items) ? (
                                                    r.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center pl-4 py-1 border-l border-slate-200">
                                                            <div className="flex items-center">
                                                                <span className="text-xs font-bold text-slate-600">{item.quantity}x {item.title}</span>
                                                            </div>
                                                            <span className="text-xs font-black text-slate-900">₹{item.total?.toLocaleString()}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3" />
                                                            <span className="text-sm font-bold text-slate-700">{r.type}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-slate-900">₹{r.total?.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-slate-100/50 p-5 mt-2 flex justify-between items-center border-t border-slate-200/50">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Total Unpaid Amount</span>
                                        <span className="text-xl font-black text-blue-600">₹{totalBill.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={`p-6 rounded-[2rem] border ${isTakeaway ? 'bg-purple-50/30 border-purple-100' : isRestaurant ? 'bg-amber-50/30 border-amber-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center mb-4 text-gray-900 font-black text-xs uppercase tracking-widest">
                                <Info className="w-4 h-4 mr-2 text-primary" />
                                {isBillingDesk ? "Billing Notes" : (isRestaurant ? "Order Notes" : "Request Details")}
                            </div>
                            <div className="text-gray-700 leading-relaxed font-bold text-[15px]">
                                {request?.notes || <span className="text-gray-400 italic font-medium">No special instructions provided.</span>}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border-t border-gray-50 flex flex-col md:flex-row gap-3">
                        <button
                            onClick={handleSettle}
                            disabled={isSettling || (tableRequests.length === 0 && !isBillingDesk)}
                            className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:grayscale"
                        >
                            {isSettling ? "Processing..." : (
                                <><CreditCard className="w-4 h-4 mr-2" /> {isBillingDesk ? "Settle Bill & Clear Table" : "Mark as Paid & Complete"}</>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
