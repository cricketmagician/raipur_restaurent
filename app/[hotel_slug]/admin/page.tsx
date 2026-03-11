"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    useEffect(() => {
        router.push(`/${hotelSlug}/admin/dashboard`);
    }, [hotelSlug, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
