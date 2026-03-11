import React from "react";
import { Plus } from "lucide-react";

interface MenuCardProps {
    id: string;
    title: string;
    description: string;
    price: number;
    image?: string;
    onAdd?: () => void;
}

export function MenuCard({ title, description, price, image, onAdd }: MenuCardProps) {
    return (
        <div className="group bg-white rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 active:scale-[0.98]">
            {image && (
                <div className="relative w-full h-48 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                        <span className="text-sm font-black text-slate-900">₹{price.toFixed(2)}</span>
                    </div>
                </div>
            )}
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                    <h3 className="font-black text-xl text-slate-900 leading-tight tracking-tight uppercase">{title}</h3>
                </div>
                <p className="text-[11px] text-slate-400 font-bold line-clamp-2 mb-6 leading-relaxed uppercase tracking-tighter">{description}</p>
                <div className="mt-auto pt-2">
                    <button
                        onClick={onAdd}
                        className="w-full bg-[#E31837] text-white py-4 rounded-xl flex items-center justify-center transition-all hover:bg-[#C41230] shadow-xl shadow-red-100 font-black text-xs uppercase tracking-[0.1em] group/btn"
                    >
                        <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform" />
                        Add to Order
                    </button>
                </div>
            </div>
        </div>
    );
}
