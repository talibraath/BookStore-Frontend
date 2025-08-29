import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Filter, Grid, List, ChevronLeft, ChevronRight,
  Info, Loader2, ShoppingCart, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { Book, Author, Category } from '@/types/api';

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

  // Summary modal
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [summaryText, setSummaryText] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string>('');

  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // URL filters
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedAuthor = searchParams.get('author') || '';
  const sortBy = searchParams.get('sort') || 'title';

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (query) newParams.set('search', query);
    else newParams.delete('search');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleAddToCart = (book: Book) => {
    addToCart(book, 1);
    toast({
      title: 'Added to cart',
      description: `${book.title} has been added to your cart.`,
    });
  };

  // Summary (ONLY Summary button)
  const openSummary = async (book: Book) => {
    setActiveBook(book);
    setSummaryText('');
    setSummaryError('');
    setSummaryOpen(true);
    setSummaryLoading(true);
    try {
      const res = await apiClient.getBookSummary(book.id);
      const text =
        (res as any)?.summary ??
        (res as any)?.data?.summary ??
        'No summary available.';
      setSummaryText(String(text));
    } catch (e) {
      console.error('summary error', e);
      setSummaryError('Failed to load summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const openDetails = (id: number) => {
    navigate(`/books/${id}`);
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-10">
        {/* Hero */}
        <section className="relative rounded-3xl overflow-hidden mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600" />
          <div className="relative px-6 py-12 md:px-10 md:py-16 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3">
                  <BookOpen className="h-9 w-9" /> Discover Your Next Read
                </h1>
                <p className="mt-3 text-white/90 max-w-2xl">
                  Explore by category or author, sort the list, and click a card to see more.
                </p>
              </div>
              {/* Search */}
              <div className="w-full md:w-[420px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80 h-4 w-4" />
                  <Input
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-white/95 border-white/40 text-gray-900 placeholder:text-gray-500 focus-visible:ring-white rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <div className="backdrop-blur bg-background/70 border rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Category */}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                <Select
                  value={selectedCategory || 'all'}
                  onValueChange={(v) => handleFilterChange('category', v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Author */}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Author</label>
                <Select
                  value={selectedAuthor || 'all'}
                  onValueChange={(v) => handleFilterChange('author', v === 'all' ? '' : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Authors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {authors.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Sort By</label>
                <Select value={sortBy} onValueChange={(v) => handleFilterChange('sort', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title A–Z</SelectItem>
                    <SelectItem value="price_low">Price: Low → High</SelectItem>
                    <SelectItem value="price_high">Price: High → Low</SelectItem>
                    <SelectItem value="date_new">Newest First</SelectItem>
                    <SelectItem value="date_old">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View toggle + count */}
              <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-3">
                <div className="text-sm text-muted-foreground">{totalCount} results</div>
                <div className="inline-flex rounded-lg overflow-hidden border">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className={`rounded-none ${viewMode === 'grid' ? '' : 'bg-transparent'}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className={`rounded-none ${viewMode === 'list' ? '' : 'bg-transparent'}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card shadow-sm p-4">
                <div className="bg-muted/70 rounded-xl h-72 w-full animate-pulse" />
                <div className="mt-4 h-4 w-3/4 bg-muted/70 rounded animate-pulse" />
                <div className="mt-2 h-3 w-1/2 bg-muted/60 rounded animate-pulse" />
                <div className="mt-6 h-9 w-full bg-muted/60 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-24">
            <Filter className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7"
            : "space-y-5"}
          >
            {books.map((book) => (
              <div
                key={book.id}
                className="group relative flex flex-col rounded-2xl bg-card shadow-sm transition-all duration-200 hover:shadow-xl border border-transparent hover:border-indigo-200"
              >
                {/* gradient border ring on hover */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition">
                  <div className="h-full w-full rounded-2xl ring-1 ring-inset ring-indigo-200/60" />
                </div>

                {/* Clickable area → details */}
                <button
                  className="w-full text-left"
                  onClick={() => openDetails(book.id)}
                  aria-label={`Open details for ${book.title}`}
                >
                  <div className="w-full aspect-[3/4] bg-muted overflow-hidden rounded-t-2xl">
                    <img
                      src={`https://picsum.photos/600/800?random=${book.title}`}
                      alt={book.title}
                      className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4">
                    {/* Category badge (if present) */}
                    {'category' in book && book.category && typeof book.category === 'object' && (
                      <span className="inline-block text-[11px] font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full mb-2">
                        {(book as any).category?.name ?? 'Category'}
                      </span>
                    )}
                    <h3 className="font-semibold text-base line-clamp-2">{book.title}</h3>
                    {book?.author && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {String(book.author)}
                      </p>
                    )}
                    {typeof (book as any)?.price !== 'undefined' && (
                      <p className="mt-2 font-semibold">${(book as any).price}</p>
                    )}
                  </div>
                </button>

                {/* Actions */}
                <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="sm" onClick={() => handleAddToCart(book)}>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to cart
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add this book to your cart</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => openSummary(book)}>
                        <Info className="h-4 w-4 mr-1" />
                        Summary
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>See a quick AI-generated summary</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Summary Modal */}
        <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-indigo-600">
                {activeBook ? activeBook.title : 'Book Summary'}
              </DialogTitle>
              {activeBook?.author && (
                <DialogDescription className="text-sm">
                  by <span className="font-medium">{String(activeBook.author)}</span>
                </DialogDescription>
              )}
            </DialogHeader>

            <Separator />

            {summaryLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : summaryError ? (
              <p className="text-destructive">{summaryError}</p>
            ) : (
              <ScrollArea className="max-h-[55vh] pr-2">
                <p className="leading-7 whitespace-pre-wrap">{summaryText}</p>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
    </TooltipProvider>
  );
}
