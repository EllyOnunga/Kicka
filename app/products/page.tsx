import { supabase } from '@/lib/supabase/client';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select("*")

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Our Products</h1>
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
    </Layout>
  );
}