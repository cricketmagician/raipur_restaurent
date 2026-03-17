/* eslint-disable */
import { useState, useEffect } from 'react';
export { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { RequestStatus } from '@/components/StatusBadge';
import { useRealtimeCollection, type RealtimeSyncStatus } from '@/utils/realtime';

// --- Types ---
export interface HotelBranding {
    id: string;
    slug: string;
    name: string;
    logo?: string;
    logoImage?: string;
    primaryColor: string;
    accentColor: string;
    wifiName?: string;
    wifiPassword?: string;
    receptionPhone?: string;
    bgPattern?: string;
    breakfastStart?: string;
    breakfastEnd?: string;
    lunchStart?: string;
    lunchEnd?: string;
    dinnerStart?: string;
    dinnerEnd?: string;
    lateCheckoutPhone?: string;
    lateCheckoutCharge1?: string;
    lateCheckoutCharge2?: string;
    lateCheckoutCharge3?: string;
    checkoutMessage?: string;
    googleReviewLink?: string;
    welcomeMessage?: string;
    address?: string;
    guestTheme?: 'CAFE' | 'FAST_FOOD' | 'FINE_DINE';
}

export interface SpecialOffer {
    id: string;
    hotel_id: string;
    title: string;
    description: string;
    image_url: string;
    is_active: boolean;
    created_at?: string;
}

export interface UserProfile {
    id: string;
    user_id: string;
    hotel_id: string;
    full_name?: string;
    role: 'admin' | 'reception' | 'kitchen' | 'housekeeping' | 'staff' | 'waiter';
}

const VALID_USER_ROLES = ['admin', 'reception', 'kitchen', 'housekeeping', 'staff', 'waiter'] as const;

export function normalizeUserRole(role: string | null | undefined): UserProfile['role'] {
    const normalized = role?.trim().toLowerCase();
    if (normalized && VALID_USER_ROLES.includes(normalized as UserProfile['role'])) {
        return normalized as UserProfile['role'];
    }

    return 'staff';
}

const normalizeUserProfile = (profile: any): UserProfile => ({
    ...profile,
    role: normalizeUserRole(profile?.role),
});

export interface HotelRequest {
    id: string;
    hotel_id: string;
    room: string;
    type: string;
    notes?: string;
    status: RequestStatus;
    timestamp: number;
    time: string;
    price?: number;
    total?: number;
    is_paid?: boolean;
    items?: any;
}

export interface Room {
    id: string;
    hotel_id: string;
    room_number: string;
    booking_pin: string | null;
    is_occupied: boolean;
    checkout_date?: string;
    checkout_time?: string;
    num_guests?: number;
    checked_in_at?: number | null;
    created_at?: string;
}

export interface Guest {
    id: string;
    hotel_id: string;
    name: string;
    phone: string;
    room_number: string;
    check_in_date: string;
    check_out_date?: string;
    status: 'active' | 'checked_out' | 'deleted';
}

export interface MenuItem {
    id: string;
    hotel_id: string;
    category: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
    is_available: boolean;
    is_popular?: boolean;
    is_recommended?: boolean;
    is_combo?: boolean;
    upsell_items?: string[];
    created_at?: string;
}

const REQUEST_TYPE_KEYWORDS = {
    dining: ['dining order', 'restaurant order', 'restaurant', 'food order', 'room service', 'breakfast', 'lunch', 'dinner'],
    beverages: ['water', 'mineral water', 'tea', 'coffee', 'beverage'],
    housekeeping: ['towel', 'cleaning', 'housekeeping', 'laundry', 'dry cleaning'],
    service: ['waiter call', 'reception', 'concierge', 'checkout requested'],
} as const;

export function requestTypeMatches(requestType: string, allowedTypes: string[]) {
    const normalized = requestType.toLowerCase();
    return allowedTypes.some((allowedType) => normalized.includes(allowedType.toLowerCase()));
}

export function isDiningRequest(requestType: string) {
    return requestTypeMatches(requestType, [...REQUEST_TYPE_KEYWORDS.dining, ...REQUEST_TYPE_KEYWORDS.beverages]);
}

export function isHousekeepingRequest(requestType: string) {
    return requestTypeMatches(requestType, [...REQUEST_TYPE_KEYWORDS.housekeeping]);
}

export function isServiceRequest(requestType: string) {
    return requestTypeMatches(requestType, [...REQUEST_TYPE_KEYWORDS.service]);
}

export type SyncStatus = RealtimeSyncStatus;

const sortRoomsByNumber = (left: Room, right: Room) =>
    left.room_number.localeCompare(right.room_number, undefined, { numeric: true, sensitivity: 'base' });

const sortRequestsByTimestamp = (left: HotelRequest, right: HotelRequest) => right.timestamp - left.timestamp;

const sortMenuItems = (left: MenuItem, right: MenuItem) =>
    left.category.localeCompare(right.category, undefined, { sensitivity: 'base' }) ||
    left.title.localeCompare(right.title, undefined, { sensitivity: 'base' });

const sortByCreatedAtDesc = <T extends { created_at?: string }>(left: T, right: T) =>
    new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime();

const mapHotelBrandingRow = (data: any): HotelBranding => ({
    id: data.id,
    slug: data.slug,
    name: data.name,
    logo: data.logo,
    logoImage: data.logo_image,
    primaryColor: data.primary_color,
    accentColor: data.accent_color,
    wifiName: data.wifi_name,
    wifiPassword: data.wifi_password,
    receptionPhone: data.reception_phone,
    breakfastStart: data.breakfast_start,
    breakfastEnd: data.breakfast_end,
    lunchStart: data.lunch_start,
    lunchEnd: data.lunch_end,
    dinnerStart: data.dinner_start,
    dinnerEnd: data.dinner_end,
    lateCheckoutPhone: data.late_checkout_phone,
    lateCheckoutCharge1: data.late_checkout_charge_1,
    lateCheckoutCharge2: data.late_checkout_charge_2,
    lateCheckoutCharge3: data.late_checkout_charge_3,
    checkoutMessage: data.checkout_message,
    googleReviewLink: data.google_review_link,
    welcomeMessage: data.welcome_message,
    bgPattern: data.bg_pattern,
    address: data.address,
    guestTheme: data.guest_theme?.toUpperCase(),
});

// --- Utilities ---

export const sanitizePhoneForWA = (phone: string) => {
    const numeric = phone.replace(/[^0-9]/g, '');
    // If it's 10 digits, add '91' prefix
    if (numeric.length === 10) return `91${numeric}`;
    // If it already starts with 91 and has 12 digits, return as is
    if (numeric.length === 12 && numeric.startsWith('91')) return numeric;
    // Otherwise just return the numeric part
    return numeric;
};

const DEMO_ROOMS_KEY = 'antigravity_demo_rooms';
const DEMO_REQUESTS_KEY = 'antigravity_demo_requests';
const DEMO_MENU_KEY = 'antigravity_demo_menu';

const getDemoRooms = (hotelId: string): Room[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${DEMO_ROOMS_KEY}_${hotelId}`);
    return stored ? JSON.parse(stored) : [
        { id: 'r1', hotel_id: hotelId, room_number: '101', is_occupied: true, booking_pin: '1234', created_at: new Date().toISOString() },
        { id: 'r2', hotel_id: hotelId, room_number: '102', is_occupied: false, booking_pin: null, created_at: new Date().toISOString() },
        { id: 'r3', hotel_id: hotelId, room_number: '201', is_occupied: false, booking_pin: null, created_at: new Date().toISOString() }
    ];
};

const saveDemoRooms = (hotelId: string, rooms: Room[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${DEMO_ROOMS_KEY}_${hotelId}`, JSON.stringify(rooms));
    // Dispatch custom event for real-time update in same browser
    window.dispatchEvent(new CustomEvent('demo_rooms_updated', { detail: { hotelId } }));
};

const getDemoRequests = (hotelId: string): HotelRequest[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${DEMO_REQUESTS_KEY}_${hotelId}`);
    if (stored) return JSON.parse(stored);

    // Starting with clean slate for user testing
    return [];
};

const saveDemoRequests = (hotelId: string, requests: HotelRequest[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${DEMO_REQUESTS_KEY}_${hotelId}`, JSON.stringify(requests));
    // Dispatch custom event for real-time update in same browser
    window.dispatchEvent(new CustomEvent('demo_requests_updated', { detail: { hotelId } }));
};

const DEMO_GUESTS_KEY = 'antigravity_demo_guests';

const getDemoGuests = (hotelId: string): Guest[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${DEMO_GUESTS_KEY}_${hotelId}`);
    return stored ? JSON.parse(stored) : [];
};

const saveDemoGuests = (hotelId: string, guests: Guest[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${DEMO_GUESTS_KEY}_${hotelId}`, JSON.stringify(guests));
    window.dispatchEvent(new CustomEvent('demo_guests_updated', { detail: { hotelId } }));
};

const getDemoMenu = (hotelId: string): MenuItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${DEMO_MENU_KEY}_${hotelId}`);
    return stored ? JSON.parse(stored) : [
        { id: 'm1', hotel_id: hotelId, category: 'Breakfast', title: 'Continental Breakfast', description: 'Fresh pastries, fruits, and juice.', price: 16.0, is_available: true },
        { id: 'm2', hotel_id: hotelId, category: 'Lunch', title: 'Caesar Salad', description: 'Crisp romaine with parmesan.', price: 14.5, is_available: true },
        { id: 'm3', hotel_id: hotelId, category: 'Dinner', title: 'Margherita Pizza', description: 'Fresh mozzarella and basil.', price: 22.0, is_available: true },
        { id: 'm4', hotel_id: hotelId, category: 'All Day Snacks', title: 'Truffle Fries', description: 'Golden fries with truffle oil.', price: 12.0, is_available: true }
    ];
};

const saveDemoMenu = (hotelId: string, items: MenuItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${DEMO_MENU_KEY}_${hotelId}`, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('demo_menu_updated', { detail: { hotelId } }));
};

// --- Supabase Hooks & Functions ---

/**
 * Hook to manage Supabase Auth state
 */
export function useAuth() {
    const [user, setUser] = useState<any>(null); // Supabase User type is complex, keeping for now or use import
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, loading };
}

/**
 * Hook to fetch user profile and associated hotel
 */
export function useProfile(userId?: string) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        async function fetchProfile() {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .order('id', { ascending: true })
                .limit(1);

            if (!error) {
                setProfile(data?.[0] ? normalizeUserProfile(data[0]) : null);
            }
            setLoading(false);
        }

        fetchProfile();
    }, [userId]);

    return { profile, loading };
}

// --- Authentication & Profiles ---
export const getUserProfile = async (userId: string): Promise<{ data: UserProfile | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .order('id', { ascending: true })
            .limit(1);

        return { data: data?.[0] ? normalizeUserProfile(data[0]) : null, error };
    } catch (err) {
        return { data: null, error: err };
    }
};

const DEMO_STAFF_KEY = 'antigravity_demo_staff';

const getDemoStaff = (hotelId: string): UserProfile[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`${DEMO_STAFF_KEY}_${hotelId}`);
    return stored ? JSON.parse(stored) : [
        { id: 's1', user_id: 'admin@demo.com', hotel_id: hotelId, role: 'admin', full_name: 'Admin User' },
        { id: 's2', user_id: 'staff1@demo.com', hotel_id: hotelId, role: 'reception', full_name: 'Suresh Kumar' },
        { id: 's3', user_id: 'staff2@demo.com', hotel_id: hotelId, role: 'kitchen', full_name: 'Priya Verma' }
    ];
};

const saveDemoStaff = (hotelId: string, staff: UserProfile[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${DEMO_STAFF_KEY}_${hotelId}`, JSON.stringify(staff));
};

export const getAllHotelStaff = async (hotelId: string): Promise<{ data: UserProfile[] | null; error: any }> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('hotel_id', hotelId);

        return { data, error };
    } catch (err) {
        return { data: null, error: err };
    }
};

export const updateStaffRole = async (profileId: string, role: any): Promise<{ error: any }> => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', profileId);

        return { error };
    } catch (err) {
        return { error: err };
    }
};

export const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
}

// --- Guest Management ---
export const addGuest = async (guestData: Omit<Guest, 'id' | 'status'>) => {

    try {
        const { data, error } = await supabase
            .from('guests')
            .insert([
                {
                    ...guestData,
                    status: 'active'
                }
            ])
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST204' || error.message.includes('not found')) {
                // Table doesn't exist yet, fallback to local for demo purposes
                const guests = getDemoGuests(guestData.hotel_id);
                const newGuest: Guest = { ...guestData, id: 'local-' + Date.now(), status: 'active' };
                saveDemoGuests(guestData.hotel_id, [...guests, newGuest]);
                return { data: newGuest, error: null };
            }
            throw error;
        }

        let pin = null;
        if (data) {
            const res = await updateRoomStatus(guestData.hotel_id, guestData.room_number, true);
            pin = res.pin;
        }

        return { data, error: null, pin };
    } catch (err) {
        return { data: null, error: err };
    }
};

export const getHotelGuests = async (hotelId: string) => {

    try {
        const { data, error } = await supabase
            .from('guests')
            .select('*')
            .eq('hotel_id', hotelId)
            .eq('status', 'active');

        if (error) {
            if (error.code === 'PGRST204' || error.message.includes('not found')) {
                return { data: [], error: null };
            }
            throw error;
        }
        return { data, error };
    } catch (err) {
        return { data: [], error: err };
    }
};

export const deleteGuest = async (guestId: string, hotelId: string, roomNumber: string) => {

    try {
        const { error } = await supabase
            .from('guests')
            .update({ status: 'checked_out', check_out_date: new Date().toISOString() })
            .eq('id', guestId);

        if (error) {
            throw error;
        }

        await updateRoomStatus(hotelId, roomNumber, false);
        return { error: null };
    } catch (err) {
        return { error: err };
    }
};

export const getHotelRooms = async (hotelId: string) => {

    try {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('hotel_id', hotelId)
            .order('room_number', { ascending: true });

        if (error) {
            throw error;
        }
        return { data, error: null };
    } catch (err: any) {
        console.error("Error fetching rooms:", err);
        return { data: null, error: err };
    }
};

export const updateRoomStatus = async (hotelId: string, roomNumber: string, isOccupied: boolean) => {
    try {
        const { data: rooms, error: findError } = await supabase
            .from('rooms')
            .select('id, booking_pin')
            .eq('hotel_id', hotelId)
            .eq('room_number', roomNumber);

        if (findError) throw findError;

        if (rooms && rooms.length > 0) {
            let pin = rooms[0].booking_pin;

            if (isOccupied && !pin) {
                pin = Math.floor(1000 + Math.random() * 9000).toString();
            } else if (!isOccupied) {
                pin = null;
            }

            const { error: updateError } = await supabase
                .from('rooms')
                .update({
                    is_occupied: isOccupied,
                    booking_pin: pin,
                    checked_in_at: isOccupied ? Date.now() : null
                })
                .eq('id', rooms[0].id);

            return { error: updateError, pin };
        }

        return { error: 'Room not found', pin: null };
    } catch (err) {
        return { error: err };
    }
};

export const resetPasswordForEmail = async (email: string, redirectTo: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
    });
}

export const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({ password });
}

/**
 * Sign out
 */
export async function signOut() {
    return await supabase.auth.signOut();
}

/**
 * Custom hook to fetch and subscribe to hotel rooms for a specific hotel ID.
 * Returns the rooms list, loading state, sync health, and a manual refresh function.
 */
export function useHotelRooms(hotelId: string | undefined) {
    const state = useRealtimeCollection<Room>({
        table: 'rooms',
        consumer: 'hotel-rooms',
        scopeKey: hotelId || 'no-hotel',
        enabled: !!hotelId,
        fetchFilters: hotelId ? [{ column: 'hotel_id', value: hotelId }] : [],
        channelFilter: hotelId ? { column: 'hotel_id', value: hotelId } : undefined,
        orderBy: { column: 'room_number', ascending: true },
        sort: sortRoomsByNumber,
        enablePollingFallback: true,
    });

    return {
        rooms: state.data,
        loading: state.loading,
        refresh: state.refresh,
        syncStatus: state.syncStatus,
        fetchError: state.fetchError,
        lastSyncedAt: state.lastSyncedAt,
    };
}

export function useHotelBranding(slug: string | undefined) {
    const state = useRealtimeCollection<HotelBranding>({
        table: 'hotels',
        consumer: 'hotel-branding',
        scopeKey: slug || 'no-slug',
        enabled: !!slug,
        fetchFilters: slug ? [{ column: 'slug', value: slug }] : [],
        channelFilter: slug ? { column: 'slug', value: slug } : undefined,
        mapRow: mapHotelBrandingRow,
        enablePollingFallback: true,
    });

    return {
        branding: state.data[0] || null,
        loading: state.loading,
        refresh: state.refresh,
        syncStatus: state.syncStatus,
        fetchError: state.fetchError,
        lastSyncedAt: state.lastSyncedAt,
    };
}

/**
 * Hook to fetch and subscribe to requests for a specific hotel in real-time
 */
export function useSupabaseRequestsState(hotelId?: string, roomNumber?: string, checkedInAt?: number | null) {
    const state = useRealtimeCollection<HotelRequest>({
        table: 'requests',
        consumer: roomNumber ? 'guest-requests' : 'admin-requests',
        scopeKey: hotelId || 'no-hotel',
        enabled: !!hotelId,
        fetchFilters: hotelId ? [{ column: 'hotel_id', value: hotelId }] : [],
        channelFilter: hotelId ? { column: 'hotel_id', value: hotelId } : undefined,
        orderBy: { column: 'timestamp', ascending: false },
        sort: sortRequestsByTimestamp,
        enablePollingFallback: !roomNumber,
    });

    const requests = state.data.filter((request) => {
        if (roomNumber && request.room !== roomNumber) {
            return false;
        }
        if (checkedInAt && request.timestamp < checkedInAt) {
            return false;
        }
        return true;
    });

    return {
        requests,
        allRequests: state.data,
        loading: state.loading,
        refresh: state.refresh,
        syncStatus: state.syncStatus,
        fetchError: state.fetchError,
        lastSyncedAt: state.lastSyncedAt,
    };
}

export function useSupabaseRequests(hotelId?: string, roomNumber?: string, checkedInAt?: number | null) {
    return useSupabaseRequestsState(hotelId, roomNumber, checkedInAt).requests;
}

/**
 * Add a new request to Supabase
 */
export async function addSupabaseRequest(hotelId: string, request: Partial<HotelRequest>) {
    // Basic validation: UUIDs in Supabase are long. Demo IDs can be short (e.g. "demo-desai").
    if (!hotelId || hotelId.length < 20) {
        console.error("Critical: Invalid Hotel ID provided for production request submission:", hotelId);
        return { data: null, error: { message: "Invalid Hotel Configuration (Production)" } };
    }

    const newRequestData: Omit<HotelRequest, 'id'> = {
        hotel_id: hotelId,
        room: request.room || 'Unknown',
        type: request.type || 'Request',
        notes: request.notes,
        status: (request.status as RequestStatus) || 'Pending',
        price: request.price || 0,
        total: request.total || 0,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_paid: request.is_paid || false,
        items: request.items || null
    };

    // In production, we omit the 'id' and let Supabase generate a proper UUID
    const { data, error } = await supabase
        .from('requests')
        .insert([newRequestData])
        .select()
        .single();

    if (error) {
        console.error("Supabase Error Adding Request:", error.message);
        if (error.code === '42501' || error.message.includes('row-level security')) {
            console.error("CRITICAL: RLS Policy blocking INSERT. User must run fix_supabase_schema.sql");
            return { data: null, error: { ...error, message: "Sync Blocked: Database permissions are missing. Please contact Admin to run SQL Fix." } };
        }
    }

    return { data, error };
}

/**
 * Update request status in Supabase
 */
export async function updateSupabaseRequestStatus(id: string, status: RequestStatus) {

    const { data, error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', id);

    if (error) console.error("Error updating status:", error);
    return { data, error };
}

/**
 * Settle all requests for a specific table (Mark as Paid & Complete)
 */
export async function settleTableRequests(hotelId: string, roomNumber: string) {

    // 1. Mark all requests as paid and completed
    const { error: reqError } = await supabase
        .from('requests')
        .update({ status: 'Completed', is_paid: true })
        .eq('hotel_id', hotelId)
        .eq('room', roomNumber)
        .neq('status', 'Completed');

    if (reqError) console.error("Error settling table requests:", reqError);

    // 2. Mark table as vacant and clear session
    const { error: roomError } = await supabase
        .from('rooms')
        .update({ is_occupied: false, booking_pin: null, checked_in_at: null })
        .eq('hotel_id', hotelId)
        .eq('room_number', roomNumber);

    if (roomError) console.error("Error vacating table:", roomError);

    return { data: null, error: reqError || roomError };
}

/**
 * Update hotel branding in Supabase
 */
export async function saveHotelBranding(id: string, updates: Partial<HotelBranding>) {

    const { data, error } = await supabase
        .from('hotels')
        .update({
            name: updates.name,
            logo: updates.logo,
            logo_image: updates.logoImage,
            primary_color: updates.primaryColor,
            accent_color: updates.accentColor,
            wifi_name: updates.wifiName,
            wifi_password: updates.wifiPassword,
            reception_phone: updates.receptionPhone,
            breakfast_start: updates.breakfastStart,
            breakfast_end: updates.breakfastEnd,
            lunch_start: updates.lunchStart,
            lunch_end: updates.lunchEnd,
            dinner_start: updates.dinnerStart,
            dinner_end: updates.dinnerEnd,
            late_checkout_phone: updates.lateCheckoutPhone,
            late_checkout_charge_1: updates.lateCheckoutCharge1,
            late_checkout_charge_2: updates.lateCheckoutCharge2,
            late_checkout_charge_3: updates.lateCheckoutCharge3,
            checkout_message: updates.checkoutMessage,
            google_review_link: updates.googleReviewLink,
            welcome_message: updates.welcomeMessage,
            bg_pattern: updates.bgPattern,
            address: updates.address,
            guest_theme: updates.guestTheme,
        })
        .eq('id', id);

    if (error) console.error("Error saving hotel branding:", error);
    return { data, error };
}

/**
 * Mark all requests for a specific room and hotel as paid
 */
export async function settleRoomRequests(hotelId: string, room: string) {

    const { data, error } = await supabase
        .from('requests')
        .update({ is_paid: true })
        .eq('hotel_id', hotelId)
        .eq('room', room);

    if (error) console.error("Error settling room requests:", error);
    return { data, error };
}

/**
 * Add a new room to the hotel
 */
export async function addRoom(hotelId: string, roomNumber: string) {

    const { data, error } = await supabase
        .from('rooms')
        .insert([{
            hotel_id: hotelId,
            room_number: roomNumber
        }])
        .select()
        .single();

    if (error) console.error("Error adding room:", error);
    return { data, error };
}

/**
 * Delete a room from the hotel
 */
export async function deleteRoom(roomId: string, hotelId: string) {

    const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
        .eq('hotel_id', hotelId);

    if (error) console.error("Error deleting room:", error);
    return { error };
}

// useRooms consolidated into useHotelRooms above

/**
 * Check-in a room logic: generates a 4-digit PIN
 */
export async function checkInRoom(roomId: string, hotelId: string, checkoutDate?: string, checkoutTime?: string, numGuests: number = 1) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit PIN


    const { data, error } = await supabase
        .from('rooms')
        .update({
            is_occupied: true,
            booking_pin: pin,
            checkout_date: checkoutDate,
            checkout_time: checkoutTime,
            num_guests: numGuests,
            checked_in_at: Date.now()
        })
        .eq('id', roomId)
        .eq('hotel_id', hotelId);

    if (error) console.error("Error checking in room:", error);
    return { data, error, pin };
}

/**
 * Check-out a room: clear the PIN
 */
export async function checkOutRoom(roomId: string, hotelId: string) {

    const { data, error } = await supabase
        .from('rooms')
        .update({
            is_occupied: false,
            booking_pin: null,
            checkout_date: null,
            checkout_time: null,
            num_guests: null,
            checked_in_at: null
        })
        .eq('id', roomId)
        .eq('hotel_id', hotelId);

    if (error) console.error("Error checking out room:", error);
    return { data, error };
}

/**
 * Check-out a room by its room number: clear the PIN
 */
export async function checkOutRoomByNumber(hotelId: string, roomNumber: string) {

    const { data, error } = await supabase
        .from('rooms')
        .update({
            is_occupied: false,
            booking_pin: null,
            checkout_date: null,
            checkout_time: null,
            num_guests: null,
            checked_in_at: null
        })
        .eq('hotel_id', hotelId)
        .eq('room_number', roomNumber);

    if (error) console.error("Error checking out room by number:", error);
    return { data, error };
}

/**
 * Get the currently active guest for a given room
 */
export async function getActiveGuestByRoom(hotelId: string, roomNumber: string) {
    const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('room_number', roomNumber)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) console.error("Error fetching active guest:", error);
    return { data, error };
}

/**
 * Verify a room's booking PIN. Useful for the guest UI.
 */
export async function verifyBookingPin(hotelId: string, roomNumber: string, pin: string) {
    console.log(`AuthStore: Querying Supabase for Room ${roomNumber} in Hotel ${hotelId}`);
    const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('room_number', roomNumber)
        .eq('booking_pin', pin)
        .eq('is_occupied', true)
        .limit(1);

    if (error) {
        console.error("AuthStore: Supabase PIN verification error:", error.message);
        return { success: false, data: null };
    }

    const roomData = data && data.length > 0 ? data[0] : null;

    if (!roomData) {
        console.warn("AuthStore: No matching occupied room found with this PIN.");
        return { success: false, data: null };
    }

    console.log("AuthStore: Supabase PIN verification successful");
    return { success: true, data: roomData };
}

/**
 * Hook to fetch and subscribe to special offers for a specific hotel
 */
export function useSpecialOffers(hotelId?: string) {
    const state = useRealtimeCollection<SpecialOffer>({
        table: 'special_offers',
        consumer: 'special-offers',
        scopeKey: hotelId || 'no-hotel',
        enabled: !!hotelId,
        fetchFilters: hotelId ? [{ column: 'hotel_id', value: hotelId }] : [],
        channelFilter: hotelId ? { column: 'hotel_id', value: hotelId } : undefined,
        orderBy: { column: 'created_at', ascending: false },
        sort: sortByCreatedAtDesc,
        enablePollingFallback: true,
    });

    return {
        offers: state.data,
        loading: state.loading,
        refresh: state.refresh,
        syncStatus: state.syncStatus,
        fetchError: state.fetchError,
        lastSyncedAt: state.lastSyncedAt,
    };
}

/**
 * Save or add a special offer
 */
export async function saveSpecialOffer(hotelId: string, offer: Partial<SpecialOffer>) {

    if (offer.id) {
        return await supabase
            .from('special_offers')
            .update({
                title: offer.title,
                description: offer.description,
                image_url: offer.image_url,
                is_active: offer.is_active
            })
            .eq('id', offer.id);
    } else {
        return await supabase
            .from('special_offers')
            .insert([{ ...offer, hotel_id: hotelId }]);
    }
}

/**
 * Delete a special offer
 */
export async function deleteSpecialOffer(id: string) {
    return await supabase.from('special_offers').delete().eq('id', id);
}

/**
 * Hook to fetch and subscribe to menu items for a specific hotel
 */
export function useSupabaseMenuItems(hotelId?: string) {
    const state = useRealtimeCollection<MenuItem>({
        table: 'menu_items',
        consumer: 'menu-items',
        scopeKey: hotelId || 'no-hotel',
        enabled: !!hotelId,
        fetchFilters: hotelId ? [{ column: 'hotel_id', value: hotelId }] : [],
        channelFilter: hotelId ? { column: 'hotel_id', value: hotelId } : undefined,
        orderBy: { column: 'category', ascending: true },
        sort: sortMenuItems,
        enablePollingFallback: true,
    });

    return {
        menuItems: state.data,
        loading: state.loading,
        refresh: state.refresh,
        syncStatus: state.syncStatus,
        fetchError: state.fetchError,
        lastSyncedAt: state.lastSyncedAt,
    };
}

/**
 * Save or add a menu item
 */
export async function saveSupabaseMenuItem(hotelId: string, item: Partial<MenuItem>) {

    if (item.id) {
        const { data, error } = await supabase
            .from('menu_items')
            .update({
                category: item.category,
                title: item.title,
                description: item.description,
                price: item.price,
                image_url: item.image_url,
                is_available: item.is_available,
                is_popular: item.is_popular,
                is_recommended: item.is_recommended,
                is_combo: item.is_combo,
                upsell_items: item.upsell_items
            })
            .eq('id', item.id);
        if (error) {
            console.error("Error updating menu item:", error.message, error);
            alert(`Update Failed: ${error.message}`);
        }
        return { data, error };
    } else {
        const { data, error } = await supabase
            .from('menu_items')
            .insert([{ ...item, hotel_id: hotelId }]);
        if (error) {
            console.error("Error inserting menu item:", error.message, error);
            if (error.message.includes('not find')) {
                alert("Database Table Missing: Please run the Restoration SQL from the Implementation Plan in Supabase.");
            } else {
                alert(`Creation Failed: ${error.message}`);
            }
        }
        return { data, error };
    }
}

/**
 * Delete a menu item
 */
export async function deleteSupabaseMenuItem(id: string, hotelId: string) {
    return await supabase.from('menu_items').delete().eq('id', id);
}

/**
 * Shared Cart Hook for Guest Ordering
 * Persists to localStorage to share state between Dashboard and Restaurant pages
 */
export function useCart(hotelId: string | undefined) {
    const [cart, setCart] = useState<Record<string, number>>({});
    const [isInitialized, setIsInitialized] = useState(false);

    const STORAGE_KEY = `cart_${hotelId}`;

    useEffect(() => {
        if (!hotelId) return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setCart(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse cart from storage", e);
            }
        }
        setIsInitialized(true);
    }, [hotelId]);

    useEffect(() => {
        if (isInitialized && hotelId) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
            // Trigger storage event for cross-tab or same-page synchronization if needed
            window.dispatchEvent(new Event('storage'));
        }
    }, [cart, hotelId, isInitialized]);

    const updateQuantity = (id: string, q: number) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (q <= 0) {
                delete newCart[id];
            } else {
                newCart[id] = q;
            }
            return newCart;
        });
    };

    const clearCart = () => {
        setCart({});
        if (hotelId) localStorage.removeItem(STORAGE_KEY);
    };

    const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

    return { cart, updateQuantity, clearCart, cartCount, isInitialized };
}
/**
 * Loyalty System (Vibe Points)
 */
export async function addLoyaltyPoints(hotelId: string, phone: string, points: number) {
    if (!hotelId || !phone) return { error: "Missing hotel ID or phone" };
    
    try {
        // Upsert loyalty record
        const { data, error } = await supabase
            .from('guest_loyalty')
            .select('id, points')
            .eq('hotel_id', hotelId)
            .eq('phone', phone)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
            // Update existing
            const { error: updateError } = await supabase
                .from('guest_loyalty')
                .update({ points: data.points + points })
                .eq('id', data.id);
            return { error: updateError };
        } else {
            // Insert new
            const { error: insertError } = await supabase
                .from('guest_loyalty')
                .insert([{
                    hotel_id: hotelId,
                    phone: phone,
                    points: points
                }]);
            return { error: insertError };
        }
    } catch (err) {
        console.error("Error in addLoyaltyPoints:", err);
        return { error: err };
    }
}

export async function getGuestLoyalty(hotelId: string, phone: string) {
    const { data, error } = await supabase
        .from('guest_loyalty')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('phone', phone)
        .single();
    
    return { data, error };
}

export function useGuestLoyalty(hotelId: string | undefined, phone: string | null) {
    const state = useRealtimeCollection<any>({
        table: 'guest_loyalty',
        consumer: 'guest-loyalty',
        scopeKey: (hotelId && phone) ? `${hotelId}-${phone}` : 'no-loyalty',
        enabled: !!hotelId && !!phone,
        fetchFilters: hotelId ? [
            { column: 'hotel_id', value: hotelId },
            { column: 'phone', value: phone }
        ] : [],
        channelFilter: hotelId ? { column: 'hotel_id', value: hotelId } : undefined,
    });

    return {
        loyalty: state.data[0] || null,
        loading: state.loading,
        refresh: state.refresh,
        syncStatus: state.syncStatus,
    };
}
