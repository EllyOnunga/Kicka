import { supabase } from "@/lib/supabase/client";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { CategoryWithProducts } from "@/types/category";
import { notFound } from "next/navigation";

async function getCategory(slug: string): Promise<CategoryWithProducts | null> {
    const { data, error } = await supabase
    .from("categories")
    .select(
        `*, products:product_categories(product:products(*))`
    )
    .eq("slug", slug)
    .single();

    if (error) {
        console.error("Error fetching category:", error);
        return null;
    }

    //flatten the product array
    return {
        ...data, products: data.products.map((pc: any) => pc.product),
    };
}

export default async function CategoryPage({
    params,
} : {
    params: { slug: string };
}) {
    const category = await getCategory(params.slug);

    if (!category) {
        return notFound();
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
                    {category.description && (
                        <p className="text-lg text-gray-600">{category.description}</p>
                    )}
                </div>

                {category.products.length === 0 ? (
                    <div className="text-center py-12">
                        <p>No products found in this category.</p>
                        <Link href="/products" className="btn btn-primary mt-4">
                        Browse All Products
                        </Link>
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {category.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    </>
                )}
            </div>
        </Layout>
    );
}