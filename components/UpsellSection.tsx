import React from "react";
import { Plus } from "lucide-react";

interface UpsellItem {
    id: string;
    title: string;
    price: number;
    image?: string;
}

interface UpsellSectionProps {
    items: UpsellItem[];
    onAdd: (item: UpsellItem) => void;
}

export function UpsellSection({ items, onAdd }: UpsellSectionProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="mb-10">
            <h3 className="font-serif text-xl text-black mb-6 flex items-center">
                Complete Your Meal
                <span className="ml-3 h-[1px] flex-1 bg-slate-100" />
            </h3>
            
            <div className="flex space-x-4 overflow-x-auto no-scrollbar -mx-2 px-2 pb-4">
                {items.map((item) => (
                    <div 
                        key={item.id}
                        className="flex-shrink-0 w-48 bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        {item.image && (
                            <div className="h-28 w-full rounded-2xl overflow-hidden mb-3">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                        )}
                        <h4 className="font-black text-[11px] uppercase tracking-tighter text-black line-clamp-1 mb-1">{item.title}</h4>
                        <p className="text-sm font-black text-[#D4AF37] mb-3">₹{item.price.toFixed(0)}</p>
                        <button 
                            onClick={() => onAdd(item)}
                            className="w-full py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-colors"
                        >
                            Add
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
