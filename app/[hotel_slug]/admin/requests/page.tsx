"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useSupabaseRequests, updateSupabaseRequestStatus, HotelRequest, useHotelBranding } from "@/utils/store";
import { StatusBadge, RequestStatus } from "@/components/StatusBadge";
import { CheckCircle, Eye, Utensils, Bell } from "lucide-react";
import { RequestDetailModal } from "@/components/RequestDetailModal";

export default function RequestsPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id);
    const [selectedRequest, setSelectedRequest] = useState<HotelRequest | null>(null);

    const updateStatus = async (id: string, newStatus: RequestStatus) => {
        await updateSupabaseRequestStatus(id, newStatus);
    };

    const getRowStyle = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes("restaurant") || lowerType.includes("room service")) {
            return "bg-amber-50/40 hover:bg-amber-50 border-l-4 border-l-amber-400";
        }
        return "hover:bg-gray-50/80 border-l-4 border-l-transparent";
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight" style={{ color: branding?.primaryColor }}>System Archive & Logs</h1>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Location</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Type & Detail</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Logged At</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-gray-400 font-medium font-mono lowercase tracking-tighter">no log entries found...</td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} className={`border-b border-gray-50 last:border-none transition-colors group ${getRowStyle(req.type)}`}>
                                    <td className="p-5">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold mr-3 text-xs">
                                                {req.room}
                                            </div>
                                            <span className="font-bold text-gray-900">Room {req.room}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 max-w-xs">
                                        <div className="flex items-center mb-1">
                                            {(req.type.toLowerCase().includes("restaurant") || req.type.toLowerCase().includes("room service")) ?
                                                <Utensils className="w-4 h-4 mr-2 text-amber-600" /> :
                                                <Bell className="w-4 h-4 mr-2 text-blue-600" />
                                            }
                                            <span className="font-bold text-gray-900">{req.type}</span>
                                        </div>
                                        {req.notes && (
                                            <div className="text-xs text-gray-500 line-clamp-1 italic font-medium">"{req.notes}"</div>
                                        )}
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="text-xs font-medium text-gray-400">{req.time}</span>
                                    </td>
                                    <td className="p-5">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>

                                            {req.status === "Pending" && (
                                                <button
                                                    onClick={() => updateStatus(req.id, "Assigned")}
                                                    className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:shadow-lg transition-all active:scale-95"
                                                    style={{ backgroundColor: branding?.primaryColor }}
                                                >
                                                    Accept
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <RequestDetailModal
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
            />
        </div>
    );
}
