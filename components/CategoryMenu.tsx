import Link from "next/link";
import { CategoryWithChildren } from "@/types/category";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function categoryMenu() {
    const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const fetchCategories = async() => {
            try {
                const { data, error } = await supabase
                .from("categories")
                .select("*")
                .order("name", { ascending: true });

                if (error) throw error

                // build hierarchical categories
                const parentCategories = data.filter(c => !c.parent_id);
                const categoriesWithChildren = parentCategories.map(parent => ({
                    ...parent,
                    children: data.filter(c => c.parent_id === parent.id)
                }));

                setCategories(categoriesWithChildren);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsLoading(false)
            }
        };

        fetchCategories();
    }, []);

    if (isLoading) return <div className="skeleton h-6 w-full"></div>

    return (
        <div className="hidden md:block">
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <ul className="menu bg-base-100 rounded-box">
                {categories.map((category) => (
                    <li key={category.id}>
                        <Link 
                        href={`/categories/${category.slug}`}
                        className={pathname.includes(`/categories/${category.slug}`) ? "active" : ""}
                        >
                            {category.name}
                            {category.children.length > 0 && (
                                <span className="badge badge-sm">{category.children.length}</span>
                            )}
                        </Link>
                        {category.children.length > 0 && (
                            <ul>
                                {category.children.map((child) => (
                                    <li key={child.id}>
                                        <Link
                                        href={`/categories/${child.slug}`}
                                        className={pathname.includes(`/categories/#{child.slug}`) ? "active" : ""}
                                        >
                                            {child.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}
