import { supabase } from "@/lib/supabase/client";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

async function getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

    if (error) {
        console.error("Error fetching featured products:", error);
        return [];
    }

    return data;
}

export default async function FeaturedProducts() {
    const products = await getFeaturedProducts();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}