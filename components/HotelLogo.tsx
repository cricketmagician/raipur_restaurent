"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useHotelBranding } from "@/utils/store";

export function HotelLogo({ name: propName, logoUrl }: { name?: string; logoUrl?: string }) {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding, loading } = useHotelBranding(hotelSlug);

    if (loading) return <div className="w-16 h-16 bg-slate-100 animate-pulse rounded-xl mb-4 mx-auto" />;

    const displayName = propName || branding?.name || "Hotel";
    const finalLogoUrl = logoUrl || branding?.logoImage;
    const displayLogo = branding?.logo || displayName.charAt(0);

    return (
        <div className="flex flex-col items-center justify-center py-8">
            {finalLogoUrl ? (
                <img src={finalLogoUrl} alt={displayName} className="h-16 object-contain mb-4" />
            ) : (
                <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20"
                    style={{ backgroundColor: branding?.primaryColor || "#3b82f6" }}
                >
                    <span className="text-3xl font-serif text-white">{displayLogo}</span>
                </div>
            )}
            <h2 className="text-2xl font-bold font-serif text-center">{displayName}</h2>
        </div>
    );
}
