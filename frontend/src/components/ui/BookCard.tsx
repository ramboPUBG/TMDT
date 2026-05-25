import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  condition: string;
  imageUrl: string;
  sellerName: string;
}

export function BookCard({
  id,
  title,
  author,
  price,
  originalPrice,
  condition,
  imageUrl,
  sellerName,
}: BookCardProps) {
  const discount = originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  return (
    <Link href={`/books/${id}`} className="group relative bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Image Area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        {/* Replace with actual next/image when you have valid src */}
        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center text-muted-foreground/50">
           {imageUrl ? (
             <img src={imageUrl} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
           ) : (
             <span className="text-4xl">📚</span>
           )}
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <Badge variant="destructive" className="font-bold">
              -{discount}%
            </Badge>
          )}
          <Badge variant="secondary" className="bg-white/90 text-primary border border-primary/20 backdrop-blur-sm shadow-sm">
            {condition === 'like_new' ? 'Như mới' : 
             condition === 'good' ? 'Rất tốt' : 
             condition === 'fair' ? 'Khá' : 'Cũ'}
          </Badge>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors" title={title}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{author}</p>
        
        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-2">
            <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through mb-0.5">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              👤
            </div>
            <span className="truncate">{sellerName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
