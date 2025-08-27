import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Author, PaginatedResponse } from '@/types/api';

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAuthors();
  }, [currentPage]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response: PaginatedResponse<Author> = await apiClient.getAuthors(currentPage);
      let filteredAuthors = response.results;

      // Client-side search filtering
      if (searchQuery) {
        filteredAuthors = filteredAuthors.filter(author =>
          author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (author.biography && author.biography.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setAuthors(filteredAuthors);
      setTotalPages(Math.ceil(response.count / 20));
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load authors. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would trigger a new API call with search parameters
    fetchAuthors();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Authors</h1>
        <p className="text-muted-foreground">
          Discover talented authors and explore their literary works
        </p>
      </div>

      {/* Search */}
      <div className="bg-secondary rounded-lg p-6 mb-8">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search authors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Authors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : authors.length === 0 ? (
        <div className="text-center py-16">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No authors found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search criteria' : 'No authors available at the moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {authors.map((author) => (
            <Card key={author.id} className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-accent transition-colors">
                    <Link to={`/authors/${author.id}`}>
                      {author.name}
                    </Link>
                  </CardTitle>
                  <User className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {author.biography ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {author.biography}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No biography available
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      <Book className="mr-1 h-3 w-3" />
                      Author
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/books?author=${author.id}`}>
                        View Books
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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