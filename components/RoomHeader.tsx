import React from "react";

export function RoomHeader({ roomNumber, hotelName }: { roomNumber: string; hotelName?: string }) {
    return (
        <div className="flex flex-col mb-6">
            {hotelName && <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{hotelName}</p>}
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Room {roomNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">What can we help you with today?</p>
        </div>
    );
}
