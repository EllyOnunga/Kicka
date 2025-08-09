import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/category";

async function getFeaturedCategories(): Promise<Category[]> {
    const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })
    .limit(6);

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }  

    return data
}

export default async function FeaturedCategories() {
    const categories = await getFeaturedCategories();

    return (
        <section className="py-16 bg-base-200">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Find exactly what you you're looking for in our specialized categories
                    </p>
                </div>
                {categories.length > 0 ? (
                    <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((category) => (
                            <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow text-center"
                            >
                                <div className="p-4">
                                <div className="avatar mb-2">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-base-200">
                                        {category.image_url ? (
                                            <Image
                                            src={category.image_url}
                                            alt={category.name}
                                            fill
                                            className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg flex items-center justify-center h-full">
                                                {category.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-semibold">{category.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link href="/categories" className="btn btn-primary">
                        View All Categories
                        </Link>
                    </div>
                    </>
                ) : (
                    <div className="text-center">
                        <p>No Categories Found.</p>
                    </div>
                )}
            </div>
        </section>
    );
}