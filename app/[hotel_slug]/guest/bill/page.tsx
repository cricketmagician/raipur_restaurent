"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, Receipt, CheckCircle, Download, RefreshCw, BellRing, Clock3, ShieldCheck } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSupabaseRequests, requestSupabaseBill, useHotelBranding, isBillRequest } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { useTheme } from "@/utils/themes";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/StatusBadge";

const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 0 });

export default function BillPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { roomNumber, checkedInAt, sessionEnded } = useGuestRoom();
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    const requests = useSupabaseRequests(branding?.id, roomNumber, checkedInAt);

    const [isRequestingBill, setIsRequestingBill] = useState(false);

    const sessionRequests = useMemo(() => (
        requests.filter((request) => {
            const isCorrectRoom = request.room === roomNumber;
            const isCurrentSession = !checkedInAt || request.timestamp >= checkedInAt;
            return isCorrectRoom && isCurrentSession;
        })
    ), [requests, roomNumber, checkedInAt]);

    const sortedSessionRequests = useMemo(() => (
        [...sessionRequests].sort((left, right) => right.timestamp - left.timestamp)
    ), [sessionRequests]);

    const billSignalRequests = sortedSessionRequests.filter((request) => isBillRequest(request.type));
    const latestBillRequest = billSignalRequests[0] || null;
    const billableRequests = sortedSessionRequests.filter((request) => (request.price || 0) > 0 && !isBillRequest(request.type));
    const unpaidRequests = billableRequests.filter((request) => !request.is_paid);

    const totalAmount = billableRequests.reduce((sum, request) => sum + (request.total || 0), 0);
    const amountDue = unpaidRequests.reduce((sum, request) => sum + (request.total || 0), 0);
    const serviceCharge = amountDue * 0.05;
    const vatAmount = (amountDue + serviceCharge) * 0.12;
    const grandTotal = amountDue + serviceCharge + vatAmount;

    const isFullyPaid = billableRequests.length > 0 && billableRequests.every((request) => request.is_paid);
    const hasOpenBillRequest = !!latestBillRequest && latestBillRequest.status !== "Completed";
    const isSettled = isFullyPaid || (sessionEnded && !!latestBillRequest);

    const requestLabel = (() => {
        if (isSettled) return "Bill Settled";
        if (isRequestingBill) return "Sending Bill Request";
        if (!latestBillRequest) return "Request Bill";
        if (latestBillRequest.status === "Pending") return "Bill Requested";
        if (latestBillRequest.status === "Assigned") return "Desk Accepted";
        if (latestBillRequest.status === "In Progress") return "Settlement In Progress";
        return "Request Bill";
    })();

    const requestDescription = (() => {
        if (isSettled) return "The team has settled this session. If you need anything else, please start a fresh order.";
        if (!latestBillRequest) return "You can only request the bill here. The host settles and clears the table from the admin side.";
        if (latestBillRequest.status === "Pending") return "Your request is live. A staff member will come to your table shortly.";
        if (latestBillRequest.status === "Assigned") return "A staff member has picked up your bill request and is heading your way.";
        if (latestBillRequest.status === "In Progress") return "Your table is being settled now. Please keep this screen open for a moment.";
        return "The team is handling your live bill.";
    })();

    const handlePrint = () => {
        window.print();
    };

    const handleRequestBill = async () => {
        if (!branding?.id || !roomNumber || grandTotal <= 0 || hasOpenBillRequest || isSettled) {
            return;
        }

        setIsRequestingBill(true);
        await requestSupabaseBill(
            branding.id,
            roomNumber,
            grandTotal,
            `Guest requested bill for Table ${roomNumber}. Current live total: ₹${grandTotal.toFixed(0)}`
        );
        setIsRequestingBill(false);
    };

    return (
        <div
            className="pb-36 pt-6 min-h-screen px-4"
            style={{ backgroundColor: theme.background, color: theme.primary, fontFamily: theme.fontSans }}
        >
            <div className="flex items-center justify-between mb-6 no-print">
                <button
                    onClick={() => router.back()}
                    className="w-11 h-11 rounded-full bg-white border flex items-center justify-center shadow-sm active:scale-90 transition-all"
                    style={{ borderColor: `${theme.primary}10`, color: theme.primary }}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-40">Live Bill</p>
                    <h1 className="text-lg font-black tracking-tight">Table {roomNumber}</h1>
                </div>

                <button
                    onClick={handlePrint}
                    className="w-11 h-11 rounded-full bg-white border flex items-center justify-center transition-all shadow-sm"
                    style={{ borderColor: `${theme.primary}08`, color: `${theme.primary}66` }}
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 mb-5 relative overflow-hidden shadow-xl border"
                style={{ backgroundColor: theme.primary, color: theme.background, borderRadius: theme.radius, borderColor: "transparent" }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_40%)]" />
                <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-60 mb-2">Amount Due</p>
                            <h2 className="text-4xl font-black tracking-tight">₹{formatCurrency(grandTotal)}</h2>
                        </div>
                        <div className="px-3 py-2 rounded-2xl border border-white/10 bg-white/10 text-right">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70">Session</p>
                            <p className="text-xs font-black">{billableRequests.length} line items</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-2xl bg-white/10 px-3 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-60 mb-1">Items</p>
                            <p className="text-sm font-black">₹{formatCurrency(amountDue)}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-3 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-60 mb-1">Service</p>
                            <p className="text-sm font-black">₹{formatCurrency(serviceCharge)}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-3 py-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-60 mb-1">Tax</p>
                            <p className="text-sm font-black">₹{formatCurrency(vatAmount)}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div
                className="mb-5 rounded-[2rem] border bg-white/90 backdrop-blur-xl p-5 shadow-sm"
                style={{ borderColor: `${theme.primary}08` }}
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-40 mb-2">Billing Status</p>
                        <h3 className="text-xl font-black tracking-tight">
                            {isSettled ? "Settled By Staff" : hasOpenBillRequest ? "Awaiting Staff" : "Ready To Request"}
                        </h3>
                    </div>
                    {latestBillRequest ? <StatusBadge status={latestBillRequest.status} /> : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-tight border bg-slate-100 text-slate-500 border-slate-200">
                            Open
                        </span>
                    )}
                </div>

                <div className="flex items-start gap-3">
                    <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: isSettled ? `${theme.secondary}22` : `${theme.primary}0D`, color: isSettled ? theme.secondary : theme.primary }}
                    >
                        {isSettled ? <ShieldCheck className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm leading-6">{requestDescription}</p>
                        {latestBillRequest?.time && (
                            <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] opacity-40">
                                Last bill signal at {latestBillRequest.time}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div
                className="bg-white p-5 space-y-4 mb-5 border shadow-sm"
                style={{ borderRadius: theme.radius, borderColor: `${theme.primary}08` }}
            >
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-45">Net Total</span>
                    <span className="font-black text-lg">₹{formatCurrency(amountDue)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-45">Service Charge</span>
                    <span className="font-black text-lg">₹{formatCurrency(serviceCharge)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-45">Taxes</span>
                    <span className="font-black text-lg">₹{formatCurrency(vatAmount)}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-[0.24em]">Grand Total</span>
                    <span className="text-3xl font-black tracking-tight">₹{formatCurrency(grandTotal)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-black tracking-tight">Bill Items</h3>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                    {billableRequests.length} entries
                </span>
            </div>

            <div className="space-y-3 mb-6">
                {billableRequests.length > 0 ? (
                    billableRequests.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="bg-white p-4 rounded-[1.75rem] border shadow-sm"
                            style={{ borderColor: `${theme.primary}08` }}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-black text-base truncate">{request.type}</h4>
                                        {request.is_paid && (
                                            <span className="text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-[0.18em] bg-emerald-50 text-emerald-600 border-emerald-100">
                                                Settled
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] opacity-35 mb-2">
                                        <Clock3 className="w-3.5 h-3.5" />
                                        {request.time}
                                    </div>
                                    {request.notes && (
                                        <p className="text-sm leading-6 opacity-70">{request.notes}</p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="font-black text-lg">₹{formatCurrency(request.total || 0)}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-16 text-center border border-dashed rounded-[2rem] bg-white/60" style={{ borderColor: `${theme.primary}10` }}>
                        <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No billable items in this session yet.</p>
                    </div>
                )}
            </div>

            {latestBillRequest && (
                <div
                    className="bg-white p-4 rounded-[1.75rem] border shadow-sm mb-6"
                    style={{ borderColor: `${theme.primary}08` }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] opacity-40 mb-2">Latest Bill Request</p>
                            <h4 className="font-black text-base mb-1">{latestBillRequest.type}</h4>
                            <p className="text-sm opacity-70">{latestBillRequest.notes || "The front desk has your live bill request."}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <StatusBadge status={latestBillRequest.status} />
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleRequestBill}
                disabled={isRequestingBill || grandTotal === 0 || hasOpenBillRequest || isSettled}
                className="w-full py-5 font-black uppercase tracking-[0.22em] text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:active:scale-100 no-print"
                style={{ backgroundColor: theme.primary, color: theme.background, borderRadius: theme.radius }}
            >
                {isRequestingBill ? (
                    <span className="flex items-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mr-3">
                            <RefreshCw className="w-5 h-5" />
                        </motion.div>
                        {requestLabel}
                    </span>
                ) : isSettled ? (
                    <span className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3" />
                        {requestLabel}
                    </span>
                ) : (
                    <span className="flex items-center">
                        <BellRing className="w-5 h-5 mr-3" />
                        {requestLabel}
                    </span>
                )}
            </button>

            {totalAmount > 0 && (
                <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] opacity-35 mt-4">
                    Staff-only settlement. Guest can request bill once per session.
                </p>
            )}
        </div>
    );
}
