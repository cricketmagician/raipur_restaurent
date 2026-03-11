import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { hotel_id, room_id, service, notes } = body;

        // MVP: In a real environment, we'd insert this into Supabase
        /*
        const { data, error } = await supabase
          .from('requests')
          .insert([
            { hotel_id, room_id, service, notes, status: 'Pending' }
          ]);
        */

        // Simulate success
        return NextResponse.json({ success: true, message: "Request received", data: { hotel_id, room_id, service } });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    // MVP: Return mock requests for a room
    return NextResponse.json({
        success: true,
        data: [
            { id: "1024", type: "Extra Towels", status: "Assigned", time: "11:15 AM" }
        ]
    });
}
