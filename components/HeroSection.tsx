import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";
import heroImage from "@/public/hero.png";
import  FeaturedProducts from "@/components/FeaturedProducts";

export default function HeroSection() {
    return (
        <>
            <section className="relative h-[80vh] max-h-[800px] flex items-center">
                <div className="absolute inset-0 bg-black/50 z-10">
                <Image
                src={heroImage}
                alt="Kicka Shopping Made Easy"
                fill
                className="object-cover"
                priority
                />
                <div className="container mx-auto px-4 relative z-50 text-white">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Discover Amazing products at unbeatable prices
                        </h1>
                        <p className="text-xl mb-8">
                            Shop the latest trends and exclusive collections at Kicka. Quality products with fast delivery.
                        </p>
                        <div className="flex gap-4">
                            <Link 
                            href="/products"
                            className="btn btn-primary px-8 py-3 text-lg"
                            >
                                Shop Now
                            </Link>
                            <Link 
                            href="/categories"
                            className="btn btn-outline btn-accent px-8 py-3 text-lg">
                                Explore Categories
                            </Link>
                        </div>
                    </div>
                </div>
                </div>
            </section>

            <section className="py-16 bg-base-100">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">New Arrivals</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover our latest products that everyone is talking about 
                        </p>
                    </div>
                    <FeaturedProducts />
                </div>
            </section>
        </>
    );
}