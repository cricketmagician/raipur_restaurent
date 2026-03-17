"use client";

import { useEffect, useState, Suspense, createContext, useContext } from "react";
import { useSearchParams, useParams, usePathname } from "next/navigation";
import { useHotelBranding, supabase } from "@/utils/store";
import { Key, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GuestContextType {
    roomNumber: string;
    checkoutDate?: string;
    checkoutTime?: string;
    numGuests?: number;
    checkedInAt?: number | null;
    orderMode: "dine-in" | "takeaway";
    sessionEnded: boolean;
    switchToDineIn: () => void;
    switchToTakeaway: () => void;
}

const GuestContext = createContext<GuestContextType>({
    roomNumber: "",
    orderMode: "dine-in",
    sessionEnded: false,
    switchToDineIn: () => {},
    switchToTakeaway: () => {},
});

export const useGuestRoom = () => useContext(GuestContext);

const isTakeawayRoom = (value?: string | null) => {
    const normalized = value?.trim().toLowerCase();
    return normalized === "takeaway" || normalized === "takeout";
};


function AuthLogic({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading: brandingLoading } = useHotelBranding(hotelSlug);

    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [roomNumber, setRoomNumber] = useState<string>("");
    const [checkoutDate, setCheckoutDate] = useState<string>("");
    const [checkoutTime, setCheckoutTime] = useState<string>("");
    const [numGuests, setNumGuests] = useState<number>(1);
    const [checkedInAt, setCheckedInAt] = useState<number | null>(null);
    const [error, setError] = useState<string>("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [sessionEnded, setSessionEnded] = useState(false);

    const isBillPage = pathname === `/${hotelSlug}/guest/bill`;

    const setRoomInUrl = (nextRoom: string | null) => {
        const currentUrl = new URL(window.location.href);

        if (nextRoom && isTakeawayRoom(nextRoom)) {
            currentUrl.searchParams.set("room", "Takeaway");
        } else {
            currentUrl.searchParams.delete("room");
        }

        window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
    };

    const switchToTakeaway = () => {
        if (!hotelSlug) return;

        if (roomNumber && !isTakeawayRoom(roomNumber)) {
            localStorage.setItem(`hotel_dinein_room_${hotelSlug}`, roomNumber);
        }

        localStorage.setItem(`hotel_room_${hotelSlug}`, "Takeaway");
        localStorage.removeItem(`hotel_pin_${hotelSlug}`);
        setRoomNumber("Takeaway");
        setIsVerified(true);
        setSessionEnded(false);
        setRoomInUrl("Takeaway");
    };

    const switchToDineIn = () => {
        if (!hotelSlug) return;

        const savedDineInRoom = localStorage.getItem(`hotel_dinein_room_${hotelSlug}`);
        if (savedDineInRoom && !isTakeawayRoom(savedDineInRoom)) {
            localStorage.setItem(`hotel_room_${hotelSlug}`, savedDineInRoom);
            localStorage.removeItem(`hotel_pin_${hotelSlug}`);
            setRoomNumber(savedDineInRoom);
            setIsVerified(true);
            setSessionEnded(false);
            setRoomInUrl(null);
            return;
        }

        localStorage.removeItem(`hotel_room_${hotelSlug}`);
        localStorage.removeItem(`hotel_pin_${hotelSlug}`);
        setRoomNumber("");
        setIsVerified(false);
        setSessionEnded(false);
        setRoomInUrl(null);
    };

    useEffect(() => {
        const timestamp = new Date().toLocaleTimeString();
        if (brandingLoading || !hotelSlug) {
            console.log(`[${timestamp}] AuthLogic: Waiting for branding or slug...`);
            return;
        }

        if (!branding?.id) {
            console.warn(`[${timestamp}] AuthLogic: Branding loaded but no ID found for slug "${hotelSlug}".`);
            setIsVerified(false);
            return;
        }

        const urlRoom = searchParams?.get("room");
        const storedRoom = localStorage.getItem(`hotel_room_${hotelSlug}`);
        const storedCheckoutDate = localStorage.getItem(`hotel_checkout_date_${hotelSlug}`);
        const storedCheckoutTime = localStorage.getItem(`hotel_checkout_time_${hotelSlug}`);
        const storedNumGuests = localStorage.getItem(`hotel_num_guests_${hotelSlug}`);
        const storedCheckedInAt = localStorage.getItem(`hotel_checked_in_at_${hotelSlug}`);

        console.table({
            Context: "AuthLogic Storage Check",
            URL_Room: urlRoom,
            Stored_Room: storedRoom,
            Stored_Date: storedCheckoutDate
        });

        const effectiveRoom = urlRoom || storedRoom;

        if (effectiveRoom) {
            setRoomNumber(effectiveRoom);
            setSessionEnded(false);
            if (!isTakeawayRoom(effectiveRoom)) {
                localStorage.setItem(`hotel_dinein_room_${hotelSlug}`, effectiveRoom);
            }
            if (storedCheckoutDate) setCheckoutDate(storedCheckoutDate);
            if (storedCheckoutTime) setCheckoutTime(storedCheckoutTime);
            if (storedNumGuests) setNumGuests(parseInt(storedNumGuests));
            if (storedCheckedInAt) {
                const parsed = parseInt(storedCheckedInAt);
                setCheckedInAt(parsed);
                console.log(`[${timestamp}] AuthLogic: Restored session timestamp: ${parsed}`);
            }

            console.log(`[${timestamp}] AuthLogic: Auto-verify for Room: ${effectiveRoom}`);
            setIsVerified(true);
            localStorage.setItem(`hotel_room_${hotelSlug}`, effectiveRoom);
            localStorage.removeItem(`hotel_pin_${hotelSlug}`); // Ensure no stray pin
        } else {
            setIsVerified(false);
        }
    }, [branding?.id, hotelSlug, searchParams, brandingLoading]);

    // REAL-TIME SESSION MONITORING
    // If the room is vacated or the checked-in timestamp changes (Session Reset), 
    // clear the guest's local state and storage
    useEffect(() => {
        if (!branding?.id || !roomNumber || !isVerified) return;

        const channel = supabase
            .channel(`guest_session_${branding.id}_${roomNumber}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
                filter: `hotel_id=eq.${branding.id}`
            }, (payload: any) => {
                const updatedRoom = payload.new;
                if (updatedRoom.room_number === roomNumber) {
                    // Check if either room is vacated or checked_in_at has changed/cleared
                    const hasSessionEnded = !updatedRoom.is_occupied || updatedRoom.checked_in_at === null;
                    const hasNewSessionStarted = checkedInAt && updatedRoom.checked_in_at !== checkedInAt;

                    if (hasSessionEnded || hasNewSessionStarted) {
                        console.log("AuthLogic: Session has ended or changed. Clearing local state.");
                        // Clear storage
                        localStorage.removeItem(`hotel_room_${hotelSlug}`);
                        localStorage.removeItem(`hotel_checked_in_at_${hotelSlug}`);
                        localStorage.removeItem(`hotel_checkout_date_${hotelSlug}`);
                        localStorage.removeItem(`hotel_checkout_time_${hotelSlug}`);
                        localStorage.removeItem(`hotel_num_guests_${hotelSlug}`);
                        
                        setSessionEnded(true);

                        // Keep the bill page alive so the guest can see final settlement,
                        // but lock everything else back down immediately.
                        if (!isBillPage) {
                            setIsVerified(false);
                            setCheckedInAt(null);
                            setRoomNumber("");
                        }
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [branding?.id, roomNumber, isVerified, checkedInAt, hotelSlug, isBillPage]);

    useEffect(() => {
        if (!sessionEnded || isBillPage) {
            return;
        }

        setIsVerified(false);
        setCheckedInAt(null);
        setRoomNumber("");
    }, [sessionEnded, isBillPage]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!branding?.id || !roomNumber) {
            setError("Please enter Room Number.");
            return;
        }

        const timestamp = Date.now();
        localStorage.setItem(`hotel_room_${hotelSlug}`, roomNumber);
        if (!isTakeawayRoom(roomNumber)) {
            localStorage.setItem(`hotel_dinein_room_${hotelSlug}`, roomNumber);
        }
        
        // Only set checkedInAt if it doesn't exist yet to preserve the session start
        if (!localStorage.getItem(`hotel_checked_in_at_${hotelSlug}`)) {
            localStorage.setItem(`hotel_checked_in_at_${hotelSlug}`, timestamp.toString());
            setCheckedInAt(timestamp);
        }
        
        localStorage.removeItem(`hotel_pin_${hotelSlug}`);
        setSessionEnded(false);
        setIsVerified(true);
        setIsVerifying(false);
    };

    if (isVerified === null || brandingLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div
                    className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"
                    style={{
                        borderLeftColor: branding?.primaryColor,
                        borderRightColor: branding?.primaryColor,
                        borderBottomColor: branding?.primaryColor,
                        borderTopColor: 'transparent'
                    }}
                ></div>
            </div>
        );
    }

    if (branding === null) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
                <div className="max-w-sm">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600 mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Property Not Found</h1>
                    <p className="text-slate-500 font-medium mb-8">This digital concierge link is invalid or the property has been deactivated. Please contact the front desk.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest active:scale-95 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
                <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from),_transparent_50%)] from-blue-50/50 to-transparent"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600" style={{ backgroundColor: branding?.primaryColor ? `${branding.primaryColor}20` : undefined, color: branding?.primaryColor }}>
                        <Key className="w-8 h-8" />
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome</h1>
                    <p className="text-slate-500 font-medium mb-8">Please enter your room or table number to access the digital menu.</p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-5">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Room / Table Number</label>
                            <input
                                type="text"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 font-bold text-lg text-slate-900 transition-colors"
                                readOnly={!!searchParams?.get("room")}
                                placeholder="E.g. 5 or 101"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full mt-4 py-4 rounded-2xl text-white font-black text-lg disabled:opacity-50 flex justify-center items-center group overflow-hidden transition-all shadow-lg active:scale-95"
                            style={{ backgroundColor: branding?.primaryColor || '#2563eb' }}
                        >
                            {isVerifying ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Unlock Menu"
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <GuestContext.Provider
            value={{
                roomNumber,
                checkoutDate,
                checkoutTime,
                numGuests,
                checkedInAt,
                orderMode: isTakeawayRoom(roomNumber) ? "takeaway" : "dine-in",
                sessionEnded,
                switchToDineIn,
                switchToTakeaway,
            }}
        >
            {children}
        </GuestContext.Provider>
    );
}

export function GuestAuthWrapper({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <AuthLogic>{children}</AuthLogic>
        </Suspense>
    );
}
