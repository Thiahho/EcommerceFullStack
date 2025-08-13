import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {
    // Validación de seguridad
    if (!product) {
        return (
            <div className="flex flex-col items-start gap-0.5 max-w-[200px] w-full">
                <div className="bg-gray-200 rounded-lg w-full h-52 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Producto no disponible</span>
                </div>
            </div>
        );
    }

    const { currency, router } = useAppContext()

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
        >
            <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
                {product.image && product.image.length > 0 ? (
                    <Image
                        src={product.image[0]}
                        alt={product.name || 'Product image'}
                        className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
                        width={800}
                        height={800}
                    />
                ) : (
                    <div className="w-4/5 h-4/5 md:w-full md:h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Sin imagen</span>
                    </div>
                )}
                <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                    <Image
                        className="h-3 w-3"
                        src={assets.heart_icon}
                        alt="heart_icon"
                    />
                </button>
            </div>

            <p className="md:text-base font-medium pt-2 w-full truncate">{product.name || 'Sin nombre'}</p>
            <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">{product.description || 'Sin descripción'}</p>
            <div className="flex items-center gap-2">
                <p className="text-xs">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3"
                            src={
                                index < Math.floor(4)
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-end justify-between w-full mt-1">
                <p className="text-base font-medium">{currency}{product.offerPrice || product.precio || 'N/A'}</p>
                <button className=" max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition">
                    Buy now
                </button>
            </div>
        </div>
    )
}

export default ProductCard