import Layout from "@/components/Layout";
import CategoryCard from "@/components/CategoryCard";
import { supabase } from "@/lib/supabase/client";
import { Category } from "@/types/category";

async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching csategories:", error);
        return [];
    }

    return data;
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <Layout>
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8 text-center">Categories</h1>
                    {categories.length === 0 ? (
                        <div className="text-center">
                            <p>No categories found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map((category) => (
                                <CategoryCard key={category.id} category={category} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    )
}