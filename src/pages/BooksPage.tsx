import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookCard } from '@/components/BookCard';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import type { Book, Author, Category, PaginatedResponse } from '@/types/api';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { addToCart } = useCart();
  const { toast } = useToast();

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedAuthor = searchParams.get('author') || '';
  const sortBy = searchParams.get('sort') || 'title';

  useEffect(() => {
    fetchData();
  }, [currentPage, searchQuery, selectedCategory, selectedAuthor, sortBy]);

  useEffect(() => {
    fetchFilters();
  }, []);
const PAGE_SIZE = 12;

const ordering = (() => {
  switch (sortBy) {
    case 'price_low': return 'price';
    case 'price_high': return '-price';
    case 'date_new': return '-pub_date';
    case 'date_old': return 'pub_date';
    default: return 'title';
  }
})();

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await apiClient.getBooks({
      page: currentPage,
      page_size: PAGE_SIZE,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      author: selectedAuthor || undefined,
      ordering,
    });

    setBooks(res.results);
    setTotalCount(res.count);
    setTotalPages(Math.max(1, Math.ceil(res.count / PAGE_SIZE)));
  } catch (error) {
    console.error('Error fetching books:', error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to load books. Please try again.',
    });
  } finally {
    setLoading(false);
  }
};

  const fetchFilters = async () => {
    try {
      const [authorsResponse, categoriesResponse] = await Promise.all([
        apiClient.getAuthors(),
        apiClient.getCategories(),
      ]);
      setAuthors(authorsResponse.results);
      setCategories(categoriesResponse.results);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleAddToCart = async (bookId: number, quantity: number) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      addToCart(book, quantity);
      toast({
        title: "Added to cart",
        description: `${book.title} has been added to your cart.`,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Books</h1>
        <p className="text-muted-foreground">
          Discover our vast collection of books across all genres
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-secondary rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

         {/* Category Filter */}
<Select
  value={selectedCategory || "all"}
  onValueChange={(value) => handleFilterChange("category", value === "all" ? "" : value)}
>
  <SelectTrigger>
    <SelectValue placeholder="All Categories" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Categories</SelectItem>
    {categories.map((category) => (
      <SelectItem key={category.id} value={category.id.toString()}>
        {category.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

{/* Author Filter */}
<Select
  value={selectedAuthor || "all"}
  onValueChange={(value) => handleFilterChange("author", value === "all" ? "" : value)}
>
  <SelectTrigger>
    <SelectValue placeholder="All Authors" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Authors</SelectItem>
    {authors.map((author) => (
      <SelectItem key={author.id} value={author.id.toString()}>
        {author.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="date_new">Newest First</SelectItem>
              <SelectItem value="date_old">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Mode Toggle and Results Count */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-muted-foreground">
          Showing {books.length} of {totalCount} books
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Books Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-96"></div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-12">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}