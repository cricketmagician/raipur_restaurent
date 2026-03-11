"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useHotelBranding } from "@/utils/store";

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);

    useEffect(() => {
        if (typeof document !== "undefined" && branding) {
            const root = document.documentElement;
            root.style.setProperty("--primary", branding.primaryColor);
            root.style.setProperty("--primary-accent", branding.accentColor);
            // root.style.setProperty("--bg-pattern", branding.bgPattern || "none");
        }
    }, [branding]);

    return (
        <div style={{
            //@ts-ignore
            "--primary": branding?.primaryColor || "#3b82f6",
            "--primary-accent": branding?.accentColor || "#60a5fa"
        } as React.CSSProperties}>
            {children}
        </div>
    );
}
