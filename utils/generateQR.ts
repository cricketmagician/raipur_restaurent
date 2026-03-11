import QRCode from "qrcode";

export async function generateRoomQR(hotelSlug: string, roomNumber: string): Promise<string> {
    // Construct the URL to redirect the guest to their room's dashboard
    // Example: https://hotelplatform.com/{hotelSlug}/{roomNumber}
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const targetUrl = `${appUrl}/guest/dashboard?hotel=${hotelSlug}&room=${roomNumber}`;

    try {
        const qrDataUrl = await QRCode.toDataURL(targetUrl, {
            width: 400,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#ffffff",
            },
        });
        return qrDataUrl;
    } catch (err) {
        console.error("Error generating QR code", err);
        throw err;
    }
}
