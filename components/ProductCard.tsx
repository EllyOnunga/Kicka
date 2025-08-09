"use client";

import { Product } from "@/types/product";
import { useState } from "react";
import { useCart } from "@/providers/CartProvider";
import { FiShoppingCart, FiHeart, FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Rating from "./Rating";
import Link from "next/link";

interface ProductCardProps {
    product: Product;
    className?: string;
}

export default function ProductCard({ product, className="" }: ProductCardProps) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [isWishlist, setIsWishlist] = useState(false);
    const [quickViewOpen, setQuickViewOpen] = useState(false);

   const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await addToCart(product.id);
            toast.success(`${product.name} added to cart`);
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setIsAdding(false);
        }
    };

    const toggleWishlist = () => {
        setIsWishlist(!isWishlist);
        toast.success(
            isWishlist ? `${product.name} removed from wishlist` 
            : `${product.name} added to wishlist`
        );
    };

    return (
        <div className={`card bg-base-100 shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <div className="relative group">
                <Link href={`/products/${product.id}`} className="block">
                    <figure className="relative pt-[100%] overflow-hidden">
                        {product.image_url ? (
                    <Image
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        src={product.image_url}
                        alt={product.name}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-base-200 flex items-center justify-center">
                        <span className="text-gray-500">No image available</span>
                    </div>
                )}
            </figure>
        </Link>

        <div className="absolute top-2 left-2">
            {product.stock_quantity <= 0 ? (
                <span className="badge badge-error text-white">Out of Stock</span>
            ) : (typeof product.original_price === "number" && product.price < product.original_price) ? (
                <span className="badge badge-primary text-white">
                    {Math.round(
                        ((product.original_price - product.price) / product.original_price) * 100)}% Off
                </span>
            ) : null}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
                onClick={toggleWishlist}
                className={`btn btn-circle btn-sm bg-base-100 hover:bg-primary hover:text-white"}`}
                aria-label={isWishlist ? "Remove from wishlist": "Add to wishlist"}
            >
                <FiHeart className={isWishlist ? "fill-current text-red-500":""} />
            </button>
            <button
                onClick={() => setQuickViewOpen(true)}
                className="btn btn-circle btn-sm bg-base-100 hover:bg-primary hover:text-white"
                aria-label="Quick view"
            >
                <FiEye />
            </button>
        </div>
    </div>

    <div className="card-body p-4">
        <div className="flex flex-col gap-1">
            {(product.categories?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                    {product.categories?.slice(0, 2).map((category) => (
                        <Link 
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="badge badge-outline badge-sm hover:badge-primary transition-colors"
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            )}

            <Link href={`/products/${product.id}`}>
                <h3 className="card-title text-base font-medium hover:text-primary transition-colors inline-clamp-2">
                    {product.name}
                </h3>
            </Link>

            <Rating
                value={product.average_rating || 0}
                count={product.review_count || 0}
                className="mt-1"
            />

            <div className="mt-2">
                <span className="text-lg font-bold text-primary">
                    Ksh.{product.price.toFixed(2)}
                </span>
                {typeof product.original_price === "number" && product.original_price > product.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                        Ksh.{product.original_price.toFixed(2)}
                    </span>
                )}
            </div>
        </div>

        <div className="card-actions mt-4">
            <button 
                onClick={handleAddToCart}
                disabled={isAdding || product.stock_quantity <= 0}
                className={`btn btn-primary btn-stock btn-sm ${isAdding ? "loading" : ""}`}
            >
                {product.stock_quantity <= 0 ? (
                    "Out of Stock"
                ) : (
                    <>
                        <FiShoppingCart className="mr-2" />
                        {isAdding ? "Adding..." : "Add to Cart"}
                    </>
                )}
            </button>
        </div>
    </div>

    {quickViewOpen && (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl">
                <button 
                    onClick={() => setQuickViewOpen(false)}
                    className="btn btn-sm btn-circle absolute right-2 top-2">
                    X
                </button>
                <h3 className="text-lg font-bold mb-4">{product.name}</h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                width={500}
                                height={500}
                                className="w-full h-auto rounded-lg"
                            />
                        ) : (
                            <div className="w-full aspect-square bg-base-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-500">No Image available</span>
                            </div>
                        )}
                    </div>

                    <div className="md:w-1/2">
                        <Rating 
                            value={product.average_rating || 0}
                            count={product.review_count || 0}
                            className="mb-2"
                        />
                        <p className="text-lg font-bold text-primary mb-4">
                            Ksh.{product.price.toFixed(2)}
                            {typeof product.original_price === "number" && product.original_price > product.price && (
                                <span className="text-sm text-gray-500 line-through ml-2">
                                    Ksh.{product.original_price.toFixed(2)}
                                </span>
                            )}
                        </p>

                        <p className="text-sm mb-4 line-clamp-3">{product.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {product.categories?.map((category) => (
                                <Link 
                                    key={category.id}
                                    href={`/categories/${category.slug}`}
                                    className="badge badge-outline hover:badge-primary"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding || product.stock_quantity <= 0}
                                className={`btn btn-primary flex-1 ${isAdding ? "loading" : ""}`}
                            >
                                {product.stock_quantity <= 0 ? (
                                    "Out of Stock"
                                ) : (
                                    <>
                                        <FiShoppingCart className="mr-2" />
                                        {isAdding ? "Adding..." : "Add to Cart"}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={toggleWishlist}
                                className="btn btn-outline"
                                aria-label={isWishlist ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <FiHeart className={isWishlist ? "fill-current text-red-500" : ""} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}
</div>
    );
}