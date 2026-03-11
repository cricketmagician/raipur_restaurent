"use client";

import React from "react";
import { useParams } from "next/navigation";
import { StaffDashboard } from "@/components/StaffDashboard";
import { Utensils } from "lucide-react";

export default function WaiterPage() {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    return (
        <StaffDashboard
            hotelSlug={hotelSlug}
            department="waiter"
            allowedTypes={["Waiter Call", "Mineral Water", "Water"]}
            title="Waiter Service"
            icon={<Utensils className="w-8 h-8 text-amber-500" />}
        />
    );
}
