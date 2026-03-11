import React from "react";
import { Loader2 } from "lucide-react";

interface RequestButtonProps {
    label?: string;
    onClick: () => void;
    isLoading?: boolean;
    loading?: boolean; // Support both naming conventions
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export function RequestButton({
    label,
    onClick,
    isLoading,
    loading,
    disabled,
    className,
    style,
    children
}: RequestButtonProps) {
    const isActuallyLoading = isLoading || loading;

    return (
        <button
            onClick={onClick}
            style={style}
            disabled={isActuallyLoading || disabled}
            className={className || `w-full py-4 rounded-xl font-semibold text-white shadow-md transition-all active:scale-[0.98] flex items-center justify-center ${disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-primary hover:bg-opacity-90"}`}
        >
            {isActuallyLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isActuallyLoading ? "Sending..." : (children || label)}
        </button>
    );
}
