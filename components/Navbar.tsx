"use client";

import  Link from 'next/link';
import { useCart } from '@/providers/CartProvider';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AuthButton from './AuthButton';
    
export default function Navbar() {
    const { cartCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname])

    useEffect (() => {
        setIsClient(true);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("")
        }
    };
    
    return (
        <header className='bg-base-100 shadow-sm sticky top-0 z-50 border-b border-base-200'>
            <div className='container mx-auto px-4'>
                <div className='flex justify-between items-center h-16'>
                    <div className='flex items-center gap-4'>
                        <button
                        className='md:hidden text-xl text-gray-700'
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label='Toggle menu'
                        >
                            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                        <Link href="/"
                        className='text-2xl font-bold text-primary hover:text-primary-focus transition-culors'
                        >
                            Kicka
                        </Link>
                    </div>


                    <nav className='hidden md:flex items-center gap-6 ml-8'>
                        <Link
                        href="/products"
                        className='hover:text-primary transition-colors font-medium'
                        >
                            Products
                        </Link>
                        <Link 
                        href="/categories"
                        className='hover:text-primary transition-colors font-medium'
                        >
                            Categories
                        </Link>
                        <Link 
                        href="/about"
                        className='hover:text-primary transition-colors font-medium'
                        >
                            About
                        </Link>
                    </nav>

                    <div className='flex items-center gap-4'>
                        <form
                        onSubmit={handleSearch}
                        className='hidden md:flex items-center relative w-64'
                        >
                            <input
                            type="text"
                            placeholder='Search'
                            className='input input-bordered input-sm w-full pl-9 pr-4 py-5'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <FiSearch className='absolute left-3 text-gray-400' />
                        </form>

                        <Link
                        href="/cart"
                        className='p-2 relative hover:text-primary transition-colors'
                        aria-label='Shopping Cart'
                        >
                            <FiShoppingCart className='text-xl' />
                            {isClient && cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </Link>
                        
                    <div className="hidden md:block">
                        <AuthButton />
                    </div>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className='md:hidden pb-4 space-y-4 bg-base-100'>
                    <form
                    onSubmit={handleSearch}
                    className='px-2 pt-2'
                    >
                        <div className='relative'>
                        <input
                        type="text"
                        placeholder='Search products...'
                        className='input input-bordered w-full pl-9'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FiSearch className='absolute left-3 top-3 text-gray-400' />
                        </div>
                    </form>
                
                    <nav className="flex flex-col gap-1 px-2">
                        <Link
                        href="/products"
                        className='px-4 py-2 hover:bg-base-200 rounded-md transition-colors'
                        >
                            Products
                        </Link>
                        <Link 
                        href="/categories"
                        className='px-4 py-2 hover:bg-base-200 rounded-md transition-colors'
                        >
                            Categories
                        </Link>
                        <Link 
                        href="/about"
                        className='px-4 py-2 hover:bg-base-200 rounded-md transition-colors'
                        >
                            About
                        </Link>
                    </nav>
                    <div className='border-t border-base-200 pt-2 px-2'>
                        <AuthButton />
                    </div>
                </div>
            )}
            </div>
        </header>
    );
}