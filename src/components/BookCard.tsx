import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Book } from '@/types/api';

interface BookCardProps {
  book: Book;
  onAddToCart?: (bookId: number, quantity: number) => void;
}

export function BookCard({ book, onAddToCart }: BookCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      addToCart(book, 1);
      if (onAddToCart) {
        await onAddToCart(book.id, 1);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  return (
    <Card className="group h-full flex flex-col shadow-book hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        {/* Book cover placeholder */}
        <div className="aspect-[3/4] bg-gradient-primary flex items-center justify-center text-primary-foreground p-4">
          <div className="text-center">
            <div className="text-lg font-bold leading-tight mb-2">{book.title}</div>
            <div className="text-sm opacity-80">{book.author_name || `Author ID: ${book.author}`}</div>
          </div>
        </div>
        
        {/* Stock badge */}
        {book.stock <= 5 && book.stock > 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Only {book.stock} left
          </Badge>
        )}
        
        {book.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Out of Stock
          </Badge>
        )}

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button variant="secondary" size="sm" asChild>
            <Link to={`/books/${book.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Quick View
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="flex-1 p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-accent transition-colors">
            <Link to={`/books/${book.id}`}>{book.title}</Link>
          </h3>
          
          <p className="text-sm text-muted-foreground">
            by {book.author_name || `Author ID: ${book.author}`}
          </p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{book.category_name || `Category ID: ${book.category}`}</span>
            <span>{formatDate(book.pub_date)}</span>
          </div>

          {book.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {book.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-accent">
              {formatPrice(book.price)}
            </span>
            <Badge variant="secondary" className="text-xs">
              Stock: {book.stock}
            </Badge>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={book.stock === 0 || isLoading}
            className="w-full"
            variant={book.stock === 0 ? "secondary" : "default"}
          >
            {isLoading ? (
              "Adding..."
            ) : book.stock === 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}