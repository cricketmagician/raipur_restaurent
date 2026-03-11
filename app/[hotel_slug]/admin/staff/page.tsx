"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useHotelBranding, getAllHotelStaff, updateStaffRole, UserProfile } from "@/utils/store";
import { Users, Shield, Utensils, Shirt, Bell, Check, Loader2, Search, ArrowLeft, MoreVertical, Edit2, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StaffManagement() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading: brandingLoading } = useHotelBranding(hotelSlug);

    const [staff, setStaff] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadStaff = async () => {
        if (!branding?.id) return;
        setLoading(true);
        const { data, error } = await getAllHotelStaff(branding.id);
        if (error) {
            console.error("Failed to load staff:", error);
            // Don't alert on UUID mismatch in demo mode to avoid spam, but log it
        }
        if (data) setStaff(data);
        setLoading(false);
    };

    useEffect(() => {
        if (branding?.id) {
            loadStaff();
        }
    }, [branding?.id]);

    const handleRoleUpdate = async (profileId: string, newRole: string) => {
        setUpdatingId(profileId);
        const { error } = await updateStaffRole(profileId, newRole);
        if (!error) {
            await loadStaff();
        }
        setUpdatingId(null);
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4" />;
            case 'reception': return <Bell className="w-4 h-4" />;
            case 'kitchen': return <Utensils className="w-4 h-4" />;
            case 'housekeeping': return <Shirt className="w-4 h-4" />;
            default: return <Users className="w-4 h-4" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-slate-900 text-white';
            case 'reception': return 'bg-blue-100 text-blue-800';
            case 'kitchen': return 'bg-amber-100 text-amber-800';
            case 'housekeeping': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredStaff = staff.filter(s =>
        s.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (brandingLoading || loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Staff Roles</h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Assign departments to your team members</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => {
                            const link = `${window.location.origin}/${hotelSlug}/staff/register`;
                            navigator.clipboard.writeText(link);
                            alert("Staff Registration Link copied to clipboard! Send this to your team.");
                        }}
                        className="flex items-center px-5 py-3 rounded-2xl font-bold bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all text-xs"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Registration Link
                    </button>

                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search staff..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID / Email</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Role</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Set Department</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-20 text-center text-slate-300 font-bold italic">No staff members found...</td>
                                </tr>
                            ) : (
                                filteredStaff.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mr-4 text-slate-400">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{member.user_id}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linked Account</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${getRoleColor(member.role)}`}>
                                                {getRoleIcon(member.role)}
                                                <span className="ml-2">{member.role}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-end space-x-2">
                                                {['admin', 'reception', 'kitchen', 'housekeeping'].map((role) => (
                                                    <button
                                                        key={role}
                                                        onClick={() => handleRoleUpdate(member.id, role)}
                                                        disabled={updatingId === member.id || member.role === role}
                                                        className={`p-2 rounded-xl transition-all border ${member.role === role ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'} disabled:opacity-50`}
                                                        title={`Set to ${role}`}
                                                    >
                                                        {updatingId === member.id && member.role !== role ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            getRoleIcon(role)
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mr-4 mt-1" />
                <div>
                    <p className="text-sm font-bold text-blue-900">Security Note:</p>
                    <p className="text-xs text-blue-700 font-medium mt-1 leading-relaxed">
                        Roles control dashboard access and real-time request filtering. Only Admins can access branding and staff management settings. Staff accounts are automatically redirected based on their active role upon login.
                    </p>
                </div>
            </div>
        </div>
    );
}
