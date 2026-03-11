import React, { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export function NotificationToast({ message, onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // wait for animation
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
        >
            <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 w-max max-w-[90vw]">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-sm font-medium">{message}</p>
                <button onClick={() => setIsVisible(false)} className="ml-2 text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
