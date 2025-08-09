import { supabase } from "@/lib/supabase/client";
import Layout from "@/components/Layout";
import ProductDetail from "@/components/ProductDetail";
import { notFound } from "next/navigation";

async function getProduct(id: string) {
    const { data, error } = await supabase
    .from("products")
    .select(
        `*, reviews(*, user:users(id, email, user_metadata)),
        average_rating:reviews(avg(rating)), review_count:reviews(count)`
    )
    .eq("id", id)
    .single();

    if (error) {
        console.error("Error fetching products:", error);
        return null
    }

    return {
        ...data, 
        average_rating: data.average_rating[0]?.avg || 0,
        review_count: data.review_count[0]?.count || 0,
    };
} 

export default async function ProductPage({
    params,
} : {
    params: { id: string}
}) {
    const product = await getProduct(params.id);

    if (!product) {
        return notFound();
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <ProductDetail product={product} />
            </div>
        </Layout>
    );
}