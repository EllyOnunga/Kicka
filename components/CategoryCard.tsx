import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/category";

export default function CategoryCard({ category }: { category: Category }) {
    return (
        <Link href={`/categories/$category.slug`}>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow h-full">
                <figure className="relative h-48">
                    {category.image_url ? (
                        <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-base-200 flex items-center justify-center">
                            <span className="text-gray-500">No image</span>
                        </div>
                    )}
                </figure>
                <div className="card-body">
                    <h2 className="card-title">{category.name}</h2>
                    <p className="line-clamp-2">{category.description}</p>
                    <div className="card-actions justify-end mt-4">
                        <button
                        className="btn btn-primary btn-sm">
                            View Products
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}