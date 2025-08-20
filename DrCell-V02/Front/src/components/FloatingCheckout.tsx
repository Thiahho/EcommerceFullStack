import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart-store';

const FloatingCheckout: React.FC = () => {
    const navigate = useNavigate();
    const { getTotalItems, getTotalPrice } = useCartStore();

    // No mostrar si no hay items
    if (getTotalItems() === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => navigate('/checkout')}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-6 py-4 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center space-x-3 group"
            >
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {getTotalItems()}
                        </span>
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-semibold">Checkout</div>
                        <div className="text-xs opacity-90">${getTotalPrice().toLocaleString()}</div>
                    </div>
                </div>

                <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default FloatingCheckout;
