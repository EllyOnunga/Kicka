import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"

interface RatingProps {
    value: number;
    count?: number;
    className?: string;
}

export default function Rating({ value, count, className = ""} : RatingProps) {
    const stars = [];
    const fullStars = Math.floor(value)
    const hasHalfStar = value % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars.push(<FaStar key={i} className="text-yellow-400" />);
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
        } else {
            stars.push(<FaRegStar key={i} className="text-yellow-400" />);
        }
    }

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <div className="flex">{stars}</div>
            {count !== undefined && (
                <span className="text-sm text-gray-500 ml-1">({count})</span>
            )}
        </div>
    )
}