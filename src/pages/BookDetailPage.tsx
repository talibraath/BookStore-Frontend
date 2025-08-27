import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Calendar, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import type { Book, Author, Category } from '@/types/api';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const bookData = await apiClient.getBook(parseInt(id));
      setBook(bookData);

      // Fetch additional details (author and category info)
      // Note: In a real app, you might want to include this in the book response
      // or create separate endpoints for this data
    } catch (error) {
      console.error('Error fetching book details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load book details. Please try again.",
      });
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!book) return;

    setIsAddingToCart(true);
    try {
      addToCart(book, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} copy(s) of "${book.title}" added to your cart.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add book to cart.",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-8"></div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Book not found</h1>
        <Button asChild>
          <Link to="/books">Back to Books</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-8">
        <Link to="/books">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Book Cover */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-gradient-primary rounded-lg shadow-book flex items-center justify-center text-primary-foreground p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold leading-tight mb-4">{book.title}</h2>
              <p className="text-lg opacity-80">by Author ID: {book.author}</p>
            </div>
          </div>
          
          {/* Additional Images Placeholder */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted rounded border-2 border-transparent hover:border-accent cursor-pointer transition-colors">
              </div>
            ))}
          </div>
        </div>

        {/* Book Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">
              by Author ID: {book.author}
            </p>
            
            {/* Rating Placeholder */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.8) • 324 reviews</span>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-bold text-accent">{formatPrice(book.price)}</span>
              <Badge variant={book.stock > 10 ? "secondary" : book.stock > 0 ? "destructive" : "destructive"}>
                {book.stock > 10 ? "In Stock" : book.stock > 0 ? `Only ${book.stock} left` : "Out of Stock"}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Book Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Published: {formatDate(book.pub_date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Stock: {book.stock} available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Category:</span>
                  <Link to={`/books?category=${book.category}`} className="text-accent hover:underline">
                    Category ID: {book.category}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add to Cart Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="quantity">Quantity:</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={book.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(book.stock, parseInt(e.target.value) || 1)))}
                  className="w-20"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? "text-red-500" : ""}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={book.stock === 0 || isAddingToCart}
                className="flex-1"
                size="lg"
              >
                {isAddingToCart ? (
                  "Adding..."
                ) : book.stock === 0 ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                Buy Now
              </Button>
            </div>
          </div>

          {/* Shipping Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Free shipping on orders over $25</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">30-day return policy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Books Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">You might also like</h2>
        {/* TODO: Implement related books based on category or author */}
        <div className="text-center py-8 text-muted-foreground">
          Related books coming soon...
        </div>
      </div>
    </div>
  );
}